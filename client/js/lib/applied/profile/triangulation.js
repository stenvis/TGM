import helpers from "./helpers.js";

const {
   normalMaterial,
} = helpers;

const triangulation = {
   triangulate,
};

function generateVertices(profiles_arr) {
   const vertices = [];

   for (let i = 0; i < profiles_arr.length; i++) {
      vertices.push(...profiles_arr[i]);
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
            i0, i1, i2,
            i2, i1, i3,
         );
      };

      const j = vertices_len - 1;

      const
         i0 = src_i + j,
         i1 = dst_i + j,
         i2 = src_i + j + 1;

      indices.push(
         i0, i1, src_i,
         src_i, i1, i2,
         // 14, 29, 0,
         // 0, 29, 15, 
      );
   };

   // indices.push(
   //    0, 15, 1,
   //    1, 15, 16,

   //    1, 16, 2, 
   //    2, 16, 17,

   //    2, 17, 3,
   //    3, 17, 18,
   // );

   return indices;
};

function triangulate(profiles_arr) {
   const
      profiles_len = profiles_arr.length,
      vertices_len = profiles_arr[0].length / 3;

   const
      vertices = generateVertices(profiles_arr),
      indices = generateIndices(profiles_len, vertices_len);

   normalMaterial(vertices, indices);
};

export default triangulation;