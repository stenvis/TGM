import helpers from "./helpers.js";
import extruder from "./extruder.js";

const {
   circleHelper,
   pointsHelper,
   pathHelper,
   container,
} = helpers;

const input = document.getElementById('radius');
input.addEventListener('input', update);

function update({ target }) {
   const { value } = target;

   profile_data[0].r = value;
   container.clear();
   generate();
   window.render.update();
};

const profile = {
   generate,
};

const profile_data = [
   { x: -1, y: 2, r: 2, texture: 'brick' },
   { x: 1, y: 0, },
   { x: 0, y: -2, texture: 'bump' },
   { x: -2, y: -2, },
   { x: -3, y: -1, },
   { x: -3, y: 1, },
];

const { PI, sin, cos, sqrt, hypot, atan2 } = Math;

function drawArc(r, px, py, sa, ea, numPoints = 80) {
   const points = [];

   if (ea > sa) ea -= 2 * PI;

   for (let i = 0; i <= numPoints; i++) {
      const angle = sa + (i / numPoints) * (ea - sa);
      points.push(px + cos(angle) * r, py + sin(angle) * r, 0);
   };

   // pointsHelper(new Float32Array(points), 0xff0000);
   return points;
};

function outerArc(x0, y0, x1, y1, input_radius) {
   const radius = input_radius - 1;

   // mid point
   const
      mx = (x0 + x1) / 2,
      my = (y0 + y1) / 2;

   // perpendicular direction + length
   const
      dx = -(y1 - y0),
      dy = x1 - x0,
      length = hypot(dx, dy);

   // scale rate as normalize
   const scale = radius / length;

   // perpendicular of radius length from the mid point
   const 
      px = mx + dx * scale,
      py = my + dy * scale;

   const 
      pmx = py - y0,
      pmy = px - x0;

   const r = hypot(pmx, pmy);

   // start - end angles for arc
   const 
      sa = atan2(y0 - py, x0 - px),
      ea = atan2(y1 - py, x1 - px);

   const points = drawArc(r, px, py, sa, ea);

   // pointsHelper(new Float32Array([x0, y0, 0]));
   // return { px, py };

   return points;
};

function perpendicularSlope(p1x, p1y, p2x, p2y) {
    const dx = p2x - p1x;
    const dy = p2y - p1y;
    return -dx / dy;
};

function innerArc(x0, y0, x1, y1, input_radius) {
   const
      mx = (x0 + x1) / 2,
      my = (y0 + y1) / 2;

   const
      dx = -(y1 - y0),
      dy = x1 - x0,
      length = sqrt(dx * dx + dy * dy);

   const scale = input_radius / length;

   const r_scale = length / 2;

   const 
      px = mx + dx * scale * r_scale,
      py = my + dy * scale * r_scale;

      
   const 
      mx1 = (x0 + px) / 2,
      my1 = (y0 + py) / 2;

   const 
      mx2 = (px + x1) / 2,
      my2 = (py + y1) / 2;

   const m1 = perpendicularSlope(x0, y0, px, py);
   const m2 = perpendicularSlope(px, py, x1, y1);

   const b1 = my1 - m1 * mx1;
   const b2 = my2 - m2 * mx2;

   const cx = (b2 - b1) / (m1 - m2);
   const cy = m1 * cx + b1;

   const new_radius = hypot((cx - x0), (cy - y0));

   // pointsHelper(new Float32Array([
   //    mx1, my1, 0,
   //    mx2, my2, 0,
   //    cx, cy, 0,
   //    px, py, 0
   // ]));

   const 
      sa = atan2(y0 - cy, x0 - cx),
      ea = atan2(y1 - cy, x1 - cx);

   const points = drawArc(new_radius, cx, cy, sa, ea);
   // circleHelper(input_radius * r_scale, mx, my);
   // circleHelper(new_radius, cx, cy);

   return points;
};

function segmentateData(data) {
   const len = data.length - 1;

   const points = [];

   for (let i = 0; i < len; i++) {
      const p0 = data[i], p1 = data[i + 1];
      const
         x0 = p0.x, x1 = p1.x,
         y0 = p0.y, y1 = p1.y;

      points.push(x0, y0, 0);

      if (p0.r) {
         const input_radius = Number(p0.r);

         points.push(x0, y0, 0);

         if (input_radius >= 1) {
            // const { px, py } = outerArc(x0, y0, x1, y1, input_radius);
            // points.push(px, py, 0);
            const arc_points = outerArc(x0, y0, x1, y1, input_radius);
            points.push(...arc_points);
            points.push(x1, y1, 0);
            continue;
         };

         // const { px, py } = innerArc(x0, y0, x1, y1, input_radius);
         // points.push(px, py, 0);
         const arc_points = innerArc(x0, y0, x1, y1, input_radius);
         points.push(...arc_points);
         points.push(x1, y1, 0);
         continue;
      };

      points.push(x1, y1, 0);
   };

   return new Float32Array(points);
};

function generate(input_data = profile_data) {
   const { scene } = THREE_APP.system;

   const points_arr = segmentateData(input_data);
   // pointsHelper(points_arr);
   // pathHelper(points_arr);

   extruder.extrude(points_arr);

   scene.add(container);
};

export default profile;