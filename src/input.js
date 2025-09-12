class Input {
	constructor(eventSource) {
		this.enabled = true;
		this.lastMouseX = null;
		this.lastMouseY = null;
		this.mouseDeltaX = 0;
		this.mouseDeltaY = 0;
		this.justPressed = [false, false, false];
		this.justReleased = [false, false, false];
		this.isPressed = [false, false, false];

		// Prevent context menu from showing up when right clicking
		eventSource.oncontextmenu = (e) => {
			e.preventDefault();
		}
		eventSource.onmousedown = (e) => {
			this.onMouseDown(e.button, e.offsetX, e.offsetY);
		}
		eventSource.onmouseup = (e) => {
			this.onMouseUp(e.button, e.offsetX, e.offsetY);
		}
		eventSource.onmousemove = (e) => {
			this.onMouseMove(e.offsetX, e.offsetY);
		}
	}

	updatePostRender() {
		this.lastMouseX = this.getMouseX();
		this.lastMouseY = this.getMouseY();
		this.mouseDeltaX = 0;
		this.mouseDeltaY = 0;

		for (let i = 0; i < 3; i++) {
			this.justPressed[i] = false;
			this.justReleased[i] = false;
		}
	}

	getMouseX() {
		return (this.lastMouseX || 0) + this.mouseDeltaX;
	}

	getMouseY() {
		return (this.lastMouseY || 0) + this.mouseDeltaY;
	}

	wasLeftMouseButtonJustPressed() {
		return this.justPressed[0];
	}

	wasLeftMouseButtonJustReleased() {
		return this.justReleased[0];
	}

	wasRightMouseButtonJustPressed() {
		return this.justPressed[2];
	}

	wasRightMouseButtonJustReleased() {
		return this.justReleased[2];
	}

	isLeftMouseButtonPressed() {
		return this.isPressed[0];
	}

	isRightMouseButtonPressed() {
		return this.isPressed[2];
	}

	onMouseDown(b, x, y) {
		this.onMouseMove(x, y);
		if (b < 0 || b > 2) {
			return;
		}
		this.justPressed[b] = true;
		this.isPressed[b] = true;
	}

	onMouseUp(b, x, y) {
		this.onMouseMove(x, y);
		if (b < 0 || b > 2) {
			return;
		}
		this.justReleased[b] = true;
		this.isPressed[b] = false;
	}

	onMouseMove(x, y) {
		this.lastMouseX = this.lastMouseX || x;
		this.lastMouseY = this.lastMouseY || y;

		this.mouseDeltaX = x - this.lastMouseX;
		this.mouseDeltaY = y - this.lastMouseY;
	}

	enable() {
		this.enabled = true;
	}

	disable() {
		this.enabled = false;
	}
}