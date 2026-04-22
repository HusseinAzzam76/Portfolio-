/* ─── ACCESS GATE ─── */
(function () {
  const gate = document.getElementById('accessGate');
  if (!gate) return;
  if (localStorage.getItem('access_granted') === '1') return;

  const output = document.getElementById('gateOutput');
  const promptLine = document.getElementById('gatePromptLine');
  const input = document.getElementById('gateInput');

  const lines = [
    { text: '[ boot ] initializing secure-access.sh ...', cls: 'g-dim', delay: 350 },
    { text: '[ boot ] establishing handshake ...',        cls: 'g-dim', delay: 450 },
    { text: '[ ok   ] connection established.',           cls: 'g-ok',  delay: 450 },
    { text: '',                                           delay: 120 },
    { text: 'SYSTEM: unknown visitor detected.',          cls: 'g-sys', delay: 550 },
    { text: 'SYSTEM: identify yourself to continue.',     cls: 'g-sys', delay: 650 },
    { text: '',                                           delay: 150 },
    { text: 'hint: every program starts with this greeting.', cls: 'g-dim', delay: 350 },
    { text: '',                                           delay: 100 },
  ];

  function appendLine(text, cls) {
    const div = document.createElement('div');
    if (cls) div.className = cls;
    div.textContent = text || ' ';
    output.appendChild(div);
  }

  let i = 0;
  (function nextLine() {
    if (i >= lines.length) {
      promptLine.style.visibility = 'visible';
      input.focus();
      return;
    }
    const line = lines[i++];
    appendLine(line.text, line.cls);
    setTimeout(nextLine, line.delay);
  })();

  const answers = ['hello world', 'hello, world', 'hello world!', 'hello,world', '"hello world"'];

  input.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const val = input.value.trim().toLowerCase();
    if (!val) return;
    appendLine('$ ' + input.value, 'g-cmd');
    input.value = '';
    if (answers.includes(val)) {
      grantAccess();
    } else {
      appendLine('access denied. incorrect. try again.', 'g-sys');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && gate.style.display !== 'none') skipGate();
  });

  function grantAccess() {
    appendLine('> ACCESS GRANTED. welcome, Alhussein.', 'g-ok');
    setTimeout(() => {
      gate.classList.add('gate-hidden');
      localStorage.setItem('access_granted', '1');
      setTimeout(() => { gate.style.display = 'none'; }, 550);
    }, 800);
  }

  window.skipGate = function () {
    gate.classList.add('gate-hidden');
    localStorage.setItem('access_granted', '1');
    setTimeout(() => { gate.style.display = 'none'; }, 550);
  };
})();

/* ─── PARTICLE NETWORK ─── */
(function () {
  const canvas = document.getElementById('matrix');
  const ctx = canvas.getContext('2d');
  const ACCENT = '0,200,100';
  const COUNT = 70;
  const MAX_DIST = 160;
  let particles = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function initParticles() {
    particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.5 + 1,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          ctx.strokeStyle = `rgba(${ACCENT},${(1 - dist / MAX_DIST) * 0.25})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    particles.forEach(p => {
      ctx.fillStyle = `rgba(${ACCENT},0.55)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
    });

    requestAnimationFrame(draw);
  }

  resize();
  initParticles();
  window.addEventListener('resize', () => { resize(); initParticles(); });
  draw();
})();

/* ─── TYPEWRITER ─── */
(function () {
  const phrases = [
    'Penetration Tester',
    'Ethical Hacker',
    'CTF Player',
    'Bug Hunter',
    'Red Teamer',
  ];
  const el = document.getElementById('typewriter');
  let pi = 0, ci = 0, deleting = false;

  function tick() {
    const phrase = phrases[pi];
    el.textContent = deleting ? phrase.slice(0, ci--) : phrase.slice(0, ci++);
    let delay = deleting ? 60 : 90;
    if (!deleting && ci > phrase.length) { delay = 1800; deleting = true; }
    if (deleting && ci < 0)             { delay = 400;  deleting = false; pi = (pi + 1) % phrases.length; }
    setTimeout(tick, delay);
  }
  tick();
})();

