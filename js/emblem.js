// Emblem: the Sponsuno icon as a 3D object. The tile, the S and the gold dot are extruded
// straight from assets/Sponsuno_Icon.svg, lit with a studio environment, with drifting gold dust.
// Three.js is only downloaded once the visitor scrolls near the emblem.

const host = document.querySelector('[data-emblem]');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

async function init() {
  const [THREE, { SVGLoader }, { RoomEnvironment }, svgSource] = await Promise.all([
    import('three'),
    import('three/addons/loaders/SVGLoader.js'),
    import('three/addons/environments/RoomEnvironment.js'),
    fetch('assets/Sponsuno_Icon.svg').then((r) => r.text()),
  ]);

  // SVGLoader cannot read gradient fills, so the tile gets a flat navy marker colour.
  const { paths } = new SVGLoader().parse(svgSource.replace(/url\(#\w+\)/g, '#0B1830'));

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'default' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.035).texture;
  pmrem.dispose();

  const camera = new THREE.PerspectiveCamera(28, 1, 1, 4000);
  camera.position.set(0, 0, 640);

  const key = new THREE.DirectionalLight(0xffe2b0, 2.2);
  key.position.set(-300, 400, 500);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x8fa6d6, 1.2);
  rim.position.set(400, -200, -300);
  scene.add(rim);
  const front = new THREE.PointLight(0xffe7bf, 0.6, 0, 0);
  front.position.set(60, 40, 600);
  scene.add(front);
  // Warm spot so the gold dot reads as gold, not brown
  const dotLight = new THREE.SpotLight(0xffdca0, 3, 0, Math.PI / 9, 0.6, 0);
  dotLight.position.set(150, -60, 420);
  dotLight.target.position.set(42, -48, 0);
  scene.add(dotLight, dotLight.target);

  // Colours stay on the CD palette: Navy, Elfenbein, Gold, Gold hell
  const materials = {
    tile: new THREE.MeshPhysicalMaterial({ color: 0x0b1830, metalness: 0.3, roughness: 0.34, clearcoat: 1, clearcoatRoughness: 0.12 }),
    rim: new THREE.MeshPhysicalMaterial({ color: 0xc4a36b, metalness: 0.85, roughness: 0.28, envMapIntensity: 3 }),
    letter: new THREE.MeshPhysicalMaterial({ color: 0xf3efe6, metalness: 0.05, roughness: 0.32, clearcoat: 0.6, envMapIntensity: 1.3 }),
    dot: new THREE.MeshPhysicalMaterial({ color: 0xc4a36b, metalness: 0.85, roughness: 0.25, envMapIntensity: 3 }),
  };

  const emblem = new THREE.Group();
  const flip = new THREE.Group();
  flip.scale.set(1, -1, 1);
  emblem.add(flip);

  const extrude = (path, depth, bevel, sizeRatio = 0.7) => new THREE.ExtrudeGeometry(SVGLoader.createShapes(path), {
    depth, curveSegments: 24,
    bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel * sizeRatio, bevelSegments: 5,
  });

  paths.forEach((path) => {
    const fill = String(path.userData?.style?.fill || '').toLowerCase();
    if (fill === '#0b1830') {
      // Navy enamel tile on a gold frame that stands out past the tile's bevel
      const tile = new THREE.Mesh(extrude(path, 26, 5, 0.3), materials.tile);
      tile.position.z = -26;
      flip.add(tile);
      const frame = new THREE.Mesh(extrude(path, 16, 3), materials.rim);
      frame.scale.set(1.08, 1.08, 1);
      frame.position.set(-8, -8, -30);
      flip.add(frame);
    } else if (fill === '#f3efe6') {
      const s = new THREE.Mesh(extrude(path, 12, 2.5), materials.letter);
      s.position.z = 4;
      flip.add(s);
    } else if (fill === '#b08d57') {
      const d = new THREE.Mesh(extrude(path, 10, 5), materials.dot);
      d.position.z = 6;
      flip.add(d);
    }
  });

  // SVG viewBox is 200 x 200 around (100, 100); centre it on the origin.
  flip.position.set(-100, 100, 0);
  emblem.rotation.set(-0.08, reduceMotion ? -0.35 : 0, 0);
  scene.add(emblem);

  const sprite = (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(243,239,230,1)');
    grad.addColorStop(0.35, 'rgba(196,163,107,.55)');
    grad.addColorStop(1, 'rgba(196,163,107,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  })();

  // Gold dust (skipped entirely for reduced motion)
  const dustCount = reduceMotion ? 0 : 220;
  const dustGeo = new THREE.BufferGeometry();
  const dustSeed = new Float32Array(dustCount);
  let dust = null;
  if (dustCount) {
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      const r = 150 + Math.random() * 260;
      const a = Math.random() * Math.PI * 2;
      dustPos[i * 3] = Math.cos(a) * r;
      dustPos[i * 3 + 1] = (Math.random() - 0.5) * 520;
      dustPos[i * 3 + 2] = Math.sin(a) * r * 0.6 - 60;
      dustSeed[i] = Math.random() * 100;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
      size: 9, map: sprite, transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending, sizeAttenuation: true, opacity: 0.75,
    }));
    scene.add(dust);
  }

  // Sparks for the "joined" moment
  const sparkCount = 90;
  const sparkGeo = new THREE.BufferGeometry();
  const sparkPos = new Float32Array(sparkCount * 3);
  const sparkVel = new Float32Array(sparkCount * 3);
  sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
  const sparkMat = new THREE.PointsMaterial({
    size: 14, map: sprite, transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending, opacity: 0,
  });
  scene.add(new THREE.Points(sparkGeo, sparkMat));
  let sparkLife = 0;

  const draw = () => renderer.render(scene, camera);

  const resize = () => {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (reduceMotion) draw();
  };
  resize();
  new ResizeObserver(resize).observe(host);

  host.classList.add('is-live');

  // Reduced motion: one still frame, redrawn only on resize. No loop, no spin, no sparks.
  if (reduceMotion) {
    draw();
    return;
  }

  const pointer = { x: 0, y: 0 };
  window.addEventListener('pointermove', (e) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  let spin = 0, spinTarget = 0;
  document.addEventListener('sponsuno:joined', () => {
    spinTarget += Math.PI * 2;
    sparkLife = 1;
    for (let i = 0; i < sparkCount; i++) {
      const a = Math.random() * Math.PI * 2, b = (Math.random() - 0.5) * Math.PI;
      const v = 4 + Math.random() * 7;
      sparkPos.set([0, 0, 40], i * 3);
      sparkVel.set([Math.cos(a) * Math.cos(b) * v, Math.sin(b) * v, Math.sin(a) * Math.cos(b) * v], i * 3);
    }
  });

  const clock = new THREE.Clock();
  let visible = false;
  let raf = 0;
  const loop = () => {
    const t = clock.getElapsedTime();
    const rect = host.getBoundingClientRect();
    const scrollT = 1 - (rect.top + rect.height / 2) / window.innerHeight;

    spin += (spinTarget - spin) * 0.045;
    const idle = Math.sin(t * 0.6) * 0.28;
    emblem.rotation.y += ((idle + pointer.x * 0.45 + scrollT * 0.6 + spin) - emblem.rotation.y) * 0.06;
    emblem.rotation.x += ((pointer.y * 0.25 - 0.08) - emblem.rotation.x) * 0.06;
    emblem.position.y = Math.sin(t * 0.9) * 10;

    const arr = dustGeo.attributes.position.array;
    for (let i = 0; i < dustCount; i++) {
      arr[i * 3 + 1] += 0.25 + Math.sin(t + dustSeed[i]) * 0.1;
      if (arr[i * 3 + 1] > 270) arr[i * 3 + 1] = -270;
    }
    dustGeo.attributes.position.needsUpdate = true;
    dust.rotation.y = t * 0.05;

    if (sparkLife > 0) {
      sparkLife = Math.max(0, sparkLife - 0.012);
      for (let i = 0; i < sparkCount * 3; i++) {
        sparkPos[i] += sparkVel[i];
        sparkVel[i] *= 0.965;
      }
      sparkGeo.attributes.position.needsUpdate = true;
      sparkMat.opacity = sparkLife;
    }

    draw();
    if (visible && !document.hidden) raf = requestAnimationFrame(loop);
  };

  const restart = () => {
    cancelAnimationFrame(raf);
    if (visible && !document.hidden) raf = requestAnimationFrame(loop);
  };
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; restart(); }, { rootMargin: '100px' }).observe(host);
  document.addEventListener('visibilitychange', restart);
  draw();
}

if (host) {
  // Load and build only when the emblem is about to scroll into view.
  const io = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    io.disconnect();
    init().catch((err) => {
      // The static logo inside the host stays visible as a fallback.
      console.warn('Emblem could not start:', err);
    });
  }, { rootMargin: '900px 0px' });
  io.observe(host);
}
