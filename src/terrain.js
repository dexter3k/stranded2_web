// Classical Möller–Trumbore algorithm, optimized for the vertical only intersection
function verticallyIntersectTriangle(x, z, v0, v1, v2) {
	const inf = 100000; // infinitely large value
	const O = vec3.fromValues(x, inf, z);
	const d = vec3.fromValues(0, -1, 0);

	const e1 = vec3.subtract(vec3.create(), v1, v0);
	const e2 = vec3.subtract(vec3.create(), v2, v0);

	const h = vec3.cross(vec3.create(), d, e2);
	const a = vec3.dot(e1, h);
	const epsilon = 0.0000001;
	if (a > -epsilon && a < epsilon) {
		return null;
	}

	const f = 1/a;
	const s = vec3.subtract(vec3.create(), O, v0);
	const u = f * vec3.dot(s, h);
	if (u < 0.0 || u > 1.0) {
		return null;
	}

	const q = vec3.cross(vec3.create(), s, e1);
	const v = f * vec3.dot(d, q);
	if (v < 0.0 || u + v > 1.0) {
		return null;
	}


	const t = f * vec3.dot(e2, q);
	return O[1] + d[1] * t;
}

function Terrain(driver, data) {
	this.size = data.size;
	this.points = data.data;

	this.driver = driver;
	this.dirty = true;
	this.buffer = null;
	this.elements = 0;

	this.getPoint = function(x, z) {
		if (x > this.size || z > this.size || x < 0 || z < 0) {
			return null;
		}
		return this.points[x + z * (this.size + 1)];
	}

	this.getHeight = function(x, z) {
		if (x < 0 || z < 0 || x >= this.size || z >= this.size) {
			return 0;
		}
		const cellX = Math.floor(x);
		const cellZ = Math.floor(z);
		x -= cellX;
		z -= cellZ;
		if ((cellX&1) == (cellZ&1)) {
			// [/] cell, /] part
			let h = verticallyIntersectTriangle(x, z,
				vec3.fromValues(0, this.getPoint(cellX+0, cellZ+0), 0),
				vec3.fromValues(1, this.getPoint(cellX+1, cellZ+0), 0),
				vec3.fromValues(1, this.getPoint(cellX+1, cellZ+1), 1));
			if (h == null) {
				// [/ part
				h = verticallyIntersectTriangle(x, z,
					vec3.fromValues(0, this.getPoint(cellX+0, cellZ+0), 0),
					vec3.fromValues(0, this.getPoint(cellX+0, cellZ+1), 1),
					vec3.fromValues(1, this.getPoint(cellX+1, cellZ+1), 1));
			}
			return h;
		} else {
			// [\] cell, \] part
			let h = verticallyIntersectTriangle(x, z,
				vec3.fromValues(0, this.getPoint(cellX+0, cellZ+1), 1),
				vec3.fromValues(1, this.getPoint(cellX+1, cellZ+0), 0),
				vec3.fromValues(1, this.getPoint(cellX+1, cellZ+1), 1));
			if (h == null) {
				// [/ part
				h = verticallyIntersectTriangle(x, z,
					vec3.fromValues(0, this.getPoint(cellX+0, cellZ+1), 1),
					vec3.fromValues(0, this.getPoint(cellX+0, cellZ+0), 0),
					vec3.fromValues(1, this.getPoint(cellX+1, cellZ+0), 0));
			}
			return h;
		}
	}

	// todo: also generate normals
	this.getRenderData = function() {
		const gl = driver.gl;

		if (this.dirty) {
			if (this.buffer !== null) {
				gl.deleteBuffer(this.buffer);
				this.buffer = null;
			}
			this.buffer = gl.createBuffer();

			gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
			// Two triangles per cell, 
			this.elements = this.size * this.size * 2 * 3;
			const points = new Float32Array(this.elements * 5);
			let i = 0;
			const scale = 1.0;
			const addPoint = (x, z) => {
				points[i++] = x;
				points[i++] = this.points[x + z * (this.size + 1)] * scale;
				points[i++] = z;
				points[i++] = x / (this.size); // u
				points[i++] = z / (this.size); // v
			}

			for (let x = 0; x < this.size; x++) {
				for (let z = 0; z < this.size; z++) {
					if ((x&1) == (z&1)) {
						// [/] cell, /] part
						addPoint(x + 0, z + 0);
						addPoint(x + 1, z + 0);
						addPoint(x + 1, z + 1);

						// [/ part
						addPoint(x + 0, z + 1);
						addPoint(x + 0, z + 0);
						addPoint(x + 1, z + 1);
					} else {
						// [\] cell, \] part
						addPoint(x + 0, z + 1);
						addPoint(x + 1, z + 0);
						addPoint(x + 1, z + 1);

						// [\ part
						addPoint(x + 0, z + 1);
						addPoint(x + 0, z + 0);
						addPoint(x + 1, z + 0);
					}
				}
			}
			gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);

			this.dirty = false;
		}

		return {
			buffer: this.buffer,
			count:  this.elements,
		};
	}
}
