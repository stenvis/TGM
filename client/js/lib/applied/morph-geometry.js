import helpers from "./helpers.js";

const interpolation_el = document.getElementById('interpolation');

const {
   container,
   pointsHelper,
} = helpers;

// const src_vertices = [
//    1000, 0, 1000,
//    -1000, 0, -1000,
//    1000, 0, -1000,
//    -1000, 0, 1000,
// ];

const src_vertices = [
   1000, 0, 1000,
   -1000, 0, 1000,
   -1000, 0, -1000,
   1000, 0, -1000,
];

const int_vertices = [];

const dst_vertices = [];

let LERP_VALUE = 0;

const 
   RADIUS = 1000,
   SEGMENTS_COUNT = 12,
   HEIGHT = 2000;
   // HEIGHT = 200;

for (let i = 0; i < SEGMENTS_COUNT; i++) {
    const 
      angle = ((i / SEGMENTS_COUNT) * Math.PI * 2) + (Math.PI / SEGMENTS_COUNT),
      x = Math.cos(angle) * RADIUS,
      y = HEIGHT,
      z = Math.sin(angle) * RADIUS;

    dst_vertices.push(x, y, z);
};

function interpolate() {
   const vertices_ratio = dst_vertices.length / src_vertices.length;
   // 3

   const vec3 = new THREE.Vector3();

   for (let i = 0; i < src_vertices.length; i += 3) {
      const src_point = new THREE.Vector3(src_vertices[i], src_vertices[i + 1], src_vertices[i + 2]);

      for (let j = i * vertices_ratio; j < (i + 3) * vertices_ratio; j += 3) {
         const dst_point = new THREE.Vector3(dst_vertices[j], dst_vertices[j + 1], dst_vertices[j + 2]);

         vec3.lerpVectors(src_point, dst_point, LERP_VALUE);

         int_vertices.push(
            vec3.x,
            vec3.y,
            vec3.z,
         );
      };
   };
};

function interpolate_test(lerp_value) {
   const vertices_ratio = dst_vertices.length / src_vertices.length;
   // 3

   const vec3 = new THREE.Vector3();

   for (let i = 0; i < src_vertices.length; i += 3) {
      const src_point = new THREE.Vector3(src_vertices[i], src_vertices[i + 1], src_vertices[i + 2]);

      for (let j = i * vertices_ratio; j < (i + 3) * vertices_ratio; j += 3) {
         const dst_point = new THREE.Vector3(dst_vertices[j], dst_vertices[j + 1], dst_vertices[j + 2]);

         vec3.lerpVectors(src_point, dst_point, lerp_value);

         int_vertices.push(
            vec3.x,
            vec3.y,
            vec3.z,
         );
      };
   };
};

function update() {
   interpolate();
   // interpolate_test(0.2);
   // interpolate_test(0.4);
   // interpolate_test(0.6);
   // interpolate_test(0.8);
   pointsHelper(new Float32Array(src_vertices), 0x000000, 100);
   pointsHelper(new Float32Array(int_vertices), 0x000000, 100);
   pointsHelper(new Float32Array(dst_vertices), 0x000000, 100);
};

function morphGeometry() {
   const { scene } = THREE_APP.system;

   update();

   scene.add(container);
};

{
   interpolation_el.addEventListener('input', ev => {
      int_vertices.length = 0;
      LERP_VALUE = Number(ev.target.value);
      container.clear();
      update();
      window.render.update();
   });
}

export default morphGeometry;