import data from './data.js';
import helpers from "../helpers.js";

const seg_count_top_el = document.getElementById('seg-count-top');
const seg_count_bot_el = document.getElementById('seg-count-bot');
const seg_ratio_el = document.getElementById('seg-ratio');
const vertices_el = document.getElementById('vertices');
const interpolation_count_el = document.getElementById('interpolation-count');

const {
   container,
   pointsHelper,
} = helpers;

const {
   max, min, PI, sin, cos, abs,
} = Math;

const clamp = (value, a, b) => max(a, min(b, value));
const normalize = (value, min, max) => (value - min) / (max - min);
const lerp = (a, b, t) => a + (b - a) * t;

let phiStart = 0, phiEnd = PI * 2;
let dist_x_b = 0, dist_x_t = 0, dist_y = 0;
let LERP_VALUE = 0;

let INTERPOLATION_COUNT = 5;

let show_vertices = false;

function extractPoints(data) {
   const { a, b } = data;

   const points = [
      a.x, a.y, a.z,
      b.x, b.y, b.z,
   ];

   return points;
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

      extruded_segments.push(...extruded_segment_0);
      extruded_segments.push(...extruded_segment_1);
   };

   return extruded_segments;
};

function generateIndices(segment_count) {
   const indices = [];

   for (let i = 0; i < segment_count * 2; i += 2) {
      const src_i = i * 2, dst_i = (i + 1) * 2;

      for (let j = 0; j < 1; j++) {
         const
            i0 = src_i + j,
            i1 = dst_i + j,
            i2 = src_i + j + 1,
            i3 = dst_i + j + 1;

         indices.push(
            i0, i2, i1,
            i1, i2, i3
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

function interpolate(data, lerp_value) {
   const {
      src_vertices, dst_vertices,
      inner_r, outer_r, target_r,
      inner_circle,
      vertices_ratio,
      } = data;

   // const lerp_value = LERP_VALUE;

   const int_vertices = [];

   const vec3 = new THREE.Vector3();

   const 
      p_outer = new THREE.Vector3(src_vertices[0], 0, src_vertices[2]),
      p_inner = new THREE.Vector3(dst_vertices[0], 0, dst_vertices[2]);

   vec3.lerpVectors(p_outer, p_inner, lerp_value);

   const dist = vec3.distanceTo(new THREE.Vector3(0, 0, 0));

   let start_n, end_n;

   const n = ~~(vertices_ratio / 2);

   [start_n, end_n] = vertices_ratio % 2 === 0 ? [n, n] : [n, n + 1];

   const 
      inner_ratio = 1 - (dist - inner_r) / (outer_r - inner_r),
      outer_ratio = 1 - (dist - target_r) / (inner_r - target_r);

   for (let i = 0; i < src_vertices.length; i += 3) {
      const src_point = new THREE.Vector3(src_vertices[i], src_vertices[i + 1], src_vertices[i + 2]);

      if (inner_r < dist) {
         for (let j = -start_n; j < end_n; j++) {
            let p = (i * vertices_ratio) + (j * 3);

            if (p < 0) p = dst_vertices.length + p;

            const dst_point = new THREE.Vector3(inner_circle[p], inner_circle[p + 1], inner_circle[p + 2]);

            vec3.lerpVectors(src_point, dst_point, inner_ratio);

            int_vertices.push(
               vec3.x,
               lerp(src_point.y, dst_vertices[p + 1], lerp_value),
               vec3.z,
            );
         };

         continue;
      };

      for (let j = -start_n; j < end_n; j++) {
         let p = (i * vertices_ratio) + (j * 3);

         if (p < 0) p = dst_vertices.length + p;

         const 
            src_point = new THREE.Vector3(inner_circle[p], inner_circle[p + 1], inner_circle[p + 2]),
            dst_point = new THREE.Vector3(dst_vertices[p], dst_vertices[p + 1], dst_vertices[p + 2]);

         vec3.lerpVectors(src_point, dst_point, outer_ratio);

         int_vertices.push(
            vec3.x,
            lerp(src_point.y, dst_vertices[p + 1], lerp_value),
            vec3.z,
         );
      };
   };

   return int_vertices;
};

function triangulate(vertices_count) {
   const OS = 2;

   const
      row_len = (vertices_count - 2) / INTERPOLATION_COUNT,
      half_row = row_len / 2;

   const indices = [];

   // first pass (2 to n connection)
   for (let i = 0, j = OS; i < half_row + 1; i++, j++) {
      const i0 = 0, i1 = j, i2 = (i == half_row) ? 1 : j + 1; 
      indices.push(i0 , i1, i2);
   };

   for (let i = 0, j = OS + half_row; i < row_len - half_row - 1; i++, j++) {
      const i0 = 1, i1 = j, i2 = j + 1;
      indices.push(i0, i1, i2);
   };

   // second pass (n to n connection)
   let j = 0;
   for (let i = 0; i < INTERPOLATION_COUNT - 1; i++) {
      for (j; j < (row_len - 1) + (row_len * i); j++) {
         const
            i0 = OS + j,
            i1 = OS + row_len + j,
            i2 = i1 + 1,
            i3 = i0 + 1;

         indices.push(
            i0, i1, i2,
            i0, i2, i3
         );
      };

      j++;
   };

   return indices;
};

function drawSegment(segments_vertices, indices) {
   const material = new THREE.MeshNormalMaterial({
      side: THREE.DoubleSide,
   });

   for (const vertices of segments_vertices) {
      const geometry = new THREE.BufferGeometry();
      geometry.setIndex(indices);
      geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
      geometry.computeVertexNormals();
      const mesh = new THREE.Mesh(geometry, material);
      container.add(mesh);
   };
};

function innerCircle(src_vertices, dst_vertices) {
   const 
      ps0 = new THREE.Vector3(src_vertices[0], 0, src_vertices[2]),
      ps1 = new THREE.Vector3(src_vertices[3], 0, src_vertices[5]),
      pd0 = new THREE.Vector3(dst_vertices[0], 0, dst_vertices[2]),
      origin = new THREE.Vector3(0, 0, 0),
      pm = new THREE.Vector3();

   pm.lerpVectors(ps0, ps1, 0.5);

   const
      inner_r = ~~pm.distanceTo(origin),
      outer_r = ~~ps0.distanceTo(origin),
      target_r = ~~pd0.distanceTo(origin);

   const scale_rate = inner_r / target_r;

   const inner_circle = [];

   for (let i = 0; i < dst_vertices.length; i += 3) {
      inner_circle.push(
         dst_vertices[i] * scale_rate,
         src_vertices[1],
         dst_vertices[i + 2] * scale_rate,
      );
   };

   return { inner_r, outer_r, target_r, inner_circle };
};

function removeDuplicates(vertices, precision = 1e-10) {
    const unique = [];
    
    for (let i = 0; i < vertices.length; i += 3) {
      const vertex = [vertices[i], vertices[i + 1], vertices[i + 2]];

      if (!unique.some(([x, y, z]) => 
         abs(x - vertex[0]) < precision &&
         abs(y - vertex[1]) < precision &&
         abs(z - vertex[2]) < precision
      )) {
         unique.push(vertex);
      };
    };
    
    return unique.flat();
};

function determinateVertices(src_vertices, int_vertices, dst_vertices, is_even) {
   const output_vertices = [];

   const 
      src_len = src_vertices.length / 3,
      int_len = int_vertices[0].length / 3,
      ratio = int_len / src_len,
      hf_ratio = ratio / 2,
      hf_ratio_min = ~~(ratio / 2),
      hf_ratio_max = hf_ratio_min + 1;

      const 
         p0 = new THREE.Vector3(),
         p1 = new THREE.Vector3(),
         pm = new THREE.Vector3(),
         ps = new THREE.Vector3();

   for (let i = 0, j = 0; i < src_len * 2; i += 2, j++) {
      const i0 = j * 3, i1 = ((j + 1) == src_len) ? 0 : (j + 1) * 3;

      output_vertices.push([
         src_vertices[i0],
         src_vertices[i0 + 1],
         src_vertices[i0 + 2],
         src_vertices[i1],
         src_vertices[i1 + 1],
         src_vertices[i1 + 2],
      ]);
   };

   if (is_even) {
      int_vertices.push([...dst_vertices.splice(-hf_ratio * 3), ...dst_vertices])

      for (let i = 0; i < INTERPOLATION_COUNT; i++) {
         const vertices = int_vertices[i];

         const i0 = (hf_ratio - 1) * 3, i1 = hf_ratio * 3;

         p0.set(vertices[i0], vertices[i0 + 1], vertices[i0 + 2]);
         p1.set(vertices[i1], vertices[i1 + 1], vertices[i1 + 2]);
         ps.lerpVectors(p0, p1, 0.5);
         pm.copy(ps);

         let j, k;

         for (j = 0; j < src_len - 1; j++) {
            const offset = (j * ratio) + (ratio / 2);

            output_vertices[j].push(pm.x, pm.y, pm.z);

            for (k = offset; k < offset + ratio; k++) {
               const i0 = k * 3;
               output_vertices[j].push(vertices[i0], vertices[i0 + 1], vertices[i0 + 2]);
            };

            const i0 = (k - 1) * 3, i1 = k * 3;

            p0.set(vertices[i0], vertices[i0 + 1], vertices[i0 + 2]);
            p1.set(vertices[i1], vertices[i1 + 1], vertices[i1 + 2]);
            pm.lerpVectors(p0, p1, 0.5);

            output_vertices[j].push(pm.x, pm.y, pm.z);
         };

         output_vertices[j].push(pm.x, pm.y, pm.z);

         for (let i = -hf_ratio; i < hf_ratio; i++) {
            const i0 = i * 3;
            output_vertices[j].push(vertices.at(i0), vertices.at(i0 + 1), vertices.at(i0 + 2));
         };

         output_vertices[j].push(ps.x, ps.y, ps.z);
      };

      return output_vertices;
   };

   int_vertices.push([...dst_vertices.splice(-hf_ratio_min * 3), ...dst_vertices])

   for (let i = 0; i < INTERPOLATION_COUNT; i++) {
      const vertices = int_vertices[i];

      let j;

      for (j = 0; j < src_len - 1; j++) {
         const 
            offset = hf_ratio_min + (ratio * j),
            limit = ratio * (1 + j) + hf_ratio_min;

         for (let k = offset; k < limit + 1; k++) {
            const i0 = k * 3;
            output_vertices[j].push(vertices[i0], vertices[i0 + 1], vertices[i0 + 2]);
         };
      };

      for (let i = -hf_ratio_max; i < hf_ratio_max; i++) {
         const i0 = i * 3;
         output_vertices[j].push(vertices.at(i0), vertices.at(i0 + 1), vertices.at(i0 + 2));
      };
   };

   return output_vertices;
};

function update(input_data = data) {
   dist_x_b = 0, dist_x_t = 0, dist_y = 0;

   let _last_vertices;

   for (const segment_data of input_data) {
      const
         points = extractPoints(segment_data),
         { texture_name, segment_count, closure_type } = segment_data,
         vertices = radialExtrude(points, segment_count);

      const
         indices = generateIndices(segment_count),
         uvs = generateUVs(vertices, segment_count);

      mapping(vertices, indices, uvs, texture_name);

      if (closure_type) {
         let src_vertices = [], dst_vertices = [];

         let phi = 0;

         const vertices_ratio = vertices.length / _last_vertices.length;

         if (vertices_ratio % 1 !== 0) {
            console.warn(`The number of vertices is not proportional: ${vertices.length} / ${_last_vertices.length} = ${vertices_ratio}`);
         };

         let is_even = false;

         // rotation angle alignment for uniform interpolation
         if (vertices_ratio % 2 == 0) {
            is_even = true;
            phi = PI / segment_count;
         };

         for (let i = 0; i < _last_vertices.length; i += 6) {
            src_vertices.push(
               _last_vertices[i + 3],
               _last_vertices[i + 4],
               _last_vertices[i + 5],
            );
         };

         for (let i = 0; i < vertices.length; i += 6) {
            const
               x = vertices[i],
               y = vertices[i + 1],
               z = vertices[i + 2];

            const
               nx = x * cos(phi) + z * sin(phi),
               nz = -x * sin(phi) + z * cos(phi);

            dst_vertices.push(nx, y, nz);
         };

         // VERTICES MERGING (TEST)
         {
            src_vertices = removeDuplicates(src_vertices);
            dst_vertices = removeDuplicates(dst_vertices);

            const { target_r, inner_r, outer_r, inner_circle } = innerCircle(src_vertices, dst_vertices);

            const data = { src_vertices, inner_circle, dst_vertices, inner_r, outer_r, target_r, vertices_ratio };

            const SEGMENTS_COUNT = 1 / INTERPOLATION_COUNT;

            const int_vertices = [];

            for (let i = SEGMENTS_COUNT; i < 1; i += SEGMENTS_COUNT) {
               const lerp_value = i;
               int_vertices.push(interpolate(data, lerp_value));
            };

            const segments_vertices = determinateVertices(src_vertices, int_vertices, dst_vertices, is_even);


            const indices = triangulate(segments_vertices[0].length / 3);
            
            drawSegment(segments_vertices, indices);

            if (show_vertices) {
               // pointsHelper(new Float32Array(src_vertices), 0x000000, 20);
               // for (const vertices of int_vertices) {
               for (const vertices of segments_vertices) {
                  pointsHelper(new Float32Array(vertices), 0x000000, 20);
               };
               // pointsHelper(new Float32Array(dst_vertices), 0x000000, 20);
            };
         };
         // VERTICES MERGING (TEST)
      };

      _last_vertices = vertices;
   };
};

function latheGeometry(input_data = data) {
   const { scene } = THREE_APP.system;
   update();
   scene.add(container);
};

let seg_count_bot = 4;
let seg_count_top = 12;

function updateRatio() {
   seg_ratio_el.innerText = `Segment Ratio ${seg_count_top} / ${seg_count_bot} = ${seg_count_top / seg_count_bot}`;
};

{
   seg_count_top_el.addEventListener('input', ev => {
      const value = Number(ev.target.value);
      data[1].segment_count = value;
      seg_count_top = value;
      container.clear();
      update(data);
      window.render.update();
      updateRatio();
   });

   seg_count_bot_el.addEventListener('input', ev => {
      const value = Number(ev.target.value);
      data[0].segment_count = value;
      data[1].segment_count = value * 3;
      seg_count_top = value * 3;
      seg_count_bot = value;
      seg_count_top_el.setAttribute('step', value);
      seg_count_top_el.setAttribute('min', value);
      seg_count_top_el.setAttribute('value', value * 3);
      container.clear();
      update(data);
      window.render.update();
      updateRatio();
   });

   interpolation_count_el.addEventListener('input', ev => {
      const value = Number(ev.target.value);
      INTERPOLATION_COUNT = value;
      container.clear();
      update(data);
      window.render.update();
      updateRatio();
   });

   vertices_el.addEventListener('click', ev => {
      vertices_el.classList.toggle("active");
      show_vertices = !show_vertices;
      container.clear();
      update(data);
      window.render.update();
   });

   updateRatio();
   vertices_el.click();
}

export default latheGeometry;