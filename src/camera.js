function Camera(fov, aspect) {
	this.fov    = fov;
	this.aspect = aspect;
	this.near   = 0.1;
	this.far    = 10000.0;

	this.pos   = [0.0, 0.0, 0.0];
	this.yaw   = 0.0;
	this.pitch = 0.0;

	this.movementSpeed = 1.0;

	this.move = function(forward, right, dt) {
		const yaw = (this.yaw) / 180.0 * Math.PI;
		const pitch = (this.pitch) / 180.0 * Math.PI;

		let dz = -Math.sin(yaw - Math.PI / 2) * forward;
		let dx = -Math.cos(yaw - Math.PI / 2) * forward;

		dz += Math.sin(yaw) * right;
		dx += Math.cos(yaw) * right;

		let dy = -Math.sin(pitch) * forward;

		let d = [dx, dy, dz];
		vec3.normalize(d, d);
		d[0] *= dt * this.movementSpeed;
		d[1] *= dt * this.movementSpeed;
		d[2] *= dt * this.movementSpeed;
		vec3.add(this.pos, this.pos, d);
	};

	this.buildProjection = function() {
		const fov_rad = this.fov / 180.0 * Math.PI;
		const projection = mat4.create();
		mat4.perspective(projection, fov_rad, this.aspect, this.near, this.far);

		// Classical OpenGL software uses a coordinate system where Z points backwards
		// Stranded II has Z pointing forward, so we're going to do some changes to fix that
		projection[10] = -projection[10]; // zf / (zf - zn) vs zf / (zn - zf)
		projection[11] = -projection[11]; // 1 vs -1

		return projection;
	};

	this.buildView = function() {
		const view = mat4.create();
		// note that we're inverting pitch rotation
		mat4.rotate(view, view, this.pitch / 180.0 * Math.PI, [-1.0, 0.0, 0.0]);
		mat4.rotate(view, view, this.yaw   / 180.0 * Math.PI, [0.0, 1.0, 0.0]);
		mat4.translate(view, view, [-this.pos[0], -this.pos[1], -this.pos[2]]);

		return view;
	};
};
