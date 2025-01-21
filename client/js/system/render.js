import Resize from '/js/system/resize.js';
import system from '/js/system/system.js';

let _render_requested;

const { scene, renderer, camera, orbit, canvas } = system;

const resize = new Resize(system, canvas);

const render = {
   start,
   update,
};

function checkResize() { 
   resize.check();
   update();
};

function update () {
   if (_render_requested) return;
   _render_requested = true;
   requestAnimationFrame(tick, canvas);
};

function tick() {
   _render_requested = false;
   renderer.render(scene, camera);
   orbit.src.update();
};

function start() {
   tick();
   window.addEventListener('resize', checkResize);
   orbit.src.addEventListener('change', update);
   checkResize();
};

window.render = render;
export default render;
