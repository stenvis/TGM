const bg_wave = {
   vertexShader: `
      uniform float u_time;
      uniform float u_noise_force;
      uniform float u_frequency;
      uniform float u_amplitude;
      uniform float u_amplifier;
      uniform float u_line_height;

      varying float vX;

      float random(vec2 p) {
         return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }

      float noise(vec2 p) {
         vec2
            i = floor(p),
            f = fract(p);

         float 
            a = random(i),
            b = random(i + vec2(1.0, 0.0)),
            c = random(i + vec2(0.0, 1.0)),
            d = random(i + vec2(1.0, 1.0));

         vec2 u = f * f * (3.0 - 2.0 * f);

         return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }

      float curve(float x, float freq, float time) {
         return cos(x * freq + time) * 0.4 + 0.5;
      }

      void main() {
         vec3 pos = position;

         float noiseValue = noise(pos.xz * u_noise_force + u_time);

         pos.y *= u_line_height; 

         pos.y += noiseValue * u_amplitude;
         pos.y += noiseValue * u_amplifier;
         pos.z += curve(pos.x, u_frequency, noiseValue) * u_amplitude;
         pos.z *= u_amplitude;

         gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
   `,
   fragmentShader: `
      uniform float u_time;

      uniform vec3 u_color_3;

      void main() {
         gl_FragColor = vec4(u_color_3, .4);
      }
   `
};

export default bg_wave;