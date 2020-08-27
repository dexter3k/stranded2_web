precision mediump float;

uniform vec3      baseColor;
uniform sampler2D colorMap;
uniform sampler2D detailMap;
uniform sampler2D highResMap;

varying vec2 texCoords;

void main() {
	vec3 col = vec3(1.0, 1.0, 1.0);
	col = col * baseColor;
	col = col * texture2D(colorMap, texCoords).xyz;
	col = col * texture2D(detailMap, texCoords * 64.0).xyz;
	col = col * texture2D(highResMap, texCoords * 64.0).xyz;
	col *= 2.0;
	gl_FragColor = vec4(col, 1.0);
}
