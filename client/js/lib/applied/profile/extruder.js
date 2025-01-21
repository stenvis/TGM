import helpers from "./helpers.js";

const {
   circleHelper,
   pointsHelper,
   pathHelper,
   container,
} = helpers;

const extruder = {
   extrude,
};

const {
   sin, cos,
} = Math;

// ------------------------------- TESTS ------------------------------------
const axis = [
   { x: 0, y: 10, z: 0, },
   { x: 5, y: 20, z: 0, },
   { x: 15, y: 21, z: 0, },
   { x: 25, y: 20, z: 0, },
   { x: 30, y: 10, z: 0, },
   { x: 25, y: 0, z: 0, },
];

// const axis = [
//    { x: 0, y: 10, z: 0, },
//    { x: 0, y: 20, z: 5, },
//    { x: 0, y: 21, z: 15, },
//    { x: 0, y: 20, z: 25, },
//    { x: 0, y: 10, z: 30, },
//    { x: 0, y: 0, z: 25, },
// ];

// const axis = [
//    { x: 10, y: 0, z: 0, },
//    { x: 20, y: 0, z: 5, },
//    { x: 21, y: 0, z: 15, },
//    { x: 20, y: 0, z: 25, },
//    { x: 10, y: 0, z: 30, },
//    { x: 0, y: 0, z: 25, },
// ];

// const axis = [
//    { x: 0, y: 10, z: 0, },
//    { x: 10, y: 10, z: 0, },
//    { x: 10, y: 10, z: 10, },
//    { x: 10, y: 20, z: 10, },
//    { x: 0, y: 20, z: 20, },
// ];

// const axis = (function() {
//    const points = [];
//    const count = 100;
//    const radius = 10;

//    for (let i = 0; i < count; i++) {
//       const theta = 0.1 + ((2 * Math.PI * i) / count);
//       points.push({
//          x: i * cos(theta),
//          y: i * sin(theta),
//          // z: i,
//          z: sin(theta),
         
//          // x: radius * cos(theta),
//          // y: radius * sin(theta),
//          // // z: i,
//          // z: sin(theta),
         
//          // x: radius * cos(theta),
//          // y: sin(theta),
//          // // y: i,
//          // z: radius * sin(theta),

//          // x: sin(theta),
//          // // x: i,
//          // y: radius * cos(theta),
//          // z: radius * sin(theta),
//        });
//    }

//    return points;
// })();
// ------------------------------- TESTS ------------------------------------

// Right-hand system coordinate
const 
   last_dir = new THREE.Vector3(),
   dir = new THREE.Vector3(),
   up_dir = new THREE.Vector3(),
   side_dir = new THREE.Vector3(),
   transform_mat4 = new THREE.Matrix4(),
   vertex = new THREE.Vector3();

function drawPath() {
   const points = [];

   for (const point of axis) {
      const { x, y, z } = point;
      points.push(x, y, z);
   };

   pathHelper(new Float32Array(points), false, 0x207070);

   last_dir
      .subVectors(axis[1], axis[2])
      .normalize();
};

function cloneProfile(profile_arr) {
   for (let i = 0; i < axis.length - 1; i++) {
      const
         point = axis[i],
         next_point = axis[i + 1];
      
      dir.subVectors(next_point, point).normalize();
      up_dir.crossVectors(last_dir, dir).normalize();
      side_dir.crossVectors(dir, up_dir).normalize();

      transform_mat4.set(
         side_dir.x, up_dir.x, dir.x, point.x,
         side_dir.y, up_dir.y, dir.y, point.y,
         side_dir.z, up_dir.z, dir.z, point.z,
         0, 0, 0, 1
      );

      const clone_arr = new Float32Array(profile_arr);

      for (let i = 0; i < clone_arr.length; i += 3) {
         const
            x = clone_arr[i],
            y = clone_arr[i + 1],
            z = clone_arr[i + 2];

         vertex.set(x, y, z).applyMatrix4(transform_mat4);

         clone_arr[i] = vertex.x;
         clone_arr[i + 1] = vertex.y;
         clone_arr[i + 2] = vertex.z;
      };

      last_dir.copy(dir);

      pathHelper(clone_arr);
   };
};

function extrude(points_arr) {
   drawPath();
   cloneProfile(points_arr);
};

export default extruder;