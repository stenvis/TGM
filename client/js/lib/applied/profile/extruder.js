import helpers from "./helpers.js";
import triangulation from "./triangulation.js";

const {
   pointsHelper,
   pathHelper,
   container,
   arrowHelper,
} = helpers;

const extruder = {
   extrude,
};

// ------------------------------- TESTS ------------------------------------

const axis = [
   { x: 0, y: 0, z: 0, },
   { x: 10, y: 0, z: 0, },
   { x: 15, y: 10, z: 0, },
   { x: 10, y: 10, z: 10, },
   { x: 10, y: 20, z: 10, },
   { x: 0, y: 20, z: 20, },
];

// const axis = [ 
//    { x: 0, y: 0, z: 0, },
//    { x: 0, y: 0, z: 10, },
//    { x: 0, y: 10, z: 0, },
//    { x: 10, y: 10, z: 0, },
//    { x: 10, y: 20, z: 0, },
//    { x: 2, y: 15, z: 0, },
// ];

// const axis = [
   // { x: 0, y: 0, z: 0, },

   // { x: -10, y: 0, z: 0 },
   // { x: 10, y: 0, z: 0 },
   // { x: 0, y: 10, z: 0 },
   // { x: 0, y: -10, z: 0 },
   // { x: 0, y: 0, z: -10 },
   // { x: 0, y: 0, z: 10 },

   // { x: -30, y: -10, z: -10 },
   // { x: -30, y: -10, z:  10 },
   // { x: -30, y:  10, z: -10 },
   // { x: -30, y:  10, z:  10 },
   // { x:  30, y: -10, z: -10 },
   // { x:  30, y: -10, z:  10 },
   // { x:  30, y:  10, z: -10 },
   // { x:  30, y:  10, z:  10 },

   // { x: -10, y: -10, z: -20 },
   // { x: -10, y: -10, z:  20 },
   // { x: -10, y:  10, z: -20 },
   // { x: -10, y:  10, z:  20 },
   // { x:  10, y: -10, z: -20 },
   // { x:  10, y: -10, z:  20 },
   // { x:  10, y:  10, z: -20 },
   // { x:  10, y:  10, z:  20 },

   // { x: -10, y: -20, z: -20 },
   // { x: -10, y: -20, z:  20 },
   // { x: -10, y:  20, z: -20 },
   // { x: -10, y:  20, z:  20 },
   // { x:  10, y: -20, z: -20 },
   // { x:  10, y: -20, z:  20 },
   // { x:  10, y:  20, z: -20 },
   // { x:  10, y:  20, z:  20 },
// ];

// const axis = [
//    { x: 0, y: 10, z: 0, },
//    { x: 10, y: 10, z: 0, },
//    { x: 10, y: 20, z: 0, },
//    // { x: 2, y: 15, z: 0, },
// ];

// const axis = [
//    { x: 0, y: 10, z: 0, },
//    { x: 5, y: 20, z: 0, },
//    { x: 15, y: 21, z: 0, },
//    { x: 25, y: 20, z: 0, },
//    { x: 30, y: 10, z: 0, },
//    { x: 25, y: 0, z: 0, },
// ];

// const axis = [
//    { x: 0, y: 10, z: 0, },
//    { x: 0, y: 20, z: 5, },
//    // { x: 0, y: 21, z: 15, },
//    // { x: 0, y: 20, z: 25, },
//    // { x: 0, y: 10, z: 30, },
//    // { x: 0, y: 0, z: 25, },
// ];

// const axis = [
//    { x: 10, y: 0, z: 0, },
//    { x: 20, y: 0, z: 5, },
   // { x: 21, y: 0, z: 15, },
   // { x: 20, y: 0, z: 25, },
   // { x: 10, y: 0, z: 30, },
   // { x: 0, y: 0, z: 25, },
// ];

// const axis = (function() {
//    const points = [];
//    const count = 100;
//    const radius = 10;
//    const { sin, cos } = Math;

