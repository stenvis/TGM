class Resize {
  #renderer;
  #canvas;
  #camera;

  constructor({ renderer, camera }, canvas) {
    this.#renderer = renderer;
    this.#camera = camera;
    this.#canvas = canvas;
  }

  check() {
    const width = this.#canvas.clientWidth, height = this.#canvas.clientHeight;
    this.#camera.aspect = width / height;
    this.#camera.updateProjectionMatrix();
    this.#renderer.setSize(width, height, false);
    this.#renderer.setPixelRatio(window.devicePixelRatio);
  }
};
 
export default Resize;