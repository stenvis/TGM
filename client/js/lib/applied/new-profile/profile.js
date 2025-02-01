import profile_data_test from "./profile-data.js";
import axis_data_test from "./axis-data.js";

const
   basis_x = new THREE.Vector3(1, 0, 0),
   basis_y = new THREE.Vector3(0, 1, 0),
   basis_z = new THREE.Vector3(0, 0, 1),
   transform_mat4 = new THREE.Matrix4(),
   quaternion = new THREE.Quaternion(),
   vertex = new THREE.Vector3(),
   vertex_next = new THREE.Vector3(),
   dir = new THREE.Vector3();

const cross_projections = [], ortho_projections_0 = [], ortho_projections_1 = [], dirs_0 = [], dirs_1 = [];

let dist_x = 0, dist_y = 0;

function firstProjection(profile_arr, axis) {
   const current_axis = axis[0], next_axis = axis[1];

   dir.subVectors(next_axis, current_axis).normalize();

   quaternion.setFromUnitVectors(basis_z, dir.clone().negate());
   applyQuaternionToBasis(quaternion);

   transform_mat4.makeBasis(basis_x, basis_y, basis_z);

   const clone_arr = new Float32Array(profile_arr);

   for (let i = 0; i < clone_arr.length; i += 3) {
      const
         x = clone_arr[i],
         y = clone_arr[i + 1],
         z = clone_arr[i + 2];

      vertex.set(x, y, z)
         .applyMatrix4(transform_mat4)
         .add(current_axis);

      clone_arr[i] = vertex.x;
      clone_arr[i + 1] = vertex.y;
      clone_arr[i + 2] = vertex.z;
   };

   dirs_0.push(basis_z.clone());

   ortho_projections_0.push(clone_arr);
};

function closestPointBetweenRays(P1, D1, P2, D2) {
    const 
      w0 = P1.clone().sub(P2),
      a = D1.dot(D1),
      b = D1.dot(D2),
      c = D2.dot(D2),
      d = D1.dot(w0),
      e = D2.dot(w0);

    const denominator = a * c - b * b;

    if (Math.abs(denominator) < 1e-6) {
      // console.log('Forward direction');
      return P2;
    };

    const 
      t1 = (b * e - c * d) / denominator,
      t2 = (a * e - b * d) / denominator;

    const 
      pointOnRay1 = P1.clone().add(D1.clone().multiplyScalar(t1)),
      pointOnRay2 = P2.clone().add(D2.clone().multiplyScalar(t2));

    return pointOnRay1.add(pointOnRay2).multiplyScalar(.5);
};

function applyQuaternionToBasis(quaternion) {
   basis_z.applyQuaternion(quaternion);
   basis_x.applyQuaternion(quaternion);
   basis_y.applyQuaternion(quaternion);
};

function orthoProjections(profile_arr, axis) {
   for (let i = 1; i < axis.length; i++) {
      const
         current_axis = axis[i],
         next_axis = axis[i + 1] || current_axis;

      dir.subVectors(next_axis, current_axis).normalize();

      quaternion.setFromUnitVectors(basis_z, dir.clone().negate());
      applyQuaternionToBasis(quaternion);

      transform_mat4.makeBasis(basis_x, basis_y, basis_z);

      const 
         p0_arr = new Float32Array(profile_arr),
         p1_arr = new Float32Array(profile_arr.length);

      for (let i = 0; i < p0_arr.length; i += 3) {
         const
            x = p0_arr[i],
            y = p0_arr[i + 1],
            z = p0_arr[i + 2];

         vertex.set(x, y, z).applyMatrix4(transform_mat4);
         vertex_next.copy(vertex);
         vertex.add(current_axis);
         vertex_next.add(next_axis);

         p0_arr[i] = vertex.x;
         p0_arr[i + 1] = vertex.y;
         p0_arr[i + 2] = vertex.z;

         p1_arr[i] = vertex_next.x;
         p1_arr[i + 1] = vertex_next.y;
         p1_arr[i + 2] = vertex_next.z;
      };

      dirs_0.push(basis_z.clone().negate());
      dirs_1.push(basis_z.clone());

      ortho_projections_0.push(p0_arr);
      ortho_projections_1.push(p1_arr);
   };
};

