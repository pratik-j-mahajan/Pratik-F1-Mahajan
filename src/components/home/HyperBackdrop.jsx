import { useEffect, useRef } from 'react'

/*
  Home background: "hyperspeed". A night tunnel rushing at the viewer — red tail-lights
  pulling away on the left, white headlights flashing past on the right, tunnel lights
  streaming overhead, everything converging on a hot glow right behind the driver.
  One full-screen fragment shader (plain WebGL, no 3D library), so it costs almost nothing
  to load. `boost` (the race start) floors it: the speed winds up and the view stretches.
*/
const VERT = `
attribute vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`

const FRAG = `
precision highp float;
uniform vec2 res;
uniform float t;      // distance travelled (already speed-scaled)
uniform float warp;   // 0 → 1 while boosting
uniform vec2 focus;   // vanishing point, in uv

float hash(float n) { return fract(sin(n * 91.345) * 47453.17); }

// light streaks travelling along a lane at lateral position x, on a plane at depth z
// dir: +1 coming at us, -1 going away; returns brightness
float streaks(float X, float z, float lane, float dir, float speed, float seed, float width, float density) {
  float d = abs(X - lane);
  float across = exp(-d * d / (width * width));
  if (across < 0.002) return 0.0;
  float zz = z + dir * t * speed + seed * 13.0;
  float cell = floor(zz / 9.0);
  float h = hash(cell + seed * 7.0);
  float local = fract(zz / 9.0);
  float len = 0.12 + 0.5 * hash(cell * 1.7 + seed) + warp * 0.35;
  float on = step(1.0 - density, h) * smoothstep(0.0, 0.02, local) * smoothstep(len, len - 0.06, local);
  return across * on;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - res * focus) / res.y;
  // warp: pull everything toward the vanishing point, like the view stretching at speed
  uv *= 1.0 - warp * 0.22 * (1.0 - length(uv) * 0.6);

  vec3 col = vec3(0.012, 0.012, 0.025);
  float y = uv.y;
  float side = sign(y);          // above: tunnel roof, below: road
  float h = side > 0.0 ? 0.55 : 0.32; // roof height / camera height
  float z = h / max(abs(y), 0.0015);
  float X = uv.x * z;
  float fog = exp(-z * 0.028);   // 1 near, 0 at the horizon

  if (side < 0.0) {
    // wet road: faint sheen and dashed lane lines
    col += vec3(0.02, 0.01, 0.02) * fog;
    for (int i = 0; i < 2; i++) {
      float lx = i == 0 ? -0.9 : 0.9;
      float line = exp(-pow((X - lx) / 0.035, 2.0));
      float dash = step(0.5, fract((z + t * 1.6) / 3.2));
      col += vec3(0.75) * line * dash * fog * 0.55;
    }
    // tail-lights going away (left), headlights coming at us (right)
    float red = streaks(X, z, -2.0, -1.0, 0.55, 1.0, 0.09, 0.8) + streaks(X, z, -1.35, -1.0, 0.7, 2.0, 0.09, 0.8);
    float white = streaks(X, z, 1.35, 1.0, 1.6, 3.0, 0.1, 0.8) + streaks(X, z, 2.0, 1.0, 1.9, 4.0, 0.1, 0.8);
    col += vec3(1.0, 0.09, 0.06) * red * (0.6 + fog * 1.6);
    col += vec3(0.82, 0.9, 1.0) * white * (0.5 + fog * 1.6);
    // their reflections smeared on the wet road
    col += vec3(1.0, 0.1, 0.05) * streaks(X * 0.6, z, -1.0, -1.0, 0.55, 1.0, 0.5, 0.8) * 0.1 * fog;
  } else {
    // tunnel roof: two rows of strip lights streaming overhead
    for (int i = 0; i < 2; i++) {
      float lx = i == 0 ? -0.8 : 0.8;
      float lamp = streaks(X, z, lx, 1.0, 2.2, 5.0 + float(i), 0.05, 0.65);
      col += vec3(1.0, 0.55, 0.3) * lamp * (0.18 + fog * 0.75);
    }
    // a red accent strip down the middle of the roof
    float mid = exp(-pow(X / 0.05, 2.0)) * step(0.5, fract((z + t * 2.2) / 2.0));
    col += vec3(1.0, 0.05, 0.05) * mid * fog * 0.5;
  }

  // the hot glow at the vanishing point, right behind the driver
  float r = length(uv);
  col += vec3(1.0, 0.18, 0.08) * exp(-r * 4.2) * (0.55 + warp * 0.6);
  col += vec3(1.0, 0.6, 0.4) * exp(-r * 14.0) * (0.35 + warp * 0.8);
  // a thin bright horizon line
  col += vec3(1.0, 0.25, 0.15) * exp(-abs(y) * 140.0) * exp(-abs(uv.x) * 1.6) * 0.45;

  // tone and vignette
  col = 1.0 - exp(-col * 1.6);
  col *= 1.0 - smoothstep(0.55, 1.35, length(uv * vec2(0.9, 1.15)));
  gl_FragColor = vec4(col, 1.0);
}
`

export default function HyperBackdrop({ boost = false }) {
  const canvasRef = useRef(null)
  const boostRef = useRef(boost)
  boostRef.current = boost

  useEffect(() => {
    const canvas = canvasRef.current
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' })
    if (!gl) return

    const compile = (type, src) => {
      const s = gl.createShader(type)
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return s
    }
    const prog = gl.createProgram()
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog)
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'p')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

    const u = {
      res: gl.getUniformLocation(prog, 'res'),
      t: gl.getUniformLocation(prog, 't'),
      warp: gl.getUniformLocation(prog, 'warp'),
      focus: gl.getUniformLocation(prog, 'focus'),
    }

    // render a little under full resolution — it's all glow, nobody can tell, and it's cheap
    const SCALE = Math.min(window.devicePixelRatio || 1, 1.5) * 0.75
    const resize = () => {
      const w = Math.round(canvas.clientWidth * SCALE)
      const h = Math.round(canvas.clientHeight * SCALE)
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
        gl.viewport(0, 0, w, h)
      }
    }
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    resize()

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let dist = 40
    let speed = 9
    let warp = 0
    let last = performance.now()
    let raf = 0

    const draw = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const target = boostRef.current ? 60 : 9
      speed += (target - speed) * Math.min(1, dt * (boostRef.current ? 1.6 : 2.5))
      warp += ((boostRef.current ? 1 : 0) - warp) * Math.min(1, dt * 2.2)
      dist += speed * dt
      gl.uniform2f(u.res, canvas.width, canvas.height)
      gl.uniform2f(u.focus, 0.5, 0.56) // just behind the driver's head
      gl.uniform1f(u.t, dist)
      gl.uniform1f(u.warp, warp)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      if (!reduce) raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)

    // no point drawing while the tab is hidden
    const onVis = () => {
      cancelAnimationFrame(raf)
      if (!document.hidden && !reduce) {
        last = performance.now()
        raf = requestAnimationFrame(draw)
      }
    }
    document.addEventListener('visibilitychange', onVis)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      document.removeEventListener('visibilitychange', onVis)
      // (no loseContext here: React's dev double-mount would get the same, now dead, context back)
    }
  }, [])

  return (
    <div className="hyper" aria-hidden="true">
      <canvas ref={canvasRef} />
      <span className="hyper-grain" />
    </div>
  )
}
