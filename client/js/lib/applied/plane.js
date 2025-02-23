const plane = {
   init,
};

const vertices = [
   -1000, -1000, 0,
   -500, 500, 0,
   500, 500, 0,
   1000, -1000, 0,
];

const indices = [
   0, 1, 2,
   0, 2, 3,
];

const uvs = [
   0, 0,
   0.25, 1,
   0.75, 1,
   // 0, 1,
   // 1, 1,
   1, 0,
];

function init() {
   const { scene } = THREE_APP.system;

   const geometry = new THREE.BufferGeometry();

   geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
   geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));
   geometry.setIndex(indices);
   geometry.computeVertexNormals();

   const textureLoader = new THREE.TextureLoader();

   const texture = textureLoader.load(`/assets/uv_grid.jpeg`, () => {
      window.render.update();
   });

   texture.wrapS = THREE.RepeatWrapping;
   texture.wrapT = THREE.RepeatWrapping;

   const material = new THREE.MeshBasicMaterial({ 
      map: texture,
      side: THREE.DoubleSide,
   });

   const mesh = new THREE.Mesh(geometry, material);

   scene.add(mesh);
};

export default plane;