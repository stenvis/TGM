import data from './data.js';
import helpers from "../helpers.js";

const segments_count_el = document.getElementById('segments_count');
const start_phi_el = document.getElementById('start_phi');
const end_phi_el = document.getElementById('end_phi');

const {
   container,
} = helpers;

const {
   max, min, PI, sin, cos,
} = Math;

const clamp = (value, a, b) => max(a, min(b, value));
const normalize = (value, min, max) => (value - min) / (max - min);

const DEFAULT_TEXTURE_NAME = 'brick';

let SEGMENTS_COUNT = 20;

let phiStart = 0, phiEnd = PI * 2;

let dist_x = 0, dist_y = 0;

function extractData(data) {
   const points = [], textures_indices = [];

   let _last_texture = null;

   const { a } = data[0];

   points.push(a.x, a.y, a.z);

   for (let i = 0; i < data.length; i++) {
      let { b, texture } = data[i];

      texture = texture || DEFAULT_TEXTURE_NAME;

      points.push(b.x, b.y, b.z);

      if (_last_texture == texture) {
         const li = textures_indices.length - 1;
         textures_indices[li][1] = i + 1;
         continue;
      };

      textures_indices.push([i, i + 1, texture]);
      _last_texture = texture;
   };

   return { points, textures_indices };
};

function radialExtrude(points) {
   const extruded_segments = [];

   const inverseSegments = 1 / SEGMENTS_COUNT;
   const phiLength = clamp(phiEnd, 0, PI * 2);

   for ( let i = 0; i <= SEGMENTS_COUNT; i++) {
      const phi = phiStart + i * inverseSegments * phiLength;

      const extruded_segment = [];

      for ( let j = 0; j < points.length; j += 3) {
         const
            x = points[j] * sin(phi),
            y = points[j + 1],
            z = points[j] * cos(phi);

         extruded_segment.push(x, y, z);
      };

      extruded_segments.push(extruded_segment);
   };

   return extruded_segments;
};

function generateVertices(points, si, ei) {
   const vertices = [];

   for (let i = 0; i < points.length; i++) {
      const profile_arr = points[i];
      for (let j = si; j < ei; j++) {
         vertices.push(profile_arr[j]);
      };
   };

   return vertices;
};

function generateIndices(vertices_len) {
   const indices = [];

   for (let i = 0; i < SEGMENTS_COUNT; i++) {
      const src_i = i * vertices_len, dst_i = (i + 1) * vertices_len;

      for (let j = 0; j < vertices_len - 1; j++) {
         const
            i0 = src_i + j,
            i1 = dst_i + j,
            i2 = src_i + j + 1,
            i3 = dst_i + j + 1;

         indices.push(
            i0, i2, i1,
            i1, i2, i3,
         );
      };
   };

   return indices;
};

function generateUVs(vertices) {
   const uvs = [];

   let min_x = 0, min_y = 0;

   const
      values_x = [],
      values_y = [];

   const len = (vertices.length / 3) / (SEGMENTS_COUNT + 1);

   for (let i = 0; i < SEGMENTS_COUNT; i++) {
      const ci = len * i * 3, ni = len * (i + 1) * 3;

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

   for (let i = 0; i < (vertices.length / (SEGMENTS_COUNT + 1)) - 3; i+=3) {
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

   for (let i = 0; i <= SEGMENTS_COUNT; i++) {
      let value_y = 0;

      for (let j = 0; j < vertices.length / (SEGMENTS_COUNT + 1); j += 3) {
         uvs.push(value_x, value_y);
         value_y += normalize(values_y[j / 3], min_y, dist_y);
      };

      value_x += normalize(values_x[i], min_x, dist_x);
   };

   return uvs;
};

// function mapping(vertices, indices) {
//    const geometry = new THREE.BufferGeometry();

//    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
//    geometry.setIndex(indices);
//    geometry.computeVertexNormals();

//    const material = new THREE.MeshNormalMaterial({
//       side: THREE.DoubleSide,
//    });

//    const mesh = new THREE.Mesh(geometry, material);

//    container.add(mesh);
// };

function mapping(vertices, indices, uvs, texture_name = 'uv_grid') {
   const geometry = new THREE.BufferGeometry();

   geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
   geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));
   geometry.setIndex(indices);

   const textureLoader = new THREE.TextureLoader();

   const texture = textureLoader.load(`/assets/${texture_name}.jpeg`, () => {
      window.render.update();
   });

   texture.wrapS = THREE.RepeatWrapping;
   texture.wrapT = THREE.RepeatWrapping;

   const aspect = dist_x / dist_y;

   texture.repeat.set(aspect, 1);

   const material = new THREE.MeshBasicMaterial({ 
      map: texture,
      side: THREE.DoubleSide,
   });

   const mesh = new THREE.Mesh(geometry, material);

   container.add(mesh);
};

function update(input_data = data) {
   dist_x = 0; dist_y = 0;

   const { points, textures_indices } = extractData(input_data);
   const extruded_segments = radialExtrude(points);

   for (const texture_data of textures_indices) {
      const 
         start_i = texture_data[0],
         end_i = texture_data[1] + 1,
         texture_name = texture_data[2];

      const
         vertices_len = end_i - start_i;

      const
         vertices = generateVertices(extruded_segments, start_i * 3, end_i * 3),
         indices = generateIndices(vertices_len),
         uvs = generateUVs(vertices, textures_indices);

      mapping(vertices, indices, uvs, texture_name);
   };
};

function latheGeometry(input_data = data) {
   const { scene } = THREE_APP.system;
   update();
   scene.add(container);
};

{
   segments_count_el.addEventListener('input', ev => {
      SEGMENTS_COUNT = Number(ev.target.value);
      container.clear();
      update();
      window.render.update();
   });

   start_phi_el.addEventListener('input', ev => {
      phiStart = Number(ev.target.value);
      container.clear();
      update();
      window.render.update();
   });

   end_phi_el.addEventListener('input', ev => {
      phiEnd = Number(ev.target.value);
      container.clear();
      update();
      window.render.update();
   });
}

export default latheGeometry;