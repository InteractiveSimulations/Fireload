varying vec2 vTexCoords;

void main(){

    vTexCoords = uv;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

}
