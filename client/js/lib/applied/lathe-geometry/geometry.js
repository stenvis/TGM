import data from './data.js';
import helpers from "../helpers.js";

// const segments_count_el = document.getElementById('segments_count');
// const start_phi_el = document.getElementById('start_phi');
// const end_phi_el = document.getElementById('end_phi');

const {
   container,
   pointsHelper,
} = helpers;

const {
   max, min, PI, sin, cos,
} = Math;

const clamp = (value, a, b) => max(a, min(b, value));
const normalize = (value, min, max) => (value - min) / (max - min);

const DEFAULT_TEXTURE_NAME = 'brick';

let phiStart = 0, phiEnd = PI * 2;

let dist_x_b = 0, dist_x_t = 0, dist_y = 0;

function extractData(data) {
   const points = [], textures_indices = [];

   let _last_texture = null;

   const { a, segment_count } = data[0];

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

   return { points, textures_indices, segment_count };
};

function radialExtrude(points, segment_count) {
   const extruded_segments = [];

   const inverseSegments = 1 / segment_count;
   const phiLength = clamp(phiEnd, 0, PI * 2);

   for (let i = 0; i < segment_count; i++) {
      const 
         phi_0 = phiStart + i * inverseSegments * phiLength,
         phi_1 = phiStart + (i + 1) * inverseSegments * phiLength;

      const 
         extruded_segment_0 = [],
         extruded_segment_1 = [];


      for (let j = 0; j < points.length; j += 3) {
         {
            const
               x = points[j] * sin(phi_0),
               y = points[j + 1],
               z = points[j] * cos(phi_0);

            extruded_segment_0.push(x, y, z);
         }

         {
            const
               x = points[j] * sin(phi_1),
               y = points[j + 1],
               z = points[j] * cos(phi_1);

            extruded_segment_1.push(x, y, z);
         }
      };

      extruded_segments.push(extruded_segment_0);
      extruded_segments.push(extruded_segment_1);
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

function generateIndices(vertices_len, segment_count) {
   const indices = [];

   for (let i = 0; i < segment_count * 2; i += 2) {
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

function generateUVs(vertices, segment_count) {
   const uvs = [];

   const
      point_bottom_0 = new THREE.Vector3(vertices[0], vertices[1], vertices[2]),
      point_bottom_1 = new THREE.Vector3(vertices[6], vertices[7], vertices[8]),
      point_top_0 = new THREE.Vector3(vertices[3], vertices[4], vertices[5]),
      point_top_1 = new THREE.Vector3(vertices[9], vertices[10], vertices[11]);

   dist_x_b = point_bottom_0.distanceTo(point_bottom_1);
   dist_x_t = point_top_0.distanceTo(point_top_1);
   dist_y = point_bottom_0.distanceTo(point_top_0);

   if (dist_x_b > dist_x_t) {
      const 
         dbx = 1 / segment_count,
         dtx = normalize(dist_x_t, 0, dist_x_b) / segment_count,
         dt = (dbx - dtx) / 2;

      for (let i = 0; i < segment_count; i++) {
         const 
            p0 = i * dbx,
            p1 = dt + (i * dbx),
            p2 = (i + 1) * dbx,
            p3 = p2 - dt;

         uvs.push(
            p0, 0,
            p1, 1,
            p2, 0,
            p3, 1,
         );
      };

      return uvs;
   };

   const
      dbx = 1 / segment_count,
      dtx = normalize(dist_x_b, 0, dist_x_t) / segment_count,
      dt = (dbx - dtx) / 2;

   for (let i = 0; i < segment_count; i++) {
      const
         p0 = i * dbx,
         p1 = dt + (i * dbx),
         p2 = (i + 1) * dbx,
         p3 = p2 - dt;

      uvs.push(
         p1, 0,
         p0, 1,
         p3, 0,
         p2, 1,
      );
   };

   return uvs;
};

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

   // const aspect = dist_x_b / dist_y;

   // texture.repeat.set(1, 1 / aspect);

   const material = new THREE.MeshBasicMaterial({ 
      map: texture,
      side: THREE.DoubleSide,
   });

   const mesh = new THREE.Mesh(geometry, material);

   container.add(mesh);
};

function clearDist() {
   dist_x_b = 0, dist_x_t = 0, dist_y = 0;
};

function update(input_data = data) {
   clearDist();

   // for (const segment_data of input_data) {
   //    const { points, textures_indices, segment_count } = extractData(segment_data);
   //    console.log('data', points, textures_indices, segment_count);
   // };

   const { points, textures_indices, segment_count } = extractData(input_data);
   const extruded_segments = radialExtrude(points, segment_count);

   console.log(points, segment_count);

   // for (const texture_data of textures_indices) {
   //    const 
   //       start_i = texture_data[0],
   //       end_i = texture_data[1] + 1,
   //       texture_name = texture_data[2];

   //    const
   //       vertices_len = end_i - start_i;

   //    const
   //       vertices = generateVertices(extruded_segments, start_i * 3, end_i * 3),
   //       indices = generateIndices(vertices_len, segment_count),
   //       uvs = generateUVs(vertices, segment_count);

   //    mapping(vertices, indices, uvs, texture_name);
   // };
};

function latheGeometry(input_data = data) {
   const { scene } = THREE_APP.system;
   update();
   scene.add(container);
};

// {
//    segments_count_el.addEventListener('input', ev => {
//       SEGMENTS_COUNT = Number(ev.target.value);
//       container.clear();
//       update();
//       window.render.update();
//    });

//    start_phi_el.addEventListener('input', ev => {
//       phiStart = Number(ev.target.value);
//       container.clear();
//       update();
//       window.render.update();
//    });

//    end_phi_el.addEventListener('input', ev => {
//       phiEnd = Number(ev.target.value);
//       container.clear();
//       update();
//       window.render.update();
//    });
// }

export default latheGeometry;