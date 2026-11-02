(() => {
  const root = document.documentElement;
  const motion = root.classList.contains('motion');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const hasGsap = Boolean(gsap && ScrollTrigger);
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const headerOffset = () => {
    const css = getComputedStyle(root);
    return parseFloat(css.getPropertyValue('--header-h')) + parseFloat(css.getPropertyValue('--header-gap')) + 20;
  };

  /* ---------- Smooth scrolling ---------- */
  let lenis = null;
  if (motion && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.1, wheelMultiplier: 1 });
    if (hasGsap) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const loop = (t) => { lenis.raf(t); requestAnimationFrame(loop); };
      requestAnimationFrame(loop);
    }
  }

  const scrollToHash = (hash) => {
    const target = hash === '#top' ? document.body : $(hash);
    if (!target) return;
    if (lenis) {
      lenis.scrollTo(hash === '#top' ? 0 : target, { offset: -headerOffset() + 8, duration: 1.4 });
    } else {
      const y = hash === '#top' ? 0 : target.getBoundingClientRect().top + window.scrollY - headerOffset() + 8;
      window.scrollTo({ top: y, behavior: motion ? 'smooth' : 'auto' });
    }
    // Move keyboard focus with the scroll, without a second jump
    const focusEl = hash === '#top' ? $('#top') : target;
    if (focusEl) {
      if (!focusEl.hasAttribute('tabindex')) focusEl.setAttribute('tabindex', '-1');
      focusEl.focus({ preventScroll: true });
    }
    history.replaceState(null, '', hash);
  };

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const hash = link.getAttribute('href');
    if (hash.length < 2) return;
    event.preventDefault();
    closeMenu(false, false);
    scrollToHash(hash);
  });

  /* ---------- Header: progress, hide on scroll down, scroll spy ---------- */
  const header = $('[data-header]');
  const navList = $('[data-nav-list]');
  const indicator = $('[data-nav-indicator]');
  const navLinks = $$('a', navList);
  const spySections = navLinks.map((a) => $(a.getAttribute('href'))).filter(Boolean);
  let lastY = null;
  let anchorY = 0;
  let direction = 0;
  let activeLink = null;

  const moveIndicator = (link) => {
    if (link === activeLink) return;
    navLinks.forEach((a) => a.classList.toggle('is-active', a === link));
    activeLink = link;
    if (!link) { indicator.classList.remove('is-on'); return; }
    indicator.style.left = `${link.offsetLeft}px`;
    indicator.style.width = `${link.offsetWidth}px`;
    indicator.classList.add('is-on');
  };

  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    header.style.setProperty('--progress', max > 0 ? (y / max).toFixed(4) : 0);
    header.classList.toggle('is-scrolled', y > 10);

    // Hide after 40px of scrolling down, show after 40px up. Jumps (anchors, reloads) never hide it.
    const menuOpen = document.body.classList.contains('menu-open');
    const focusInside = header.contains(document.activeElement);
    if (lastY === null || Math.abs(y - lastY) > 300) {
      anchorY = y;
      header.classList.remove('is-hidden');
    } else {
      const dir = Math.sign(y - lastY);
      if (dir && dir !== direction) { direction = dir; anchorY = lastY; }
      if (y <= 520 || menuOpen || focusInside || anchorY - y > 40) header.classList.remove('is-hidden');
      else if (y - anchorY > 40) header.classList.add('is-hidden');
    }
    lastY = y;

    const line = window.innerHeight * 0.4;
    let current = null;
    spySections.forEach((section, i) => {
      if (section.getBoundingClientRect().top <= line) current = navLinks[i];
    });
    const last = spySections[spySections.length - 1];
    if (last && last.getBoundingClientRect().bottom < line) current = null;
    moveIndicator(current);
  };
  if (lenis) lenis.on('scroll', onScroll); else window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { const l = activeLink; activeLink = null; moveIndicator(l); });
  header.addEventListener('focusin', () => header.classList.remove('is-hidden'));
  onScroll();

  /* ---------- Mobile menu ---------- */
  const toggle = $('[data-nav-toggle]');
  const menu = $('[data-menu]');
  const toggleLabel = $('.visually-hidden', toggle);
  const background = [$('main'), $('[data-footer]')];
  let menuAnim = null;

  function openMenu() {
    menuAnim?.kill();
    menu.hidden = false;
    background.forEach((el) => { el.inert = true; });
    document.body.classList.add('menu-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggleLabel.textContent = 'Menü schliessen';
    lenis?.stop();
    if (hasGsap && motion) {
      menuAnim = gsap.fromTo(menu, { clipPath: 'circle(0% at 92% 4%)' }, { clipPath: 'circle(150% at 92% 4%)', duration: 0.8, ease: 'expo.out' });
      gsap.fromTo($$('.menu-links a', menu), { yPercent: 110 }, { yPercent: 0, duration: 0.9, ease: 'expo.out', stagger: 0.06, delay: 0.1 });
      gsap.fromTo($$('.menu-cta, .menu-note', menu), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, delay: 0.35 });
    }
    $('a', menu).focus();
  }
  function closeMenu(returnFocus = true, animate = true) {
    if (menu.hidden || toggle.getAttribute('aria-expanded') === 'false') return;
    background.forEach((el) => { el.inert = false; });
    menuAnim?.kill();
    if (hasGsap && motion && animate) {
      menuAnim = gsap.to(menu, { clipPath: 'circle(0% at 92% 4%)', duration: 0.5, ease: 'expo.in', onComplete: () => { menu.hidden = true; } });
    } else {
      menu.hidden = true;
    }
    document.body.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggleLabel.textContent = 'Menü öffnen';
    lenis?.start();
    if (returnFocus) toggle.focus();
  }
  toggle.addEventListener('click', () => (menu.hidden ? openMenu() : closeMenu()));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
  window.matchMedia('(min-width: 1021px)').addEventListener('change', (mq) => { if (mq.matches) closeMenu(false, false); });

  /* ---------- Shaders ---------- */
  if (window.Silk) {
    $$('[data-silk]').forEach((canvas) => {
      try { window.Silk.mount(canvas, canvas.dataset.silk, { still: !motion }); } catch (err) { console.warn('Silk shader unavailable:', err); }
    });
  }

  /* ---------- Hero pointer light and match tilt ---------- */
  const hero = $('.hero');
  const stage = $('[data-tilt-stage]');
  if (motion && finePointer) {
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      hero.style.setProperty('--gx', `${px * 100}%`);
      hero.style.setProperty('--gy', `${py * 100}%`);
      stage.style.setProperty('--ry', `${(px - 0.5) * 8}deg`);
      stage.style.setProperty('--rx', `${(0.5 - py) * 6}deg`);
    });
    hero.addEventListener('pointerleave', () => {
      stage.style.setProperty('--ry', '0deg');
      stage.style.setProperty('--rx', '0deg');
    });
  }

  /* ---------- Word splitting ---------- */
  const splitWords = (el) => {
    const text = el.textContent.trim();
    el.setAttribute('aria-label', text.replace(/\u00AD/g, ''));
    el.textContent = '';
    text.split(/\s+/).forEach((word, i, all) => {
      const outer = document.createElement('span');
      outer.className = 'word';
      outer.setAttribute('aria-hidden', 'true');
      const inner = document.createElement('span');
      inner.textContent = word;
      outer.appendChild(inner);
      el.appendChild(outer);
      if (i < all.length - 1) el.appendChild(document.createTextNode(' '));
    });
    return $$('.word > span', el);
  };

  /* ---------- Hero match ---------- */
  const match = $('[data-match]');
  const matchApi = (() => {
    const path = $('[data-thread-path]', match);
    const glow = $('[data-thread-glow]', match);
    const spark = $('[data-spark]', match);
    const anchorA = $('[data-anchor="a"]', match);
    const anchorB = $('[data-anchor="b"]', match);
    const rows = $$('.criteria li', match);
    const steps = $$('[data-step]', match);
    const DRAW_START = 500;
    const DRAW_MS = 2000;
    let timers = [];
    let length = 0;
    let played = false;
    let sparkRaf = 0;

    const centerOf = (el) => {
      const s = stage.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2 - s.left, y: r.top + r.height / 2 - s.top };
    };

    const layout = () => {
      const a = centerOf(anchorA);
      const b = centerOf(anchorB);
      const last = centerOf(rows[rows.length - 1]);
      const bend = Math.min(last.y + 12, b.y - 24);
      const mid = (bend + b.y) / 2;
      const d = `M ${a.x} ${a.y} V ${bend} C ${a.x} ${mid} ${b.x} ${mid} ${b.x} ${b.y}`;
      path.setAttribute('d', d);
      glow.setAttribute('d', d);
      length = path.getTotalLength();
      [path, glow].forEach((p) => { p.style.strokeDasharray = `${length}`; });
      return a;
    };

    const setStep = (n) => steps.forEach((el) => el.classList.toggle('is-on', Number(el.dataset.step) <= n));
    const setOffset = (value, transition) => [path, glow].forEach((p) => {
      p.style.transition = transition;
      p.style.strokeDashoffset = value;
    });

    // Measure the stage untilted, otherwise the thread would follow the tilted card positions
    const measureFlat = () => {
      stage.style.transition = 'none';
      stage.style.transform = 'none';
      const a = layout();
      stage.style.transform = '';
      void stage.offsetWidth;
      stage.style.transition = '';
      return a;
    };

    const showFinal = () => {
      timers.forEach(clearTimeout);
      timers = [];
      cancelAnimationFrame(sparkRaf);
      played = true;
      measureFlat();
      setOffset('0', 'none');
      setStep(99);
      spark.style.opacity = '0';
    };

    const runSpark = (t0) => {
      cancelAnimationFrame(sparkRaf);
      const tick = (now) => {
        const p = Math.min(1, Math.max(0, (now - t0) / DRAW_MS));
        const pt = path.getPointAtLength(p * length);
        spark.style.transform = `translate(${pt.x}px, ${pt.y}px)`;
        spark.style.opacity = p > 0 && p < 1 ? '1' : '0';
        if (p < 1) sparkRaf = requestAnimationFrame(tick);
      };
      sparkRaf = requestAnimationFrame(tick);
    };

    const play = () => {
      timers.forEach(clearTimeout);
      timers = [];
      match.classList.add('is-animated');
      const a = measureFlat();
      setOffset(`${length}`, 'none');
      setStep(0);
      void path.getBoundingClientRect();

      timers.push(setTimeout(() => setStep(1), 60));
      timers.push(setTimeout(() => {
        setOffset('0', `stroke-dashoffset ${DRAW_MS}ms linear`);
        runSpark(performance.now());
      }, DRAW_START));
      rows.forEach((row) => {
        const y = centerOf(row).y;
        const at = DRAW_START + DRAW_MS * Math.max(0, (y - a.y) / length);
        timers.push(setTimeout(() => setStep(Number(row.dataset.step)), at));
      });
      timers.push(setTimeout(() => {
        setStep(99);
        anchorB.classList.remove('is-pulse');
        void anchorB.offsetWidth;
        anchorB.classList.add('is-pulse');
        played = true;
      }, DRAW_START + DRAW_MS + 60));
    };

    // Any resize, also one during the intro, ends in a correctly measured final state
    let frame;
    let lastWidth = window.innerWidth;
    window.addEventListener('resize', () => {
      if (window.innerWidth === lastWidth && !played) return;
      lastWidth = window.innerWidth;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => { if (played || timers.length) showFinal(); });
    });
    $('[data-replay]', match).addEventListener('click', () => {
      played = false;
      if (motion) play(); else showFinal();
    });

    return { play, showFinal };
  })();

  /* ---------- Intro ---------- */
  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
  // On narrow screens the match sits below the first screen, so it plays when it scrolls into view.
  const playMatchWhenVisible = () => {
    if (!window.matchMedia('(max-width: 960px)').matches) { matchApi.play(); return; }
    match.classList.add('is-animated');
    $$('[data-step]', match).forEach((el) => el.classList.remove('is-on'));
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      matchApi.play();
    }, { threshold: 0.35 });
    io.observe(match);
  };

  fontsReady.then(() => {
    clearTimeout(window.__introFailsafe);
    const title = $('[data-intro-title]');
    if (!motion) { matchApi.showFinal(); return; }
    if (!hasGsap || root.classList.contains('intro-done')) {
      root.classList.add('intro-done');
      playMatchWhenVisible();
      return;
    }
    const words = splitWords(title);
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' }, onComplete: () => root.classList.add('intro-done') });
    tl.fromTo('.hero-kicker', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.9 }, 0.1)
      .set(title, { opacity: 1 }, 0.2)
      .fromTo(words, { yPercent: 115, rotate: 4 }, { yPercent: 0, rotate: 0, duration: 1.3, stagger: 0.08 }, 0.2)
      .fromTo('.hero-lead, .hero-actions, .hero-note', { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 1, stagger: 0.1 }, 0.6)
      .add(playMatchWhenVisible, 0.45);
  });

  /* ---------- Scroll choreography ---------- */
  const splitTargets = $$('[data-split]');
  const revealTargets = $$('[data-reveal]');
  const problems = $$('.problem');

  if (hasGsap && motion) {
    splitTargets.forEach((el) => {
      const words = splitWords(el);
      gsap.fromTo(words, { yPercent: 110 }, {
        yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: 0.05,
        scrollTrigger: { trigger: el, start: 'top 86%', once: true },
      });
    });

    gsap.set(revealTargets, { opacity: 0, y: 34 });
    ScrollTrigger.batch(revealTargets, {
      start: 'top 88%',
      once: true,
      onEnter: (batch) => {
        gsap.to(batch, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.09, clearProps: 'transform,opacity' });
        batch.forEach((el) => el.classList.add('is-in'));
      },
    });

    // Steps: the gold rail fills with scroll and each dot lights when the fill reaches it
    const stepsWrap = $('[data-steps]');
    const fill = $('[data-steps-fill]');
    const stepEls = $$('.step', stepsWrap);
    const mm = gsap.matchMedia();
    mm.add('(min-width: 1081px)', () => {
      gsap.fromTo(fill, { scaleX: 0, scaleY: 1 }, {
        scaleX: 1, ease: 'none',
        scrollTrigger: {
          trigger: stepsWrap, start: 'top 78%', end: 'bottom 60%', scrub: 0.6,
          onUpdate: (self) => {
            const w = stepsWrap.offsetWidth;
            stepEls.forEach((s) => s.classList.toggle('is-reached', self.progress * w >= s.offsetLeft - 2));
          },
        },
      });
    });
    mm.add('(max-width: 600px)', () => {
      gsap.fromTo(fill, { scaleY: 0, scaleX: 1 }, {
        scaleY: 1, ease: 'none',
        scrollTrigger: {
          trigger: stepsWrap, start: 'top 70%', end: 'bottom 55%', scrub: 0.6,
          onUpdate: (self) => {
            const h = stepsWrap.offsetHeight;
            stepEls.forEach((s) => s.classList.toggle('is-reached', self.progress * h >= s.offsetTop - 2));
          },
        },
      });
    });
    gsap.fromTo($$('.step-num span', stepsWrap), { yPercent: 100 }, {
      yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: 0.12,
      scrollTrigger: { trigger: stepsWrap, start: 'top 82%', once: true },
    });

    // KI assistant: panel assembles itself, the meter fills and the draft types out
    const assistant = $('[data-assistant]');
    const items = $$('[data-assistant-item]', assistant);
    const meter = $('[data-meter]', assistant);
    const draft = $('[data-typewriter]', assistant);
    const fullText = draft.textContent;
    gsap.set(assistant, { opacity: 0, y: 40 });
    gsap.set(items, { opacity: 0, y: 26 });
    gsap.set(meter, { width: '0%' });
    ScrollTrigger.create({
      trigger: assistant, start: 'top 75%', once: true,
      onEnter: () => {
        const tl = gsap.timeline();
        tl.to(assistant, { y: 0, opacity: 1, duration: 1.1, ease: 'expo.out', clearProps: 'transform' })
          .to(items, { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out', stagger: 0.18, clearProps: 'transform' }, 0.25)
          .to(meter, { width: '66.6%', duration: 1.2, ease: 'power3.out' }, 0.8)
          .add(() => typeOut(draft, fullText), 1.0);
      },
    });

    // Footer wordmark rises with scroll
    const wm = $$('[data-wordmark] > span');
    gsap.fromTo(wm, { yPercent: 55, opacity: 0 }, {
      yPercent: 0, opacity: 1, ease: 'none', stagger: 0.12,
      scrollTrigger: { trigger: '[data-footer]', start: 'top 85%', end: 'bottom bottom', scrub: 0.8 },
    });

    fontsReady.then(() => ScrollTrigger.refresh());
  } else {
    problems.forEach((p) => p.classList.add('is-in'));
    $$('.step').forEach((s) => s.classList.add('is-reached'));
  }

  function typeOut(el, text) {
    el.style.minHeight = `${el.offsetHeight}px`;
    el.textContent = '';
    el.classList.add('is-typing');
    let i = 0;
    const step = () => {
      i += Math.random() < 0.15 ? 2 : 1;
      el.textContent = text.slice(0, i);
      if (i < text.length) setTimeout(step, 18 + Math.random() * 30);
      else setTimeout(() => el.classList.remove('is-typing'), 1600);
    };
    step();
  }

  /* ---------- Pointer details: card tilt, magnetic buttons, footer spotlight ---------- */
  if (motion && finePointer) {
    $$('[data-tilt]').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        card.style.setProperty('--ry', `${(px - 0.5) * 7}deg`);
        card.style.setProperty('--rx', `${(0.5 - py) * 6}deg`);
        card.style.setProperty('--gx', `${px * 100}%`);
        card.style.setProperty('--gy', `${py * 100}%`);
      });
      card.addEventListener('pointerleave', () => {
        card.style.setProperty('--ry', '0deg');
        card.style.setProperty('--rx', '0deg');
      });
    });

    $$('[data-magnetic]').forEach((btn) => {
      btn.addEventListener('pointermove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.22;
        const y = (e.clientY - r.top - r.height / 2) * 0.32;
        if (hasGsap) gsap.to(btn, { x, y, duration: 0.5, ease: 'power3.out' });
        else btn.style.transform = `translate(${x}px, ${y}px)`;
      });
      btn.addEventListener('pointerleave', () => {
        if (hasGsap) gsap.to(btn, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)' });
        else btn.style.transform = '';
      });
    });

    const footer = $('[data-footer]');
    const wmSpans = $$('[data-wordmark] > span:not(.wm-dot)');
    footer.addEventListener('pointermove', (e) => {
      wmSpans.forEach((s) => {
        const r = s.getBoundingClientRect();
        s.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
        s.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
      });
    });
    footer.addEventListener('pointerleave', () => wmSpans.forEach((s) => s.style.setProperty('--mx', '-50%')));
  }

  /* ---------- Ribbon: pause control for the moving list ---------- */
  const ribbon = $('[data-ribbon]');
  const ribbonPause = $('[data-ribbon-pause]');
  ribbonPause.addEventListener('click', () => {
    const paused = ribbon.classList.toggle('is-paused');
    ribbonPause.setAttribute('aria-pressed', String(paused));
    $('.visually-hidden', ribbonPause).textContent = paused ? 'Laufband fortsetzen' : 'Laufband anhalten';
  });

  /* ---------- FAQ: animate open and close ---------- */
  $$('[data-faq] details').forEach((d) => {
    const summary = $('summary', d);
    const body = $('.faq-body', d);
    let anim = null;
    let closing = false;
    summary.addEventListener('click', (e) => {
      if (!motion || !body.animate) return;
      e.preventDefault();
      const from = anim ? body.getBoundingClientRect().height : null;
      anim?.cancel();
      const ease = 'cubic-bezier(.16,1,.3,1)';
      if (d.open && !closing) {
        closing = true;
        anim = body.animate(
          [{ height: `${from ?? body.offsetHeight}px`, opacity: 1 }, { height: '0px', opacity: 0 }],
          { duration: 380, easing: ease, fill: 'forwards' },
        );
        anim.onfinish = () => { d.open = false; closing = false; anim.cancel(); anim = null; };
      } else {
        closing = false;
        d.open = true;
        anim = body.animate(
          [{ height: `${from ?? 0}px`, opacity: from ? 1 : 0 }, { height: `${body.scrollHeight}px`, opacity: 1 }],
          { duration: 520, easing: ease },
        );
        anim.onfinish = () => { anim = null; };
      }
    });
  });

  /* ---------- Waitlist ---------- */
  const form = $('[data-waitlist]');
  $$('[data-role-link]').forEach((link) => {
    link.addEventListener('click', () => {
      const radio = $(`input[name="rolle"][value="${link.dataset.roleLink}"]`, form);
      if (radio) radio.checked = true;
    });
  });

  // The form is not connected to a backend yet. Set WAITLIST_ENDPOINT to a URL that accepts
  // a JSON POST of { rolle, email } (e.g. a Formspree form) to store real sign-ups.
  // Until then the success state is only a preview: nothing is stored.
  const WAITLIST_ENDPOINT = '';
  const email = $('#email', form);
  const error = $('#email-error', form);
  const submitBtn = $('button[type="submit"]', form);
  const success = $('[data-success]');
  const MSG_INVALID = 'Bitte geben Sie eine gültige E-Mail-Adresse ein, zum Beispiel name@beispiel.ch.';
  const MSG_FAILED = 'Die Anmeldung hat nicht geklappt. Bitte versuchen Sie es in ein paar Minuten nochmals.';

  const showError = (msg) => {
    error.hidden = false;
    error.textContent = '';
    requestAnimationFrame(() => { error.textContent = msg; });
    email.setAttribute('aria-describedby', 'email-error email-hint');
    if (hasGsap && motion) gsap.fromTo('.email-row', { x: -8 }, { x: 0, duration: 0.6, ease: 'elastic.out(1, 0.3)' });
  };
  const clearError = () => {
    error.hidden = true;
    email.removeAttribute('aria-invalid');
    email.setAttribute('aria-describedby', 'email-hint');
  };
  email.addEventListener('input', clearError);

  const celebrate = () => {
    form.hidden = true;
    success.hidden = false;
    if (hasGsap && motion) gsap.fromTo(success, { opacity: 0, y: 20, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: 'expo.out' });
    success.focus({ preventScroll: true });
    // On one-column layouts the emblem sits below the form: bring it in before it spins
    const emblem = $('[data-emblem]');
    let delay = 0;
    if (window.matchMedia('(max-width: 960px)').matches && emblem) {
      delay = 500;
      if (lenis) lenis.scrollTo(emblem, { offset: -window.innerHeight * 0.3, duration: 1 });
      else emblem.scrollIntoView({ block: 'center', behavior: motion ? 'smooth' : 'auto' });
    }
    setTimeout(() => document.dispatchEvent(new CustomEvent('sponsuno:joined')), delay);
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    email.value = email.value.trim();
    if (!email.value || !email.checkValidity()) {
      email.setAttribute('aria-invalid', 'true');
      showError(MSG_INVALID);
      email.focus();
      return;
    }
    clearError();
    if (!WAITLIST_ENDPOINT) { celebrate(); return; }

    submitBtn.disabled = true;
    try {
      const res = await fetch(WAITLIST_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ rolle: form.elements.rolle.value, email: email.value }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      celebrate();
    } catch (err) {
      showError(MSG_FAILED);
    } finally {
      submitBtn.disabled = false;
    }
  });
})();