function crossProjections() {
   cross_projections.push(ortho_projections_0[0]);

   for (let i = 0; i < ortho_projections_0.length - 2; i++) {
      const src_arr = ortho_projections_0[i], dst_arr = ortho_projections_1[i]; 
      const src_dir = dirs_0[i], dst_dir = dirs_1[i];

      const new_arr = new Float32Array(src_arr.length);

      if (!dst_dir) return;

      for (let i = 0; i < src_arr.length; i += 3) {
         const
            sx = src_arr[i],
            sy = src_arr[i + 1],
            sz = src_arr[i + 2];

         const
            dx = dst_arr[i],
            dy = dst_arr[i + 1],
            dz = dst_arr[i + 2];

         vertex.set(sx, sy, sz);
         vertex_next.set(dx, dy, dz);

         const new_vertex = closestPointBetweenRays(vertex, src_dir, vertex_next, dst_dir);

         new_arr[i] = new_vertex.x;
         new_arr[i + 1] = new_vertex.y;
         new_arr[i + 2] = new_vertex.z;
      };

      cross_projections.push(new_arr);
   };

   cross_projections.push(ortho_projections_1[ortho_projections_1.length - 1]);
};

function generateVertices(profiles_arr, si, ei) {
   const vertices = [];

   for (let i = 0; i < profiles_arr.length; i++) {
      const profile_arr = profiles_arr[i];
      for (let j = si; j < ei; j++) {
         vertices.push(profile_arr[j]);
      };
   };

   return vertices;
};

function generateIndices(profiles_len, vertices_len) {
   const indices = [];

   for (let i = 0; i < profiles_len - 1; i++) {
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

function normalize(value, min, max) {
   return (value - min) / (max - min);
};

function generateUVs(vertices, profiles_len) {
   const uvs = [];

   const PROFILE_COUNT = profiles_len;

   let min_x = 0, min_y = 0;

   const 
      values_x = [],
      values_y = [];

   const len = (vertices.length / 3) / PROFILE_COUNT;

   for (let i = 0; i < PROFILE_COUNT - 1; i++) {
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
      let value_y = 0;

      for (let j = 0; j < vertices.length / PROFILE_COUNT; j += 3) {
         uvs.push(value_x, value_y);
         value_y += normalize(values_y[j / 3], min_y, dist_y);
      };

      value_x += normalize(values_x[i], min_x, dist_x);
   };

   return uvs;
};

function mapping(vertices, indices, uvs, texture_name) {
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

   const 
      aspect = dist_x / dist_y;

   texture.repeat.set(aspect, 1);

   const material = new THREE.MeshBasicMaterial({ 
      map: texture,
      side: THREE.DoubleSide,
   });

   const mesh = new THREE.Mesh(geometry, material);

   // container.add(mesh);
};

function extractPoints(profile_data) {
   const points = [], textures_indices = [];

   let _last_texture = null;

   const { a } = profile_data[0];

   points.push(a.x, a.y, a.z);

   for (let i = 0; i < profile_data.length; i++) {
      let { b, texture } = profile_data[i];

      texture = texture || 'brick';

      points.push(b.x, b.y, b.z);

      if (_last_texture == texture) {
         const li = textures_indices.length - 1;
         textures_indices[li][1] = i + 1;
         continue;
      };

      textures_indices.push([i, i + 1, texture]);
      _last_texture = texture;
   };

   return { points: new Float32Array(points), textures_indices };
};

function extrude3D(profile_data = profile_data_test, axis_data = axis_data_test) {
   const { scene } = THREE_APP.system;
   const { points, textures_indices } = extractPoints(profile_data);

   firstProjection(points, axis_data);
   orthoProjections(points, axis_data);
   crossProjections();

   const
      profiles_len = cross_projections.length;

   for (const texture_data of textures_indices) {
      const 
         start_i = texture_data[0],
         end_i = texture_data[1] + 1,
         texture_name = texture_data[2];

      const
         vertices_len = end_i - start_i;

      const
         vertices = generateVertices(cross_projections, start_i * 3, end_i * 3),
         indices = generateIndices(profiles_len, vertices_len),
         uvs = generateUVs(vertices, profiles_len, textures_indices);

      // mapping(vertices, indices, uvs, texture_name);
   };
};

export default extrude3D;