/* ─── WRITEUPS — loaded live from /api/writeups (Supabase) ─── */

/* ─── YOUTUBE HELPER ─── */
function getYouTubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  return m ? m[1] : null;
}

/* ─── RENDER WRITEUPS ─── */
const PLATFORM_LABELS = { htb: 'HackTheBox', thm: 'TryHackMe', ctf: 'CTF', real: 'Real World' };

function renderWriteups(writeups) {
  const grid  = document.getElementById('writeupsGrid');
  if (!writeups || !writeups.length) {
    grid.innerHTML = '';
    return;
  }

  grid.innerHTML = writeups.map(w => {
    const ytId      = getYouTubeId(w.video_url);
    const thumb     = ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : '';
    const diffLabel = w.difficulty.charAt(0).toUpperCase() + w.difficulty.slice(1);
    const platLabel = PLATFORM_LABELS[w.platform] || w.platform;
    const tags      = Array.isArray(w.tags) ? w.tags : [];

    return `
      <article class="card" data-category="${w.platform}">
        ${thumb ? `
        <div class="card-thumb" style="background-image:url('${thumb}')" onclick="openVideoModal('${w.video_url}')">
          <div class="card-play">▶</div>
        </div>` : ''}
        <div class="card-header">
          <span class="badge badge-${w.platform}">${platLabel}</span>
          <span class="badge badge-${w.difficulty}">${diffLabel}</span>
          ${w.date ? `<span class="card-date">${w.date}</span>` : ''}
        </div>
        <h3 class="card-title">${w.title}</h3>
        <p class="card-desc">${w.description || ''}</p>
        <div class="card-tags">${tags.map(t => `<span>#${t}</span>`).join('')}</div>
        <div class="card-actions">
          ${w.url
            ? `<a class="card-link" href="${w.url}" target="_blank" rel="noopener">Read Writeup →</a>`
            : `<span class="card-link-dim">Coming soon…</span>`}
          ${ytId ? `<button class="card-video-btn" onclick="openVideoModal('${w.video_url}')">▶ Watch</button>` : ''}
        </div>
      </article>
    `;
  }).join('');
}

async function loadWriteups() {
  try {
    if (location.protocol === 'file:') {
      renderWriteups([]);
      return;
    }
    const res  = await fetch('/api/writeups');
    const data = await res.json();
    renderWriteups(data);
  } catch (e) {
    renderWriteups([]);
  }
}

/* ─── VIDEO MODAL ─── */
function openVideoModal(url) {
  const id = getYouTubeId(url);
  if (!id) return;
  document.getElementById('modalIframe').src = `https://www.youtube.com/embed/${id}?autoplay=1`;
  document.getElementById('videoModal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('videoModal').classList.add('hidden');
  document.getElementById('modalIframe').src = '';
  document.body.style.overflow = '';
}

/* ─── COUNTER ANIMATION ─── */
function animateCounters() {
  document.querySelectorAll('.stat-num').forEach(el => {
    const target = +el.dataset.target;
    let current = 0;
    const step = Math.ceil(target / 40);
    const t = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = current + (target >= 10 ? '+' : '');
      if (current >= target) clearInterval(t);
    }, 40);
  });
}

/* ─── REVEAL ON SCROLL ─── */
function initReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll(
    '.card, .skill-card, .project-card, .cert-card, .about-text, .terminal-card, .contact-item'
  ).forEach(el => {
    el.classList.add('reveal');
    io.observe(el);
  });
}

/* ─── COUNTER TRIGGER ─── */
(function () {
  const hero = document.getElementById('hero');
  let triggered = false;
  const io = new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !triggered) { triggered = true; animateCounters(); }
  }, { threshold: 0.5 });
  io.observe(hero);
})();

/* ─── NAV SCROLL STYLE ─── */
window.addEventListener('scroll', () => {
  const nav = document.getElementById('nav');
  nav.style.borderBottomColor = window.scrollY > 20 ? 'rgba(0,200,100,.15)' : 'var(--border)';
});

