// const vertices = [
//    -1, -1, 0, // 0
//    -1, 1, 0, // 1
//    -1, 1.5, -1, // 2
//    -1, 1, -2, // 3
//    -1, -1, -2, // 4

//    2, -1, 0, // 5
//    2, 1, 0, // 6
//    2, 1.5, -1, // 7
//    2, 1, -2, // 8
//    2, -1, -2, // 9

//    8, -1, 0, // 10
//    8, 1, 0, // 11
//    8, 1.5, -1, // 12
//    8, 1, -2, // 13
//    8, -1, -2, // 14
// ];

// const indices = [
//    0, 1, 5,
//    1, 5, 6,

//    1, 2, 6,
//    2, 6, 7, 

//    2, 3, 7,
//    3, 7, 8, 

//    3, 4, 8,
//    4, 8, 9, 

//    5, 6, 10,
//    6, 10, 11,

//    6, 7, 11,
//    7, 11, 12, 

//    7, 8, 12,
//    8, 12, 13, 

//    8, 9, 13,
//    9, 13, 14, 
// ];

// function generateUVs() {
//    const uvs = [];

//    const PROFILE_COUNT = 3;

//    let min_x = 0;
//    let min_y = 0;

//    const 
//       values_x = [],
//       values_y = [];

//    const len = vertices.length / 3;

//    for (let i = 0; i < PROFILE_COUNT - 1; i++) {
//       const ci = len * i, ni = len * (i + 1);
//       const
//          cx = vertices[ci],
//          cy = vertices[ci + 1],
//          cz = vertices[ci + 2],
//          nx = vertices[ni],
//          ny = vertices[ni + 1],
//          nz = vertices[ni + 2];

//       const pointA = new THREE.Vector3(cx, cy, cz);
//       const pointB = new THREE.Vector3(nx, ny, nz);
//       const dist = pointA.distanceTo(pointB);
//       values_x.push(dist);
//       max_x += dist
//    };

//    for (let i = 0; i < (vertices.length / PROFILE_COUNT) - 3; i+=3) {
//       const
//          cx = vertices[i],
//          cy = vertices[i + 1],
//          cz = vertices[i + 2],
//          nx = vertices[i + 3],
//          ny = vertices[i + 4],
//          nz = vertices[i + 5];

//       const pointA = new THREE.Vector3(cx, cy, cz);
//       const pointB = new THREE.Vector3(nx, ny, nz);
//       const dist = pointA.distanceTo(pointB);
//       values_y.push(dist);
//       max_y += dist;
//    };

//    let value_x = 0;

//    for (let i = 0; i < PROFILE_COUNT; i++) {
//       uvs.push(
//          value_x, 0,
//       );

//       let value_y = 0;

//       for (let j = 0; j < (vertices.length / PROFILE_COUNT) - 6; j+=3) {
//          value_y += normalize(values_y[j / 3], min_y, max_y);
//          uvs.push(value_x, value_y);
//       };

//       uvs.push(
//          value_x, 1,
//       );

//       value_x += normalize(values_x[i], min_x, max_x);
//    };

//    return uvs;
// };