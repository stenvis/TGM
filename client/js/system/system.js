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
   camera = new THREE.PerspectiveCamera(45),
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

// renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

camera.position.set(10, 5, 70);

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