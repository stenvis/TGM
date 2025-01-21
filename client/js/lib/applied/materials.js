import { RGBELoader } from '/dependencies/three/RGBELoader.js';

const materials = {
   init,
};

const path = new THREE.CurvePath();

// Приклад простого шляху: змішане коло та спіраля
const curve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-5, 0, 0),
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(5, 0, 0),
]);

path.add(curve);  // Додати криву в шлях

const rgbeLoader = new RGBELoader();
const textureLoader = new THREE.TextureLoader();

function init() {
   const { scene } = THREE_APP.system;

   let hdr_map;

   rgbeLoader.load('/assets/hdr-2.hdr', texture => {
      texture.encoding = THREE.RGBEEncoding;
      texture.mapping = THREE.EquirectangularReflectionMapping;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;

      hdr_map = texture;

      const brick_bump = textureLoader.load('/assets/metal.jpeg', () => {
         window.render.update();

         const geometry = new THREE.TubeGeometry(path, 100, 1, 100, false);
         const material = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            // color: 0xaaaaaa,
            // color: 0xbad0e0,
            side: THREE.DoubleSide,
            // metalness: .8,
            // roughness: 0.1,
            map: brick_bump,
            // bumpMap:  brick_bump,
            // bumpScale: 5,
            // envMap: hdr_map,
            // envMapIntensity: 1.0,
         });

         const mesh = new THREE.Mesh( geometry, material );
         scene.add( mesh );
      });
   });
};

export default materials;