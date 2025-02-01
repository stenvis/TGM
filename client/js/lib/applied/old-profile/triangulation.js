import helpers from "./helpers.js";

const {
   normalMaterial,
   container,
   pointsHelper,
} = helpers;

const triangulation = {
   triangulate,
};

let dist_x = 0, dist_y = 0;

function generateClosureVertices(profiles_arr) {
   const vertices = [];

   for (let i = 0; i < profiles_arr.length; i++) {
      const profile_arr  = profiles_arr[i];
      vertices.push(...profile_arr);
      vertices.push(profile_arr[0]);
      vertices.push(profile_arr[1]);
      vertices.push(profile_arr[2]);
   };

   pointsHelper(new Float32Array(vertices));

   return vertices;
};

function generateBaseVertices(profiles_arr, si, ei) {
   const vertices = [];

   for (let i = 0; i < profiles_arr.length; i++) {
      const profile_arr  = profiles_arr[i];
      for (let j = si; j < ei; j++) {
         vertices.push(profile_arr[j]);
      };
   };

   pointsHelper(new Float32Array(vertices));

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

function mapping(vertices, indices, uvs) {
   const geometry = new THREE.BufferGeometry();

   geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
   geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));
   geometry.setIndex(indices);

   const textureLoader = new THREE.TextureLoader();

   // const texture = textureLoader.load('https://threejs.org/examples/textures/uv_grid_opengl.jpg', () => {
   //    window.render.update();
   // });

   const texture = textureLoader.load('/assets/brick.jpeg', () => {
      window.render.update();
   });

   texture.wrapS = THREE.RepeatWrapping;
   texture.wrapT = THREE.RepeatWrapping;
   const 
      geometryWidth = dist_x,
      geometryHeight = dist_y,
      aspect = dist_x / dist_y,
      basis_width = 2 * aspect,
      basis_height = 2,
      xR = geometryWidth / basis_width * aspect,
      yR = geometryHeight / basis_height;

   // console.log('dist x, y:', dist_x, dist_y);
   // console.log('aspect:', aspect);
   texture.repeat.set(aspect, 1);
   // texture.repeat.set(xR, yR);

   const material = new THREE.MeshBasicMaterial({ 
      map: texture,
      side: THREE.DoubleSide,
   });

   const mesh = new THREE.Mesh(geometry, material);

   container.add(mesh);
};

function baseMapping(vertices, indices, uvs, texture_name) {
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

   // console.log('dist x, y:', dist_x, dist_y);
   // console.log('aspect:', aspect);
   texture.repeat.set(aspect, 1);
   // texture.repeat.set(xR, yR);

   const material = new THREE.MeshBasicMaterial({ 
      map: texture,
      side: THREE.DoubleSide,
   });

   const mesh = new THREE.Mesh(geometry, material);

   container.add(mesh);
};

function triangulate(profiles_arr, textures_indices) {
   dist_x = 0; dist_y = 0;

   if (textures_indices.length) {
      const
         profiles_len = profiles_arr.length;

      for (const texture_data of textures_indices) {
         const { start_i, end_i, texture_name } = texture_data;
         const
            vertices_len = end_i - start_i;

         const
            vertices = generateBaseVertices(profiles_arr, start_i * 3, end_i * 3),
            indices = generateIndices(profiles_len, vertices_len),
            uvs = generateUVs(vertices, profiles_len, textures_indices);

         // console.log(texture_name, vertices, indices, uvs);

         baseMapping(vertices, indices, uvs, texture_name);
      };
      return;
   };

   const
      profiles_len = profiles_arr.length,
      vertices_len = (profiles_arr[0].length / 3) + 1;

   const
      vertices = generateClosureVertices(profiles_arr),
      indices = generateIndices(profiles_len, vertices_len),
      uvs = generateUVs(vertices, profiles_len, textures_indices);

   mapping(vertices, indices, uvs);
   // normalMaterial(vertices, indices);
};

export default triangulation;