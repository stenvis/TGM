const container = new THREE.Object3D();

const helpers = {
   circleHelper,
   pointsHelper,
   pathHelper,
   normalMaterial,

   container,
};

function circleHelper(r, px, py, numPoints = 70) {
   const points = [];

   for (let i = 0; i <= numPoints; i++) {
      const angle = (i / numPoints) * 2 * PI; 
      points.push(px + cos(angle) * r, py + sin(angle) * r, 0);
   };

   pointsHelper(new Float32Array(points), 0xff0000);
};

function pointsHelper(points_arr, color = 0x000000, size = 0.081) {
   const geometry = new THREE.BufferGeometry();
   geometry.setAttribute('position', new THREE.BufferAttribute(points_arr, 3));

   const material = new THREE.PointsMaterial({
      color,
      size,
   });

   const points = new THREE.Points(geometry, material);

   container.add(points);
};

function pathHelper(points_arr, close = true, color = 0x0a7318, linewidth = 2) {
   const geometry = new THREE.BufferGeometry();
   geometry.setAttribute('position', new THREE.BufferAttribute(points_arr, 3));

   const material = new THREE.LineBasicMaterial({
      color,
      linewidth,
   });

   const line = close ? new THREE.LineLoop(geometry, material) : new THREE.Line(geometry, material);

   container.add(line);
};

function normalMaterial(vertices, indices) {
   const geometry = new THREE.BufferGeometry();

   geometry.setIndex(indices);
   geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
   geometry.computeVertexNormals();

   const material = new THREE.MeshNormalMaterial({ 
      side: THREE.DoubleSide,
    });

   const mesh = new THREE.Mesh( geometry, material );

   container.add(mesh);
};

export default helpers;