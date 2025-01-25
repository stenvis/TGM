// function cloneWithAlignment(profile_arr) {
//    const vertices = [];

//    for (let i = 0; i < axis.length; i++) {
//       const
//          current_axis = axis[i],
//          next_axis = axis[i + 1] || current_axis;

//       dir.subVectors(next_axis, current_axis).normalize();

//       basis_y.crossVectors(last_dir, dir).normalize();

//       basis_x.crossVectors(dir, basis_y).normalize();

//       basis_z.copy(dir).normalize();

//       transform_mat4.makeBasis(basis_x, basis_y, basis_z);

//       const
//          azh = arrowHelper('z', basis_z),
//          axh = arrowHelper('x', basis_x),
//          ayh = arrowHelper('y', basis_y);

//       azh.position.add(current_axis);
//       axh.position.add(current_axis);
//       ayh.position.add(current_axis);

//       container.add(azh);
//       container.add(axh);
//       container.add(ayh);

//       const clone_arr = new Float32Array(profile_arr);

//       for (let i = 0; i < clone_arr.length; i += 3) {
//          const
//             x = clone_arr[i],
//             y = clone_arr[i + 1],
//             z = clone_arr[i + 2];

//          vertex.set(x, y, z)
//             .applyMatrix4(transform_mat4)
//             .add(current_axis);

//          clone_arr[i] = vertex.x;
//          clone_arr[i + 1] = vertex.y;
//          clone_arr[i + 2] = vertex.z;
//       };

//       basis_x.copy(x_axis);
//       basis_y.copy(y_axis);
//       basis_z.copy(z_axis);
//       last_dir.copy(dir);

//       vertices.push(clone_arr);
//       pathHelper(clone_arr);
//       pointsHelper(clone_arr, 0x000000, 0.5);
//    };

//    return vertices;
// };

// function applyQuaternion(quaternion) {
//    basis_z.applyQuaternion(quaternion);
//    basis_x.applyQuaternion(quaternion);
//    basis_y.applyQuaternion(quaternion);
// };

// function rotateAroundLocalAxis(axis, angle) {
//     rotation_mat4.makeRotationAxis(axis.clone().normalize(), angle);

//     // Оновлюємо всі базисні вектори
//     basis_x.applyMatrix4(rotation_mat4).normalize();
//     basis_y.applyMatrix4(rotation_mat4).normalize();
//     basis_z.applyMatrix4(rotation_mat4).normalize();
// };

// function applyAxisAngle(axis, angle) {
//    basis_z.applyAxisAngle(axis, angle);
//    basis_x.applyAxisAngle(axis, angle);
//    basis_y.applyAxisAngle(axis, angle);
// };

// const quaternion = new THREE.Quaternion();

// function makeProjection(profile_arr) {
//    const vertices = [];

//    for (let i = 1; i < axis.length - 1; i++) {
//       const
//          current_axis = axis[i],
//          next_axis = axis[i + 1];
//          // next_axis = axis[i + 1] || current_axis;

//       dir.subVectors(next_axis, current_axis);
//       // pointsHelper(new Float32Array([dir.x, dir.y, dir.z]), 0xff00ff, 1);
//       // pointsHelper(new Float32Array([current_axis.x, current_axis.y, current_axis.z]), 0xff00ff, 1);

//       dir.normalize();

//       const
//          sign_x = Math.sign(dir.x),
//          sign_z = Math.sign(dir.z);

//       let x_angle, y_angle;

//       {
//          const height = dir.y;
//          const len = Math.hypot(dir.x, dir.z);
//          y_angle = Math.atan2(height, len);
//       }

//       {
//          const height = Math.abs(dir.z);
//          const len = dir.x;
//          x_angle = Math.atan2(len, height);
//       }

//       // console.log('log', i);
//       // console.log('dir_______', dir, dir.clone().negate());
//       // console.log('basis z_______', basis_z);
//       // console.log('angles_________', x_angle, y_angle);
      
//       quaternion.setFromUnitVectors(basis_z, dir.clone().negate());
//       applyQuaternion(quaternion);

//       const
//          azh = arrowHelper('z', basis_z),
//          axh = arrowHelper('x', basis_x),
//          ayh = arrowHelper('y', basis_y);

//       azh.position.add(current_axis);
//       axh.position.add(current_axis);
//       ayh.position.add(current_axis);

//       container.add(azh);
//       container.add(axh);
//       container.add(ayh);

//       const clone_arr = new Float32Array(profile_arr);

//       transform_mat4.makeBasis(basis_x, basis_y, basis_z);

//       for (let i = 0; i < clone_arr.length; i += 3) {
//          const
//             x = clone_arr[i],
//             y = clone_arr[i + 1],
//             z = clone_arr[i + 2];

//          vertex.set(x, y, z)
//             .applyMatrix4(transform_mat4)
//             .add(current_axis);