//    for (let i = 0; i < count; i++) {
//       const theta = 0.1 + ((2 * Math.PI * i) / count);
//       points.push({
//          // x: i * cos(theta),
//          // y: i * sin(theta),
//          // z: i,
//          // // z: sin(theta),

//          // x: radius * cos(theta),
//          // y: radius * sin(theta),
//          // // z: i,
//          // z: sin(theta),

//          x: radius * cos(theta),
//          y: sin(theta),
//          // y: i,
//          z: radius * sin(theta),

//          // x: sin(theta),
//          // // x: i,
//          // y: radius * cos(theta),
//          // z: radius * sin(theta),
//        });
//    }

//    return points;
// })();

// ------------------------------- TESTS ------------------------------------

const
   basis_x = new THREE.Vector3(1, 0, 0),
   basis_y = new THREE.Vector3(0, 1, 0),
   basis_z = new THREE.Vector3(0, 0, 1),
   transform_mat4 = new THREE.Matrix4(),
   quaternion = new THREE.Quaternion(),
   vertex = new THREE.Vector3(),
   vertex_next = new THREE.Vector3(),
   dir = new THREE.Vector3();

function drawPath() {
   const points = [];

   for (const point of axis) {
      const { x, y, z } = point;
      points.push(x, y, z);
   };

   pathHelper(new Float32Array(points), false, 0x207070);
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
      console.log('Not correct positions or directions: ', D1, D2);
      return null;
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

function showLocalCoords(position = new THREE.Vector3()) {
   const
      azh = arrowHelper('z', basis_z),
      axh = arrowHelper('x', basis_x),
      ayh = arrowHelper('y', basis_y);

   azh.position.copy(position);
   axh.position.copy(position);
   ayh.position.copy(position);

   container.add(azh);
   container.add(axh);
   container.add(ayh);
};

const cross_projections = [], ortho_projections_0 = [], ortho_projections_1 = [], dirs_0 = [], dirs_1 = [];

function clearState() {
   basis_x.set(1, 0, 0);
   basis_y.set(0, 1, 0);
   basis_z.set(0, 0, 1);

   cross_projections.length = 0;
   ortho_projections_0.length = 0;
   ortho_projections_1.length = 0;
   dirs_0.length = 0;
   dirs_1.length = 0;
};

function setFirst(profile_arr) {
   const current_axis = axis[0], next_axis = axis[1];

   dir.subVectors(next_axis, current_axis).normalize();

   quaternion.setFromUnitVectors(basis_z, dir.clone().negate());
   applyQuaternionToBasis(quaternion);
   // showLocalCoords(current_axis);

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
   // pathHelper(clone_arr);
   // pointsHelper(clone_arr, 0x000000, 0.5);
};

function orthoProjections(profile_arr) {
   for (let i = 1; i < axis.length; i++) {
      const
         current_axis = axis[i],
         next_axis = axis[i + 1] || current_axis;

      dir.subVectors(next_axis, current_axis).normalize();

      quaternion.setFromUnitVectors(basis_z, dir.clone().negate());
      applyQuaternionToBasis(quaternion);
      // showLocalCoords(current_axis);

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
      // pathHelper(p0_arr);
      // pathHelper(p1_arr);
      // pointsHelper(p0_arr, 0x000000, 0.5);
      // pointsHelper(p1_arr, 0x000000, 0.5);
   };
};

function crossProjections() {
   // console.log('dirs', ortho_projections_0, ortho_projections_1, dirs_0, dirs_1);
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
      // pathHelper(new_arr);
      // pointsHelper(new_arr, 0x000000, 0.5);
   };

   cross_projections.push(ortho_projections_1[ortho_projections_1.length - 1]);
};

function extrude(profile_data) {
   const { points, textures_indices } = profile_data;
   clearState();
   drawPath();
   setFirst(points);
   orthoProjections(points);
   crossProjections();

   triangulation.triangulate(cross_projections, textures_indices);
};

export default extruder;