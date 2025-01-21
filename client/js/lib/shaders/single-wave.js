const single_wave = {
   vertexShader: `
      uniform float u_time;
      uniform float u_amplifier;
      uniform float u_noise_force;
      uniform float u_frequency;
      uniform float u_amplitude;

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

      float test(float x, float freq, float time) {
         return cos(x * freq + time) * 0.4 + 0.5;
      }

      void main() {
         vec3 pos = position;

         float 
            noiseValue = noise(pos.xz * u_noise_force + u_time),
            amp = u_amplitude + u_amplifier;

         pos.y += exp(-abs(.2 * pos.x * u_amplifier)) * sin(pos.x * u_frequency) * amp * noiseValue;

         gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
   `,
   fragmentShader: `
      uniform float u_time;

      uniform vec3 u_color_4;

      void main() {
         gl_FragColor = vec4(u_color_4, .4);
      }
   `
};

export default single_wave;