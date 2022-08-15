varying vec2 vTexCoord;
void main(void){
    vTexCoord = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