/* ─── FILTER ─── */
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    document.querySelectorAll('#writeupsGrid .card').forEach(card => {
      const match = filter === 'all' || card.dataset.category === filter;
      card.classList.toggle('hidden', !match);
    });
  });
});

/* ─── MOBILE MENU ─── */
function toggleMenu() {
  document.getElementById('mobileMenu').classList.toggle('open');
}

/* ─── CONTACT FORM ─── */
function handleForm(e) { e.preventDefault(); submitContactForm(e.target); }

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  if (!form) { console.warn('[contact] form not found'); return; }
  form.addEventListener('submit', (e) => { e.preventDefault(); submitContactForm(form); });
  console.log('[contact] listener attached');
});

async function submitContactForm(form) {
  const note = document.getElementById('formNote');
  const btn  = document.getElementById('contactSubmitBtn');
  const data = Object.fromEntries(new FormData(form).entries());

  console.log('[contact] submitting', { name: data.name, email: data.email, hasMsg: !!data.message });

  btn.disabled = true;
  const originalBtnText = btn.textContent;
  btn.textContent = 'Sending…';
  note.style.color = '';
  note.textContent = 'Sending…';

  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    console.log('[contact] response status', res.status);
    const raw = await res.text();
    console.log('[contact] response body', raw);
    let json = {};
    try { json = JSON.parse(raw); } catch {}

    if (res.ok && json.success) {
      note.style.color = 'var(--accent)';
      note.textContent = '✓ Message sent. I\'ll get back to you soon.';
      form.reset();
    } else {
      note.style.color = 'var(--accent3)';
      note.textContent = (json.error || 'Failed.') + ' [HTTP ' + res.status + ']';
    }
  } catch (err) {
    console.error('[contact] fetch failed', err);
    note.style.color = 'var(--accent3)';
    note.textContent = 'Network error: ' + err.message;
  } finally {
    btn.disabled = false;
    btn.textContent = originalBtnText;
    setTimeout(() => { note.textContent = ''; note.style.color = ''; }, 10000);
  }
}

