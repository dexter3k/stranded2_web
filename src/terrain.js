function Terrain(driver, data) {
	this.size = data.size;
	this.points = data.data;

	this.driver = driver;
	this.dirty = true;
	this.buffer = null;
	this.elements = 0;

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
			const points = new Float32Array(this.elements * 3);
			let i = 0;
			const scale = 32.0;
			const addPoint = (x, z) => {
				points[i++] = x;
				points[i++] = this.points[x + z * (this.size + 1)] * scale;
				points[i++] = z;
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
			console.log(points);
			gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);

			console.log("Got render buffer!");

			this.dirty = false;
		}

		console.log(this.buffer);
		console.log(this.buffer.length);

		return {
			buffer: this.buffer,
			count:  this.elements,
		};
	}
}
