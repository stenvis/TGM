import { OrbitControls } from '/dependencies/three/OrbitControls.js';

class OrbitControl {
   orbit;

   constructor(camera, canvas, presets) {
      this.orbit = new OrbitControls(camera, canvas);

      for (const key in presets)
         this.orbit[key] = presets[key];
   }

   get src() {
      return this.orbit;
   }

   reset() {
      this.orbit.reset();
   }

   enable() {
      this.orbit.enabled = true;
   }

   disable() {
      this.orbit.enabled = false;
   }

   setPosition(pos) {
      this.orbit.position.set(pos);
   }
};

export default OrbitControl;