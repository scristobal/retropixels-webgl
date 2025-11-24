#version 300 es

// Triangle strip
//
//  A - - - C
//  | 1   / |
//  |   /   |
//  | /   2 |
//  B - - - D
//
vec4 v_vertData[4] = vec4[](
//          x     y    u    v
    vec4(-1.0,  1.0, 0.0, 1.0),   // A
    vec4(-1.0, -1.0, 0.0, 0.0),   // B
    vec4( 1.0,  1.0, 1.0, 1.0),   // C
    vec4( 1.0, -1.0, 1.0, 0.0)    // D
);

out vec2 v_texCoord;

void main() {
    gl_Position = vec4(v_vertData[gl_VertexID].xy, 0.0, 1.0);
    v_texCoord = v_vertData[gl_VertexID].zw;
}
