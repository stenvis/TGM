import helpers from "../helpers.js";
import extruder from "./extruder.js";
import profile_data from "./profile-data.js";
// import profile_data from "./test.js";

const {
   circleHelper,
   pointsHelper,
   pathHelper,
   container,
} = helpers;

const profile = {
   generate,
};

function extractPoints(profile_data) {
   const points = [], textures_indices = [];

   // textures_indices = [
   //    [
   //       i,
   //       i + 1,
   //       texture,
   //    ],
   //    [
   //       i,
   //       i + 1,
   //       texture,
   //    ]
   // ];

   let _last_texture = null;

   const { a } = profile_data[0];

   points.push(a.x, a.y, a.z);

   for (let i = 0; i < profile_data.length; i++) {
      let { b, texture } = profile_data[i];

      texture = texture || 'brick';

      points.push(b.x, b.y, b.z);

      if (_last_texture == texture) {
         const li = textures_indices.length - 1;
         textures_indices[li][1] = i + 1;
         continue;
      };

      textures_indices.push([i, i + 1, texture]);
      _last_texture = texture;
   };

   // console.log('points', points);
   // console.log(textures_indices);

   return { points, textures_indices };
};

function generate(input_data = profile_data) {
   const { scene } = THREE_APP.system;

   const data = extractPoints(input_data);
   // const { points } = segmentateData(input_data);
   // pointsHelper(points, 0x000000, 1);
   // pathHelper(points);

   extruder.extrude(data);

   scene.add(container);
};

export default profile;