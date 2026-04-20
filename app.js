/* ─── PARTICLE NETWORK ─── */
(function () {
  const canvas = document.getElementById('matrix');
  const ctx = canvas.getContext('2d');
  const ACCENT = '0,255,157';
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
    'Security Researcher',
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
  const empty = document.getElementById('writeupsEmpty');

  if (!writeups || !writeups.length) {
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

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
  nav.style.borderBottomColor = window.scrollY > 20 ? 'rgba(0,255,157,.15)' : 'var(--border)';
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
function handleForm(e) {
  e.preventDefault();
  const note = document.getElementById('formNote');
  note.textContent = '✓ Message sent! I\'ll get back to you soon.';
  e.target.reset();
  setTimeout(() => note.textContent = '', 5000);
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

/* ─── INIT ─── */
document.addEventListener('DOMContentLoaded', () => {
  loadWriteups();
  initReveal();

  document.getElementById('videoModal').addEventListener('click', e => {
    if (e.target.id === 'videoModal') closeModal();
  });

  loadTHMStats();
});
