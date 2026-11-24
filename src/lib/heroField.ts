// Hero background «Punkte» (owner's choice 2026-11-24, DESIGN.md -> Hero): a dot grid like a scoreboard on Tintenblau.
// A slow diagonal wave passes through it and the dots swell a little around the pointer (or the finger on a phone).
// One full-screen quad in WebGL 1, no library. Started from an effect (never during render: SSR-safe).
// Reduced motion: one still frame, no loop. Off screen or paused: no frames are drawn.

const VERTEX = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';

// Colours: Tintenblau #1A2B40 ground, Hafer #ECE6DA dots at 4-23 % (like the pitch lines, never a main motif).
const FRAGMENT = `
precision highp float;
uniform vec2 res, mouse;
uniform float time, dpr, hover;
const vec3 INK = vec3(26.,43.,64.)/255.;
const vec3 HAFER = vec3(236.,230.,218.)/255.;
void main(){
  vec2 px = gl_FragCoord.xy;
  float cell = 18.*dpr;
  vec2 ctr = (floor(px/cell) + .5)*cell;
  vec2 uv = ctr/res.y;
  vec2 m = mouse*res/res.y;
  float wave = .5 + .5*sin(dot(uv, vec2(1.6, 1.1))*3. - time*.55);
  vec2 d = uv - m;
  float near = exp(-dot(d,d)*10.)*hover;
  float r = (.7 + .9*wave*wave + 2.4*near)*dpr;
  float a = .045 + .06*wave + .18*near;
  float dotMask = 1. - smoothstep(r - .8*dpr, r + .6*dpr, length(px - ctr));
  vec3 c = mix(INK, HAFER, dotMask*a);
  c = mix(c, INK, smoothstep(.40, .0, px.y/res.y)*.6);   // quiet zone behind the lead and the buttons
  gl_FragColor = vec4(c, 1.);
}`;

export type HeroField = { setPaused: (paused: boolean) => void; destroy: () => void };

export function startHeroField(canvas: HTMLCanvasElement, still: boolean): HeroField | null {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
  if (!gl) return null;

  const compile = (type: number, src: string) => {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    return shader;
  };
  const program = gl.createProgram()!;
  gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(program, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const u = (name: string) => gl.getUniformLocation(program, name);
  const U = { res: u('res'), mouse: u('mouse'), time: u('time'), dpr: u('dpr'), hover: u('hover') };

  const target = { x: 0.7, y: 0.6 };
  const pos = { x: 0.7, y: 0.6 };
  let hover = 0;
  let hoverTarget = 0;
  let dpr = 1;
  let visible = true;
  let paused = false;
  let frame = 0;
  let clock = 8; // seconds of wave time; advances only while frames are drawn
  let last = 0;

  const draw = () => {
    pos.x += (target.x - pos.x) * 0.08;
    pos.y += (target.y - pos.y) * 0.08;
    hover += (hoverTarget - hover) * 0.05;
    gl.uniform2f(U.res, canvas.width, canvas.height);
    gl.uniform2f(U.mouse, pos.x, pos.y);
    gl.uniform1f(U.time, clock);
    gl.uniform1f(U.dpr, dpr);
    gl.uniform1f(U.hover, hover);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  const running = () => !still && !paused && visible && !document.hidden;
  const loop = (now: number) => {
    frame = 0;
    if (!running()) return;
    clock += Math.min(0.05, (now - (last || now)) / 1000);
    last = now;
    draw();
    frame = requestAnimationFrame(loop);
  };
  const kick = () => {
    if (running() && !frame) { last = 0; frame = requestAnimationFrame(loop); }
  };

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    draw();
  };

  const onMove = (x: number, y: number) => {
    const r = canvas.getBoundingClientRect();
    if (y < r.top || y > r.bottom) return;
    target.x = (x - r.left) / r.width;
    target.y = 1 - (y - r.top) / r.height;
    hoverTarget = 1;
    kick();
  };
  const onPointer = (e: PointerEvent) => onMove(e.clientX, e.clientY);
  const onTouch = (e: TouchEvent) => { if (e.touches[0]) onMove(e.touches[0].clientX, e.touches[0].clientY); };
  const onLeave = () => { hoverTarget = 0; };
  const onVisibility = () => kick();

  const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; kick(); });
  io.observe(canvas);
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  window.addEventListener('pointermove', onPointer, { passive: true });
  window.addEventListener('touchmove', onTouch, { passive: true });
  document.documentElement.addEventListener('pointerleave', onLeave);
  document.addEventListener('visibilitychange', onVisibility);

  resize();
  kick();

  return {
    setPaused(value) { paused = value; kick(); },
    destroy() {
      cancelAnimationFrame(frame);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('touchmove', onTouch);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('visibilitychange', onVisibility);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
}
