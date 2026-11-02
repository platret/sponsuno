// Silk: a small WebGL fragment-shader background. Domain-warped noise folds like fabric,
// with thin highlight ridges that read as gold threads. Two palettes: navy (hero) and gold.

const VERT = `
  attribute vec2 aPos;
  void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
  precision highp float;
  uniform vec2 uRes;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform vec3 uBase;
  uniform vec3 uFold;
  uniform vec3 uShade;
  uniform vec3 uThread;
  uniform float uThreadAmt;
  uniform float uLeftCalm;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    mat2 r = mat2(0.8, -0.6, 0.6, 0.8);
    for (int i = 0; i < 5; i++) { v += a * noise(p); p = r * p * 2.02; a *= 0.5; }
    return v;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uRes;
    float aspect = uRes.x / uRes.y;
    vec2 p = vec2(uv.x * aspect, uv.y) * 1.35;
    p += (uMouse - 0.5) * 0.18;
    float t = uTime * 0.035;

    vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3) - t));
    vec2 r = vec2(fbm(p + 3.2 * q + vec2(1.7, 9.2) + 0.6 * t),
                  fbm(p + 3.2 * q + vec2(8.3, 2.8) - 0.5 * t));
    float f = fbm(p + 3.0 * r);

    // Fabric folds: soft light and shade along the warped field
    float fold = smoothstep(0.25, 0.85, f);
    vec3 col = mix(uBase, uFold, fold);
    col = mix(col, uShade, smoothstep(0.55, 0.0, f) * 0.55);

    // Thin bright ridges: the gold threads
    float band = sin((f + r.x * 0.6) * 18.0 + t * 6.0);
    float thread = pow(1.0 - abs(band), 14.0) * smoothstep(0.35, 0.75, r.y);
    float calm = mix(1.0, smoothstep(0.05, 0.75, uv.x), uLeftCalm);
    col += uThread * thread * uThreadAmt * calm;

    // Soft vignette and film grain
    float vig = smoothstep(1.25, 0.25, length((uv - 0.5) * vec2(aspect * 0.7, 1.0)));
    col *= mix(0.82, 1.0, vig);
    col += (hash(gl_FragCoord.xy + fract(uTime) * 61.0) - 0.5) * 0.028;

    gl_FragColor = vec4(col, 1.0);
  }
`;

export type SilkPalette = 'navy' | 'gold';

interface Palette {
  base: string;
  fold: string;
  shade: string;
  thread: string;
  threadAmt: number;
  leftCalm: number;
}

const PALETTES: Record<SilkPalette, Palette> = {
  navy: { base: '#0B1830', fold: '#1D2F52', shade: '#071022', thread: '#C4A36B', threadAmt: 0.55, leftCalm: 0.85 },
  gold: { base: '#BC9A63', fold: '#D5BF93', shade: '#B08D57', thread: '#F3EFE6', threadAmt: 0.12, leftCalm: 0.6 },
};

const hex = (h: string): [number, number, number] => {
  const n = parseInt(h.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

/** Mounts the shader on a canvas. Returns a cleanup function, or null when WebGL is unavailable. */
export function mountSilk(canvas: HTMLCanvasElement, paletteName: SilkPalette, { still = false } = {}): (() => void) | null {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
  if (!gl) return null;

  const compile = (type: number, src: string) => {
    const s = gl.createShader(type);
    if (!s) throw new Error('createShader failed');
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'shader error');
    return s;
  };
  const prog = gl.createProgram();
  if (!prog) return null;
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const u = (name: string) => gl.getUniformLocation(prog, name);
  const pal = PALETTES[paletteName];
  gl.uniform3fv(u('uBase'), hex(pal.base));
  gl.uniform3fv(u('uFold'), hex(pal.fold));
  gl.uniform3fv(u('uShade'), hex(pal.shade));
  gl.uniform3fv(u('uThread'), hex(pal.thread));
  gl.uniform1f(u('uThreadAmt'), pal.threadAmt);
  const uLeftCalm = u('uLeftCalm');
  const uRes = u('uRes'), uTime = u('uTime'), uMouse = u('uMouse');

  // Render below native resolution: the field is soft, and this keeps it cheap.
  // Smaller devices and low core counts get an even lighter buffer.
  const light = (navigator.hardwareConcurrency || 8) <= 4 || window.matchMedia('(max-width: 600px)').matches;
  const scale = Math.min(window.devicePixelRatio || 1, 1.25) * (light ? 0.42 : 0.6);
  const resize = () => {
    if (!canvas.clientWidth) return;
    const w = Math.max(1, Math.round(canvas.clientWidth * scale));
    const h = Math.max(1, Math.round(canvas.clientHeight * scale));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
    gl.uniform2f(uRes, w, h);
    // In tall, single-column layouts the text spans the whole width, so keep threads everywhere
    gl.uniform1f(uLeftCalm, w / h < 0.9 ? Math.min(pal.leftCalm, 0.2) : pal.leftCalm);
  };

  const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
  const host = canvas.parentElement ?? canvas;
  const onPointer = (e: PointerEvent) => {
    const r = host.getBoundingClientRect();
    mouse.tx = (e.clientX - r.left) / r.width;
    mouse.ty = 1 - (e.clientY - r.top) / r.height;
  };
  host.addEventListener('pointermove', onPointer);

  let visible = true;
  let raf = 0;
  const start = performance.now() - 12000;
  const frame = (now: number) => {
    resize();
    mouse.x += (mouse.tx - mouse.x) * 0.04;
    mouse.y += (mouse.ty - mouse.y) * 0.04;
    gl.uniform1f(uTime, (now - start) / 1000);
    gl.uniform2f(uMouse, mouse.x, mouse.y);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (!still && visible && !document.hidden) raf = requestAnimationFrame(frame);
  };

  const restart = () => {
    cancelAnimationFrame(raf);
    if (!still && visible && !document.hidden) raf = requestAnimationFrame(frame);
  };
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    restart();
  });
  io.observe(canvas);
  const onResize = () => { if (still) frame(performance.now()); };
  document.addEventListener('visibilitychange', restart);
  window.addEventListener('resize', onResize);

  canvas.classList.add('is-live');
  frame(performance.now());

  return () => {
    cancelAnimationFrame(raf);
    io.disconnect();
    host.removeEventListener('pointermove', onPointer);
    document.removeEventListener('visibilitychange', restart);
    window.removeEventListener('resize', onResize);
    // The context is kept: React may mount this canvas again (StrictMode, fast refresh).
    canvas.classList.remove('is-live');
  };
}
