function Camera(fov, aspect) {
	this.fov    = fov;
	this.aspect = aspect;
	this.near   = 0.1;
	this.far    = 10000.0;

	this.pos   = [0.0, 0.0, 0.0];
	this.yaw   = 0.0;
	this.pitch = 0.0;

	this.move = function(forward, right) {
		const yaw = (this.yaw) / 180.0 * Math.PI;
		const pitch = (this.pitch) / 180.0 * Math.PI;

		this.pos[2] -= Math.sin(yaw - Math.PI / 2) * forward;
		this.pos[0] -= Math.cos(yaw - Math.PI / 2) * forward;

		this.pos[2] += Math.sin(yaw) * right;
		this.pos[0] += Math.cos(yaw) * right;

		this.pos[1] -= Math.sin(pitch) * forward;
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
