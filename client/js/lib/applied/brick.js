const brick = {
   init,
};

function init() {
   const { scene, renderer } = THREE_APP.system;

   const textureLoader = new THREE.TextureLoader();

   const brick_texture = textureLoader.load('/assets/brick.jpeg', () => {
      window.render.update();
   });
   const brick_bump = textureLoader.load('/assets/bump.jpeg', () => {
      window.render.update();
   });
   const brick_displacement = textureLoader.load('/assets/displacement.jpeg', () => {
      window.render.update();
   });

   brick_texture.colorSpace = THREE.SRGBColorSpace;
   brick_texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

   const material = new THREE.MeshStandardMaterial({ 
      map: brick_texture,
      bumpMap:  brick_bump,
      bumpScale: 5,
      roughness: 0.5,
      metalness: 0.04,
    });

   const geometry = new THREE.BoxGeometry(2, 2, 2);
   const cube = new THREE.Mesh(geometry, material);

   scene.add(cube);
};

export default brick;