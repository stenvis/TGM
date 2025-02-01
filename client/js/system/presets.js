const CTX_PRESETS = {
   antialias: true,
   stencil: true,
};

const ORBIT_CONTROL_PRESETS = {
   minDistance: 100,
   // maxDistance: 100,
   maxDistance: 10000,
   rotateSpeed: 0.4,
   zoomSpeed: 1.4,
   dampingFactor: 0.2,
   // maxPolarAngle: (Math.PI / 2) - 0.05,
   enablePan: true,
   enableDamping: true,
};

const SYSTEM_PRESETS = {
   CTX_PRESETS,
   ORBIT_CONTROL_PRESETS,
};

export default SYSTEM_PRESETS;