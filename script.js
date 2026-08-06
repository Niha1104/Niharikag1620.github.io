document.getElementById('year').textContent = new Date().getFullYear();

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ============================================================
   THEME TOGGLE (persisted)
   ============================================================ */
(function themeSetup() {
  const root = document.documentElement;
  const stored = localStorage.getItem('theme');
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  const initial = stored || (prefersLight ? 'light' : 'dark');
  root.setAttribute('data-theme', initial);

  document.getElementById('theme-toggle').addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });
})();

/* ============================================================
   MOBILE NAV
   ============================================================ */
(function navSetup() {
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');
  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open);
  });
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    links.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', false);
  }));
})();

/* ============================================================
   HERO TYPING SEQUENCE
   ============================================================ */
(function typeHero() {
  const line1 = document.getElementById('type-1');
  const line2 = document.getElementById('type-2');
  const TEXT_1 = 'Niharika Garikaparthi — Data Engineer';
  const TEXT_2 = 'I build the pipelines that turn raw events into decisions — in real time. 5+ years designing production-grade streaming and batch data platforms across healthcare, financial services, and consumer-scale event data.';

  if (REDUCED) {
    line1.textContent = TEXT_1;
    line2.textContent = TEXT_2;
    return;
  }

  function typeInto(el, text, speed, done) {
    let i = 0;
    (function step() {
      el.textContent = text.slice(0, i);
      i++;
      if (i <= text.length) {
        setTimeout(step, speed);
      } else if (done) {
        done();
      }
    })();
  }

  typeInto(line1, TEXT_1, 34, () => {
    setTimeout(() => typeInto(line2, TEXT_2, 10), 250);
  });
})();

/* ============================================================
   SYSTEM LOG TICKER
   ============================================================ */
(function tickerSetup() {
  const el = document.getElementById('ticker-text');
  const LINES = [
    '[INFO] kafka producer → customer_engagement_events',
    '[OK]   spark structured streaming: checkpoint committed',
    '[OK]   airflow: bronze_data_quality_check — 2/2 tasks passed',
    '[OK]   dbt: 8 tests, 8 passed',
    '[INFO] fastapi: GET /api/daily-summary 200 OK',
    '[OK]   github actions: ci — python-syntax-check, dbt-validate passed',
  ];

  if (REDUCED) return; // leave the first static line, no rotation

  let idx = 0;
  setInterval(() => {
    idx = (idx + 1) % LINES.length;
    el.style.opacity = 0;
    setTimeout(() => {
      el.textContent = LINES[idx];
      el.style.opacity = 1;
    }, 350);
  }, 3400);
})();

/* ============================================================
   SCROLL REVEAL
   ============================================================ */
(function revealSetup() {
  const targets = document.querySelectorAll(
    '.section__head, .about__text-card, .about__stats, .timeline__item, .featured-project, .project-card, .skill-group, .contact__row'
  );
  targets.forEach(el => el.classList.add('reveal'));

  if (REDUCED) {
    targets.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(el => io.observe(el));
})();

/* ============================================================
   3D TILT CARDS
   ============================================================ */
(function tiltSetup() {
  const isCoarse = window.matchMedia('(pointer: coarse)').matches;
  if (isCoarse || REDUCED) return;

  const cards = document.querySelectorAll('.tilt-card');
  const MAX_DEG = 5;

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const ry = (px - 0.5) * MAX_DEG * 2;
      const rx = (0.5 - py) * MAX_DEG * 2;
      card.style.setProperty('--rx', rx.toFixed(2) + 'deg');
      card.style.setProperty('--ry', ry.toFixed(2) + 'deg');
    });
    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });
})();

/* ============================================================
   HERO CANVAS — animated 3D pipeline / DAG graph
   ============================================================ */
(function heroGraph() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const isNarrow = window.innerWidth < 640;

  let w, h, dpr;
  let mouseX = 0, mouseY = 0;
  let angle = 0;

  const NODE_COUNT = isNarrow ? 26 : 46;
  const CONNECT_DIST = isNarrow ? 0.62 : 0.55;
  const PARTICLE_COUNT = isNarrow ? 5 : 9;

  const nodes = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    nodes.push({
      x: (Math.random() * 2 - 1),
      y: (Math.random() * 2 - 1) * 0.65,
      z: (Math.random() * 2 - 1),
    });
  }

  let edges = [];
  let particles = [];

  function computeEdges() {
    const list = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < CONNECT_DIST) list.push([i, j, dist]);
      }
    }
    return list;
  }

  function spawnParticle() {
    if (edges.length === 0) return { a: 0, b: 1, t: 0, speed: 0.006 };
    const e = edges[Math.floor(Math.random() * edges.length)];
    return { a: e[0], b: e[1], t: Math.random(), speed: 0.004 + Math.random() * 0.006 };
  }
  function initParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(spawnParticle());
  }

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = (e.clientY / window.innerHeight) * 2 - 1;
  });

  const themeColors = () => {
    const style = getComputedStyle(document.documentElement);
    return {
      accentRgb: style.getPropertyValue('--accent-rgb').trim() || '57,255,136',
      accent2Rgb: style.getPropertyValue('--accent-2-rgb').trim() || '255,184,107',
    };
  };

  function project(n, rot, camX, camY) {
    const cosA = Math.cos(rot), sinA = Math.sin(rot);
    const x = n.x * cosA + n.z * sinA;
    const z = -n.x * sinA + n.z * cosA;
    const y = n.y;

    const focal = 2.2;
    const scale = focal / (focal + z + 1.4);
    const spread = Math.min(w, h * 1.4) * 0.34;

    const screenX = w / 2 + (x - camX * 0.4) * scale * spread;
    const screenY = h * 0.46 + (y - camY * 0.25) * scale * spread;

    return { x: screenX, y: screenY, scale, z };
  }

  edges = computeEdges();
  initParticles();

  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, w, h);
    const { accentRgb, accent2Rgb } = themeColors();
    const projected = nodes.map(n => project(n, angle, mouseX, mouseY));

    frame++;
    if (frame % 40 === 1) {
      edges = computeEdges();
      if (particles.length === 0) initParticles();
    }

    edges.forEach(([i, j, dist]) => {
      const a = projected[i], b = projected[j];
      const avgScale = (a.scale + b.scale) / 2;
      const opacity = Math.max(0, (1 - dist / CONNECT_DIST) * 0.32 * avgScale);
      ctx.strokeStyle = `rgba(${accentRgb}, ${opacity.toFixed(3)})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    });

    projected.forEach(p => {
      const r = Math.max(1, 2.3 * p.scale);
      const opacity = Math.min(1, p.scale * 0.85);
      ctx.fillStyle = `rgba(${accentRgb}, ${opacity.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();
    });

    if (!REDUCED) {
      particles.forEach((p, idx) => {
        p.t += p.speed;
        if (p.t >= 1) { particles[idx] = spawnParticle(); return; }
        const a = projected[p.a], b = projected[p.b];
        if (!a || !b) return;
        const px = a.x + (b.x - a.x) * p.t;
        const py = a.y + (b.y - a.y) * p.t;
        const avgScale = (a.scale + b.scale) / 2;
        const r = Math.max(1.2, 2.5 * avgScale);
        ctx.fillStyle = `rgba(${accent2Rgb}, 0.95)`;
        ctx.shadowColor = `rgba(${accent2Rgb}, 0.9)`;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      angle += 0.0012;
    }

    requestAnimationFrame(draw);
  }
  draw();
})();