//          clone_arr[i] = vertex.x;
//          clone_arr[i + 1] = vertex.y;
//          clone_arr[i + 2] = vertex.z;
//       };

//       vertices.push(clone_arr);
//       pathHelper(clone_arr);
//       pointsHelper(clone_arr, 0x000000, 0.5);
//    };

//    return vertices;
// };

// function applyQuaternion(quaternion) {
//    basis_z.applyQuaternion(quaternion);
//    basis_x.applyQuaternion(quaternion);
//    basis_y.applyQuaternion(quaternion);
// };

// function rotateAroundLocalAxis(axis, angle) {
//     rotation_mat4.makeRotationAxis(axis.clone().normalize(), angle);

//     // Оновлюємо всі базисні вектори
//     basis_x.applyMatrix4(rotation_mat4).normalize();
//     basis_y.applyMatrix4(rotation_mat4).normalize();
//     basis_z.applyMatrix4(rotation_mat4).normalize();
// };

// function applyAxisAngle(axis, angle) {
//    basis_z.applyAxisAngle(axis, angle);
//    basis_x.applyAxisAngle(axis, angle);
//    basis_y.applyAxisAngle(axis, angle);
// };

// const quaternion = new THREE.Quaternion();

// function makeProjection(profile_arr) {
//    const vertices = [];

//    for (let i = 1; i < axis.length - 1; i++) {
//       const
//          current_axis = axis[i],
//          next_axis = axis[i + 1];
//          // next_axis = axis[i + 1] || current_axis;

//       dir.subVectors(next_axis, current_axis);
//       // pointsHelper(new Float32Array([dir.x, dir.y, dir.z]), 0xff00ff, 1);
//       // pointsHelper(new Float32Array([current_axis.x, current_axis.y, current_axis.z]), 0xff00ff, 1);

//       dir.normalize();

//       const
//          sign_x = Math.sign(dir.x),
//          sign_z = Math.sign(dir.z);

//       let x_angle, y_angle;

//       {
//          const height = dir.y;
//          const len = Math.hypot(dir.x, dir.z);
//          y_angle = Math.atan2(height, len);
//       }

//       {
//          const height = Math.abs(dir.z);
//          const len = dir.x;
//          x_angle = Math.atan2(len, height);
//       }

//       // console.log('log', i);
//       // console.log('dir_______', dir, dir.clone().negate());
//       // console.log('basis z_______', basis_z);
//       // console.log('angles_________', x_angle, y_angle);
      
//       quaternion.setFromUnitVectors(basis_z, dir.clone().negate());
//       applyQuaternion(quaternion);

//       const
//          azh = arrowHelper('z', basis_z),
//          axh = arrowHelper('x', basis_x),
//          ayh = arrowHelper('y', basis_y);

//       azh.position.add(current_axis);
//       axh.position.add(current_axis);
//       ayh.position.add(current_axis);

//       container.add(azh);
//       container.add(axh);
//       container.add(ayh);

//       const clone_arr = new Float32Array(profile_arr);

//       transform_mat4.makeBasis(basis_x, basis_y, basis_z);

//       for (let i = 0; i < clone_arr.length; i += 3) {
//          const
//             x = clone_arr[i],
//             y = clone_arr[i + 1],
//             z = clone_arr[i + 2];

//          vertex.set(x, y, z)
//             .applyMatrix4(transform_mat4)
//             .add(current_axis);

//          clone_arr[i] = vertex.x;
//          clone_arr[i + 1] = vertex.y;
//          clone_arr[i + 2] = vertex.z;
//       };

//       vertices.push(clone_arr);
//       pathHelper(clone_arr);
//       pointsHelper(clone_arr, 0x000000, 0.5);
//    };

//    return vertices;
// };


// function orthoProjections(profile_arr) {
//    const projections = [], dirs = [];

//    for (let i = 1; i < axis.length; i++) {
//       const
//          current_axis = axis[i],
//          next_axis = axis[i + 1] || current_axis;

//       dir.subVectors(next_axis, current_axis).normalize();

//       quaternion.setFromUnitVectors(basis_z, dir.clone().negate());
//       applyQuaternionToBasis(quaternion);
//       showLocalCoords(current_axis);

//       transform_mat4.makeBasis(basis_x, basis_y, basis_z);

//       const clone_arr = new Float32Array(profile_arr);

//       for (let i = 0; i < clone_arr.length; i += 3) {
//          const
//             x = clone_arr[i],
//             y = clone_arr[i + 1],
//             z = clone_arr[i + 2];

//          vertex.set(x, y, z)
//             .applyMatrix4(transform_mat4)
//             .add(current_axis);

//          clone_arr[i] = vertex.x;
//          clone_arr[i + 1] = vertex.y;
//          clone_arr[i + 2] = vertex.z;
//       };

//       projections.push(clone_arr);
//       pathHelper(clone_arr);
//       pointsHelper(clone_arr, 0x000000, 0.5);
//    };

//    return { projections, dirs };
// };