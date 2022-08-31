varying vec2 vTexCoords;

/*!
  @authors Steffen-Sascha Stein, David Palm
  Parallax Mapping vertex shader.
 */

void main(){

    vTexCoords = uv;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

}