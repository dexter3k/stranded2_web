function ModelTexture(path) {
	this.path = path;
	this.id = 0;
	this.flags = 1;
	this.blend = 2;
	this.pos = [0, 0];
	this.scale = [1, 1];
	this.rot = 0;
}

function loadTEXSChunk(stream) {
	let texs = [];
	while (stream.remaining() != 0) {
		let t = new ModelTexture(stream.readZeroTerminatedString());
		t.flags = stream.readInt();
		t.blend = stream.readInt();
		t.pos[0] = stream.readFloat();
		t.pos[1] = stream.readFloat();
		t.scale[0] = stream.readFloat();
		t.scale[1] = stream.readFloat();
		t.rot = stream.readFloat();
		if (t.rot == null) {
			return null;
		}
		texs.push(t);
	}
	return texs;
}

function ModelBrush(name) {
	this.name = name;
	this.color = [1, 1, 1, 1];
	this.specular = 0;
	this.blend = 1;
	this.effects = 0;
	this.textures = [];
}

function loadBRUSChunk(stream) {
	const ntexs = stream.readInt();
	let brushes = [];
	while (stream.remaining() != 0) {
		let b = new ModelBrush(stream.readZeroTerminatedString());
		b.color[0] = stream.readFloat();
		b.color[1] = stream.readFloat();
		b.color[2] = stream.readFloat();
		b.color[3] = stream.readFloat();
		b.specular = stream.readFloat();
		b.blend = stream.readInt();
		b.effects = stream.readInt();
		for (let i = 0; i < ntexs; i++) {
			b.textures.push(stream.readInt());
		}
		if (b.textures[ntexs-1] == null) {
			return null;
		}
		brushes.push(b);
	}
	return brushes;
}

function ModelNode(name) {
	this.name = name;
	this.pos = [0, 0, 0];
	this.scale = [1, 1, 1];
	this.rot = [1, 0, 0, 0];
	this.kind = "pivot";
	this.vertices = null;
	this.meshes = null;
	this.triangleBuffers = [];
	this.keys = null;
	this.animation = null;
	this.children = [];
}

function ModelVertexData() {
	this.normals = false;
	this.color = false;
	this.textures = 0;
	this.doubleUV = false;
	this.stride = 3*4;
	this.data = [];
	this.buffer = 0;
}

function loadVRTSChunk(stream) {
	const flags = stream.readInt();
	if (flags == null) {
		return null;
	}

	let v = new ModelVertexData();

	if (flags - 0x1 >= 0) {
		v.normals = true;
	}
	if (flags - 0x2 >= 0) {
		v.color = true;
	}
	v.textures = stream.readInt();
	if (v.textures == null || v.textures < 0 || v.textures > 8) {
		return null;
	}

	const coordCount = stream.readInt();
	if (coordCount != 0 && coordCount != 2 && coordCount != 4) {
		return null;
	}
	if (v.textures != 0 && coordCount == 0) {
		return null;
	}
	if (coordCount == 4) {
		v.doubleUV = true;
	}

	v.stride += coordCount*v.textures*4;
	if (v.normals) {
		v.stride += 3*4;
	}
	if (v.color) {
		v.stride += 4*4;
	}

	while (stream.remaining() != 0) {
		v.data.push(stream.readFloat());
	}

	if (v.data[v.data.length-1] == null) {
		return null;
	}

	return v;
}

function loadTRISChunk(stream) {
	const brush = stream.readInt();
	let data = [];
	if (brush == null) {
		return [null, null];
	}
	while (stream.remaining() != 0) {
		data.push(stream.readInt());
	}
	if (data[data.length-1] == null) {
		return [null, null];
	}
	return [data, brush];
}

function loadMESHChunk(stream) {
	const masterBrush = stream.readInt();
	if (masterBrush == null) {
		return [null, null];
	}

	let vertices = null;
	let meshes = {};
	while (stream.remaining() != 0) {
		const [tag, substream] = stream.readTag();
		if (tag == null) {
			return [null, null];
		}

		if (tag == "VRTS") {
			if (vertices != null) {
				console.log("Multiple VRTS chunks on MESH");
				return [null, null];
			}
			vertices = loadVRTSChunk(substream);
			if (vertices == null) {
				return [null, null];
			}
		} else if (tag == "TRIS") {
			let [data, brush] = loadTRISChunk(substream);
			if (data == null || brush == null) {
				return [null, null];
			}
			if (brush < 0) {
				brush = masterBrush;
			}
			if (brush >= 0) {
				if (meshes[brush] == undefined) {
					meshes[brush] = data;
				} else {
					meshes[brush] = meshes[brush].concat(data);
				}
			}
		}
	}

	return [vertices, meshes];
}

function loadNODEChunk(stream) {
	let node = new ModelNode(stream.readZeroTerminatedString());
	node.pos[0] = stream.readFloat();
	node.pos[1] = stream.readFloat();
	node.pos[2] = stream.readFloat();
	node.scale[0] = stream.readFloat();
	node.scale[1] = stream.readFloat();
	node.scale[2] = stream.readFloat();
	node.rot[0] = stream.readFloat();
	node.rot[1] = stream.readFloat();
	node.rot[2] = stream.readFloat();
	node.rot[3] = stream.readFloat();
	if (node.rot[3] == null) {
		return null;
	}

	while (stream.remaining() != 0) {
		const [tag, substream] = stream.readTag();
		if (tag == null) {
			return null;
		}

		if (tag == "MESH") {
			if (node.kind != "pivot") {
				console.log("MESH or BONE specified on non-pivot: " + node.kind);
				return null;
			}
			node.kind = "mesh";
			[node.vertices, node.meshes] = loadMESHChunk(substream);
			if (node.vertices == null || node.meshes == null) {
				return null;
			}
		}
	}

	return node;
}

function Model(path, driver) {
	this.path = path;
	this.driver = driver;

	this.textures = null;
	this.brushes = null;
	this.root = null;

	this.loadBB3DChunk = function(stream) {
		stream.readInt(); // skip version

		while (stream.remaining()) {
			const [tag, substream] = stream.readTag();
			if (tag == null) {
				return null;
			}

			if (tag == "TEXS") {
				if (this.textures != null) {
					console.log("Duplicate TEXS chunk inside BB3D");
					return;
				}
				this.textures = loadTEXSChunk(substream);
			} else if (tag == "BRUS") {
				if (this.brushes != null) {
					console.log("Duplicate BRUS chunk inside BB3D");
					return;
				}
				this.brushes = loadBRUSChunk(substream);
			} else if (tag == "NODE") {
				if (this.root != null) {
					console.log("Duplicate NODE chunk inside BB3D");
					return;
				}
				this.root = loadNODEChunk(substream);
			}
		}

		if (this.textures == null || this.brushes == null || this.root == null) {
			console.log("Broken BB3D chunk");
			return;
		}
	};

	this.load = async function() {
		const data = await loadBinaryAsset("assets/Stranded II/" + path);
		const stream = new BinaryStream(data);
		
		const [tag, substream] = stream.readTag();
		if (tag != "BB3D") {
			console.log("Broken .b3d model");
			return;
		}

		this.loadBB3DChunk(substream);
	};
}
