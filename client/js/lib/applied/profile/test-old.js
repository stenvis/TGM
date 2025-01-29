import helpers from "./helpers.js";
import triangulation from "./triangulation.js";

const {
   pointsHelper,
   container,
} = helpers;

const vertices = [
   -1,  2,  0, // 0
    1,  0,  0, // 1
    0, -2,  0, // 2
   -2, -2,  0, // 3
   -3, -1,  0, // 4
   -3,  1,  0, // 5

   -1,  2,  0, // 6 

   -1,  2,  -7, // 7
    1,  0,  -7, // 8
    0, -2,  -7, // 9
   -2, -2,  -7, // 10
   -3, -1,  -7, // 11
   -3,  1,  -7, // 12

   -1,  2,  -7, // 13

   // -1,  2,  -14, // 14 
   //  1,  0,  -14, // 15 
   //  0, -2,  -14, // 16 
   // -2, -2,  -14, // 17
   // -3, -1,  -14, // 18
   // -3,  1,  -14, // 19

   // -1,  2,  -14, // 20 
];

const indices = [
   0, 1, 7,
   7, 1, 8,

   1, 2, 8,
   8, 2, 9,

   2, 3, 9,
   9, 3, 10,

   3, 4, 10,
   10, 4, 11,

   4, 5, 11,
   11, 5, 12,

   5, 6, 12,
   12, 6, 13,

   // 7, 8, 14,
   // 14, 8, 15,

   // 8, 9, 15,
   // 15, 9, 16,

   // 9, 10, 16,
   // 16, 10, 17,

   // 10, 11, 17,
   // 17, 11, 18,

   // 11, 12, 18,
   // 18, 12, 19,

   // 12, 13, 19,
   // 19, 13, 20,
];

function normalize(value, min, max) {
   return (value - min) / (max - min);
};

let dist_x = 0, dist_y = 0;

function generateUVs() {
   const uvs = [];

   const PROFILE_COUNT = 2;

   let min_x = 0, min_y = 0;

   const 
      values_x = [],
      values_y = [];

   const len = vertices.length / 3;

   for (let i = 0; i < PROFILE_COUNT - 1; i++) {
      const ci = len * i, ni = len * (i + 1);
      const
         cx = vertices[ci],
         cy = vertices[ci + 1],
         cz = vertices[ci + 2],
         nx = vertices[ni],
         ny = vertices[ni + 1],
         nz = vertices[ni + 2];

      const 
         pA = new THREE.Vector3(cx, cy, cz),
         pB = new THREE.Vector3(nx, ny, nz),
         dist = pA.distanceTo(pB);

      values_x.push(dist);
      dist_x += dist
   };

   for (let i = 0; i < (vertices.length / PROFILE_COUNT) - 3; i+=3) {
      const
         cx = vertices[i],
         cy = vertices[i + 1],
         cz = vertices[i + 2],
         nx = vertices[i + 3],
         ny = vertices[i + 4],
         nz = vertices[i + 5];

      const 
         pA = new THREE.Vector3(cx, cy, cz),
         pB = new THREE.Vector3(nx, ny, nz),
         dist = pA.distanceTo(pB);

      values_y.push(dist);
      dist_y += dist;
   };

   let value_x = 0;

   for (let i = 0; i < PROFILE_COUNT; i++) {
      uvs.push(
         value_x, 0,
      );

      let value_y = 0;

      for (let j = 0; j < (vertices.length / PROFILE_COUNT) - 6; j+=3) {
         value_y += normalize(values_y[j / 3], min_y, dist_y);
         uvs.push(value_x, value_y);
      };

      uvs.push(
         value_x, 1,
      );

      value_x += normalize(values_x[i], min_x, dist_x);
   };

   console.log('uvs', uvs);

   return uvs;
};

function test() {
   const { scene } = THREE_APP.system;

   const geometry = new THREE.BufferGeometry();

   const uvs = generateUVs();

   pointsHelper(new Float32Array(vertices), 0x000000, 0.3);
   scene.add(container);

   geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
   geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));
   geometry.setIndex(indices);

   geometry.computeVertexNormals();

   const textureLoader = new THREE.TextureLoader();
   // const texture = textureLoader.load('https://threejs.org/examples/textures/uv_grid_opengl.jpg', () => {
   //    window.render.update();
   // });
   const texture = textureLoader.load('/assets/brick.jpeg', () => {
      window.render.update();
   });

   texture.wrapS = THREE.RepeatWrapping;
   texture.wrapT = THREE.RepeatWrapping;
   const geometryWidth = dist_x;
   const geometryHeight = dist_y;
   const aspect = dist_x / dist_y;
   const basis_width = 2 * aspect;
   const basis_height = 2;
   const xR = geometryWidth / basis_width;
   const yR = geometryHeight / basis_height;

   texture.repeat.set(xR, yR);

   const material = new THREE.MeshBasicMaterial({ 
   // const material = new THREE.MeshNormalMaterial({ 
      map: texture,
      side: THREE.DoubleSide,
   });

   const mesh = new THREE.Mesh(geometry, material);
   scene.add(mesh);
};

export default test;