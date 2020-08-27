precision mediump float;

uniform float     mapScale;
uniform sampler2D colorMap;
uniform sampler2D detailMap;
uniform sampler2D highResMap;

varying vec2 texCoords;

void main() {
	float amb = 0.941176471;
	vec3 col = vec3(1.0, 1.0, 1.0);
	col = col * amb;
	col = col * texture2D(colorMap, texCoords).xyz;
	col = col * texture2D(detailMap, texCoords * mapScale * 1.0).xyz;
	col = col * texture2D(highResMap, texCoords * mapScale * 1.0).xyz;
	col *= 2.0;
	gl_FragColor = vec4(col, 1.0);
}
