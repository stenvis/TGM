import { canvas_bg_color } from "/configs/configs.js";
import OrbitControl from "/js/lib/3D/controls/orbit.js";
import SYSTEM_PRESETS from "/js/system/presets.js";

const {
   CTX_PRESETS,
   ORBIT_CONTROL_PRESETS,
} = SYSTEM_PRESETS;

const canvas = document.getElementById('canvas');

const 
   scene = new THREE.Scene(),
   renderer = new THREE.WebGLRenderer({
      canvas,
      ...CTX_PRESETS,
   });

renderer.localClippingEnabled = true;

scene.background = new THREE.Color(canvas_bg_color);

// const { width, height } = canvas;

const
   // camera = new THREE.PerspectiveCamera(45),
   camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100000),
   // camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 1000 ),
   orbit = new OrbitControl(camera, canvas, ORBIT_CONTROL_PRESETS);

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

// const dirLight = new THREE.DirectionalLight(0xffffff, 4);
// dirLight.position.set(5, 2, 5);
// scene.add(dirLight);

// const dirLight_1 = new THREE.DirectionalLight(0xffffff, 4);
// dirLight_1.position.set(-5, 2, -5);
// scene.add(dirLight_1);

const hemiLight = new THREE.HemisphereLight(0x03dffc, 0x3d362b, 0.4);
hemiLight.position.set(0, 20, 0);
scene.add(hemiLight);

function generateAxis(p0, p1, color) {
   const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.4 });
   const points = [
      new THREE.Vector3(...p0),
      new THREE.Vector3(...p1),
   ];
   const geometry = new THREE.BufferGeometry().setFromPoints( points );
   return new THREE.Line(geometry, material);
};

function createAxeseGroup() {
   const 
      axis_x  = generateAxis([-100000, 0, 0], [100000, 0, 0], 0xff0000),
      axis_y  = generateAxis([0, -100000, 0], [0, 100000, 0], 0x00ff00),
      axis_z  = generateAxis([0, 0, -100000], [0, 0, 100000], 0x0000ff);
     
   const group = new THREE.Group().add(axis_x).add(axis_y).add(axis_z);
   return group;
}; 

scene.add(createAxeseGroup());

// renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

// camera.position.set(10, 5, 10);
camera.position.set(1000, 500, 7000);

const system = {
   canvas,
   scene,
   renderer,
   camera,
   orbit,
};

window.THREE_APP = {};
window.THREE_APP.system = system; 

export default system;