import initTHREE from '/js/system/init/three.js';
// import extrude3D from '/js/lib/applied/new-profile/profile.js';
import latheGeometry from '/js/lib/applied/lathe-geometry/geometry.js';
// import profile from '/js/lib/applied/profile/profile.js';
import render from '/js/system/render.js';

// profile.generate();
latheGeometry();
// extrude3D();
// profile.generate();
render.start();