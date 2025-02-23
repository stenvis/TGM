import initTHREE from '/js/system/init/three.js';
// import morphGeometry from '/js/lib/applied/morph-geometry.js';
// import extrude3D from '/js/lib/applied/new-profile/profile.js';
import latheGeometry from '/js/lib/applied/lathe-geometry/geometry.js';
// import profile from '/js/lib/applied/profile/profile.js';
// import plane from '/js/lib/applied/plane.js';
import render from '/js/system/render.js';

// morphGeometry();
// plane.init();
// profile.generate();
latheGeometry();
// extrude3D();
// profile.generate();
render.start();