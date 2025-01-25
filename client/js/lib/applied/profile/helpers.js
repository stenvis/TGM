const container = new THREE.Object3D();

const helpers = {
   circleHelper,
   pointsHelper,
   pathHelper,
   arrowHelper,

   normalMaterial,

   container,
};

function arrowHelper(axis, direction = null, color = null) {
   const DIRECTIONS = {
      x: new THREE.Vector3(1, 0, 0),
      y: new THREE.Vector3(0, 1, 0),
      z: new THREE.Vector3(0, 0, 1),
   };

   const COLORS = {
      x: 0xff0000,
      y: 0x00ff00,
      z: 0x0000ff,
   };

   const 
      origin = new THREE.Vector3(0, 0, 0),
      length = 5,
      dir = direction || DIRECTIONS[axis],
      col = color || COLORS[axis];

   return new THREE.ArrowHelper(dir, origin, length, col);
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
      transparent: true,
      opacity: 0.8,
    });

   const mesh = new THREE.Mesh( geometry, material );

   container.add(mesh);
};

export default helpers;