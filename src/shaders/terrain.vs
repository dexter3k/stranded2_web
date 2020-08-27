attribute vec3 pos;
attribute vec2 uv;

uniform mat4 modelView;
uniform mat4 projection;

varying mediump vec2 texCoords;

void main() {
	gl_Position = projection * modelView * vec4(pos, 1.0);
	texCoords = vec2(uv.x, 1.0 - uv.y);
}
