/* ─── ACCESS GATE ─── */
(function () {
  const gate = document.getElementById('accessGate');
  if (!gate) return;
  if (localStorage.getItem('access_granted') === '1') return;

  const output = document.getElementById('gateOutput');
  const promptLine = document.getElementById('gatePromptLine');
  const promptSign = promptLine.querySelector('.gate-prompt-sign');
  const input = document.getElementById('gateInput');
  let stage = 'riddle';

  function sanitizeName(s) {
    const cleaned = String(s).replace(/[<>&"'`]/g, '').slice(0, 32).trim();
    return cleaned || 'stranger';
  }

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
    const rawVal = input.value;
    const val = rawVal.trim();
    if (!val) return;
    appendLine('$ ' + rawVal, 'g-cmd');
    input.value = '';

    if (stage === 'riddle') {
      if (answers.includes(val.toLowerCase())) {
        appendLine('[ ok   ] access granted.', 'g-ok');
        appendLine(' ', '');
        appendLine('SYSTEM: what should I call you?', 'g-sys');
        stage = 'name';
        promptSign.textContent = 'name:~$';
      } else {
        appendLine('access denied. incorrect. try again.', 'g-sys');
      }
    } else if (stage === 'name') {
      const name = sanitizeName(val);
      localStorage.setItem('visitor_name', name);
      appendLine(`> welcome, ${name}. enjoy your visit.`, 'g-ok');
      stage = 'done';
      setTimeout(closeGate, 900);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && gate.style.display !== 'none') skipGate();
  });

  function closeGate() {
    gate.classList.add('gate-hidden');
    localStorage.setItem('access_granted', '1');
    setTimeout(() => { gate.style.display = 'none'; }, 550);
  }

  window.skipGate = function () { closeGate(); };
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

/* ─── SECURITY: HTML ESCAPE HELPERS ─── */
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}
function escAttr(s) { return esc(s); }
function safeUrl(u) {
  const s = String(u || '').trim();
  if (/^(https?:|mailto:|#|\/)/i.test(s)) return s;
  return '#';
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
    const diffRaw   = String(w.difficulty || '');
    const diffLabel = diffRaw.charAt(0).toUpperCase() + diffRaw.slice(1);
    const platLabel = PLATFORM_LABELS[w.platform] || w.platform;
    const tags      = Array.isArray(w.tags) ? w.tags : [];
    const ytIdEsc   = esc(ytId || '');
    const platCls   = esc(w.platform || '').replace(/[^a-z0-9_-]/gi, '');
    const diffCls   = esc(diffRaw).replace(/[^a-z0-9_-]/gi, '');

    return `
      <article class="card" data-category="${platCls}">
        ${thumb ? `
        <div class="card-thumb" style="background-image:url('https://img.youtube.com/vi/${ytIdEsc}/mqdefault.jpg')" data-yt="${ytIdEsc}">
          <div class="card-play">▶</div>
        </div>` : ''}
        <div class="card-header">
          <span class="badge badge-${platCls}">${esc(platLabel)}</span>
          <span class="badge badge-${diffCls}">${esc(diffLabel)}</span>
          ${w.date ? `<span class="card-date">${esc(w.date)}</span>` : ''}
        </div>
        <h3 class="card-title">${esc(w.title)}</h3>
        <p class="card-desc">${esc(w.description || '')}</p>
        <div class="card-tags">${tags.map(t => `<span>#${esc(t)}</span>`).join('')}</div>
        <div class="card-actions">
          ${w.url
            ? `<a class="card-link" href="${esc(safeUrl(w.url))}" target="_blank" rel="noopener noreferrer">Read Writeup →</a>`
            : `<span class="card-link-dim">Coming soon…</span>`}
          ${ytId ? `<button class="card-video-btn" data-yt="${ytIdEsc}">▶ Watch</button>` : ''}
        </div>
      </article>
    `;
  }).join('');

  grid.querySelectorAll('[data-yt]').forEach(el => {
    el.addEventListener('click', () => openVideoModalById(el.dataset.yt));
  });
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
  openVideoModalById(id);
}
function openVideoModalById(id) {
  if (!id || !/^[A-Za-z0-9_-]{5,20}$/.test(id)) return;
  document.getElementById('modalIframe').src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`;
  document.getElementById('videoModal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('videoModal').classList.add('hidden');
  document.getElementById('modalIframe').src = '';
  document.body.style.overflow = '';
}

/* ─── COUNTER ANIMATION ─── */
function setStat(key, value) {
  const el = document.querySelector(`.stat-num[data-stat="${key}"]`);
  if (!el) return;
  el.dataset.target = value;
  if (el.dataset.animated === '1') animateOne(el);
}
function animateOne(el) {
  const target = +el.dataset.target || 0;
  const start = +el.textContent.replace(/\D/g, '') || 0;
  if (target === start) { el.textContent = target; return; }
  const steps = 40;
  const stepVal = (target - start) / steps;
  let current = start, i = 0;
  const t = setInterval(() => {
    i++;
    current = Math.round(start + stepVal * i);
    if (i >= steps) { current = target; clearInterval(t); }
    el.textContent = current;
  }, 30);
}
function animateCounters() {
  document.querySelectorAll('.stat-num').forEach(el => {
    el.dataset.animated = '1';
    animateOne(el);
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
    setStat('projects', Array.isArray(data) ? data.length : 0);
    if (!data.length) { grid.innerHTML = ''; return; }
    grid.innerHTML = data.map(p => {
      const url = safeUrl(p.github_url || '');
      return `
      <div class="project-card" data-url="${esc(url)}" style="cursor:pointer">
        <div class="project-top">
          <span class="project-icon">${esc(p.icon || '🔒')}</span>
          <div class="project-links">
            ${p.github_url ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">${GH_SVG}</a>` : ''}
          </div>
        </div>
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.description || '')}</p>
        <div class="project-stack">${(p.stack||[]).map(s=>`<span>${esc(s)}</span>`).join('')}</div>
      </div>`;
    }).join('');
    grid.querySelectorAll('.project-card[data-url]').forEach(el => {
      el.addEventListener('click', () => {
        const u = el.dataset.url;
        if (u && u !== '#') window.open(u, '_blank', 'noopener,noreferrer');
      });
    });
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
    const all  = Array.isArray(data) ? data : [];
    const certs = all.filter(c => c.status !== 'ctf');
    const ctfs  = all.filter(c => c.status === 'ctf');
    setStat('certs', certs.length);
    setStat('ctfs',  ctfs.length);
    if (!all.length) return;

    certsGrid.innerHTML = certs.map(c => {
      const ip  = c.status === 'inprogress';
      return `
        <div class="cert-card ${ip ? 'cert-card-inprogress' : ''}">
          <div class="cert-badge ${ip ? 'cert-badge-inprogress' : ''}">${esc(c.badge_label)}</div>
          <div class="cert-info">
            <h3>${esc(c.title)}</h3>
            <p>${esc(c.issuer || '')}</p>
            <span class="cert-year ${ip ? 'cert-inprogress' : ''}">${esc(c.date_label || '')}</span>
          </div>
        </div>`;
    }).join('');

    if (ctfs.length) {
      ctfTitle.style.display = 'block';
      ctfGrid.innerHTML = ctfs.map(c => `
        <div class="cert-card cert-card-ctf">
          <div class="cert-badge cert-badge-ctf">${esc(c.badge_label)}</div>
          <div class="cert-info">
            <h3>${esc(c.title)}</h3>
            <p>${esc(c.issuer || '')}</p>
            <span class="cert-year cert-year-ctf">${esc(c.date_label || '')}</span>
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