/* ─── TRYHACKME LIVE STATS ─── */
async function loadTHMStats() {
  const loading  = document.getElementById('thmLoading');
  const error    = document.getElementById('thmError');
  const grid     = document.getElementById('thmGrid');
  const badgeRow = document.getElementById('thmBadgeIcons');

  try {
    if (location.protocol === 'file:') {
      loading.textContent = '⚠ Deploy to Vercel to see live stats. Badge above is always live.';
      return;
    }

    const res = await fetch('/api/tryhackme');
    if (!res.ok) throw new Error(`API error ${res.status}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    loading.classList.add('hidden');

    const set = (id, val, suffix = '') =>
      document.getElementById(id).textContent = val != null ? `${val}${suffix}` : '—';

    set('thmRank',   data.rank   != null ? `#${data.rank.toLocaleString()}` : null);
    set('thmPoints', data.points != null ? data.points.toLocaleString()    : null);
    set('thmRooms',  data.completedRooms);
    set('thmStreak', data.streak, data.streak != null ? ' days' : '');
    set('thmBadges', data.badgeCount);

    grid.classList.remove('hidden');

    if (data.badges && data.badges.length) {
      data.badges.forEach(badge => {
        const img = badge.imageUrl || badge.image || badge.img;
        if (!img) return;
        const wrap = document.createElement('div');
        wrap.className = 'thm-badge-icon';
        wrap.title = badge.name || '';
        const i = document.createElement('img');
        i.src = img;
        i.alt = badge.name || 'badge';
        i.loading = 'lazy';
        wrap.appendChild(i);
        badgeRow.appendChild(wrap);
      });
      if (badgeRow.children.length) badgeRow.classList.remove('hidden');
    }

  } catch (err) {
    loading.classList.add('hidden');
    error.textContent = `Could not load live stats: ${err.message}`;
    error.classList.remove('hidden');
  }
}

/* ─── GITHUB SVG ─── */
const GH_SVG = `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577v-2.165c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.237 1.84 1.237 1.07 1.835 2.807 1.305 3.492.998.108-.776.42-1.305.762-1.605-2.665-.305-5.467-1.334-5.467-5.93 0-1.31.468-2.382 1.235-3.22-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.3 1.23a11.5 11.5 0 013.003-.404c1.02.005 2.047.138 3.006.404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.838 1.235 1.91 1.235 3.22 0 4.61-2.807 5.624-5.479 5.922.43.372.823 1.102.823 2.222v3.293c0 .322.218.694.825.576C20.565 21.796 24 17.298 24 12c0-6.63-5.37-12-12-12z"/></svg>`;

/* ─── LOAD PROJECTS ─── */
async function loadProjects() {
  const grid = document.getElementById('projectsGrid');
  if (!grid) return;
  try {
    if (location.protocol === 'file:') return;
    const res  = await fetch('/api/projects');
    const data = await res.json();
    if (!data.length) { grid.innerHTML = ''; return; }
    grid.innerHTML = data.map(p => `
      <div class="project-card" onclick="window.open('${p.github_url||'#'}','_blank')" style="cursor:pointer">
        <div class="project-top">
          <span class="project-icon">${p.icon || '🔒'}</span>
          <div class="project-links">
            ${p.github_url ? `<a href="${p.github_url}" target="_blank" rel="noopener" onclick="event.stopPropagation()">${GH_SVG}</a>` : ''}
          </div>
        </div>
        <h3>${p.title}</h3>
        <p>${p.description || ''}</p>
        <div class="project-stack">${(p.stack||[]).map(s=>`<span>${s}</span>`).join('')}</div>
      </div>
    `).join('');
  } catch(e) { grid.innerHTML = ''; }
}

/* ─── LOAD CERTS ─── */
async function loadCerts() {
  const certsGrid = document.getElementById('certsGrid');
  const ctfGrid   = document.getElementById('ctfGrid');
  const ctfTitle  = document.getElementById('ctfTitle');
  if (!certsGrid) return;
  try {
    if (location.protocol === 'file:') return;
    const res  = await fetch('/api/certs');
    const data = await res.json();
    if (!data.length) return;

    const certs = data.filter(c => c.status !== 'ctf');
    const ctfs  = data.filter(c => c.status === 'ctf');

    certsGrid.innerHTML = certs.map(c => {
      const ip  = c.status === 'inprogress';
      return `
        <div class="cert-card ${ip ? 'cert-card-inprogress' : ''}">
          <div class="cert-badge ${ip ? 'cert-badge-inprogress' : ''}">${c.badge_label}</div>
          <div class="cert-info">
            <h3>${c.title}</h3>
            <p>${c.issuer || ''}</p>
            <span class="cert-year ${ip ? 'cert-inprogress' : ''}">${c.date_label || ''}</span>
          </div>
        </div>`;
    }).join('');

    if (ctfs.length) {
      ctfTitle.style.display = 'block';
      ctfGrid.innerHTML = ctfs.map(c => `
        <div class="cert-card cert-card-ctf">
          <div class="cert-badge cert-badge-ctf">${c.badge_label}</div>
          <div class="cert-info">
            <h3>${c.title}</h3>
            <p>${c.issuer || ''}</p>
            <span class="cert-year cert-year-ctf">${c.date_label || ''}</span>
          </div>
        </div>`).join('');
    }
  } catch(e) {}
}

/* ─── INIT ─── */
document.addEventListener('DOMContentLoaded', () => {
  loadWriteups();
  loadProjects();
  loadCerts();
  initReveal();
  document.getElementById('thmBadge').src =
    `https://tryhackme-badges.s3.amazonaws.com/Alhussein76.png?t=${Date.now()}`;

  document.getElementById('videoModal').addEventListener('click', e => {
    if (e.target.id === 'videoModal') closeModal();
  });

});
