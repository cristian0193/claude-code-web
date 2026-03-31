/* ================================================
   PRESENTATION ENGINE — Claude Code in Action
   Author: Christian Rodriguez
================================================ */

const SLIDES = [
  { id: 'hero',       title: 'Portada' },
  { id: 'agenda',     title: 'Contenido' },
  { id: 'que-es',     title: '¿Qué es Claude Code?' },
  { id: 'instalacion',title: 'Instalación' },
  { id: 'comandos',   title: 'Comandos Esenciales' },
  { id: 'custom-cmd', title: 'Comandos Personalizados' },
  { id: 'workflow',   title: 'Flujo de Trabajo' },
  { id: 'mcp',        title: 'MCP' },
  { id: 'memoria',    title: 'CLAUDE.md — Memoria' },
  { id: 'rules',      title: 'Rules — CLAUDE.md' },
  { id: 'skills',     title: 'Skills — SKILL.md' },
  { id: 'plugins',    title: 'Plugins' },
  { id: 'agentes',    title: 'Teams de Agentes' },
  { id: 'hooks',      title: 'Hooks' },
  { id: 'permisos',   title: 'Permisos' },
  { id: 'practicas',  title: 'Mejores Prácticas' },
  { id: 'recursos',   title: 'Recursos' },
];

let current = 0;
const visited = new Set([0]);

// ── DOM ───────────────────────────────────────────
const slideEls    = SLIDES.map(s => document.getElementById('slide-' + s.id));
const dots        = document.querySelectorAll('.nav-dot');
const progressLine = document.getElementById('progress-line');
const topicPill   = document.getElementById('topic-pill');
const slideNum    = document.getElementById('slide-num');
const prevBtn     = document.getElementById('prev-btn');
const nextBtn     = document.getElementById('next-btn');

// ── Navigate ──────────────────────────────────────
function goTo(index, dir) {
  if (index < 0 || index >= SLIDES.length) return;
  if (dir === undefined) dir = index > current ? 1 : -1;

  const prev = current;
  current = index;
  visited.add(index);

  // Limpiar cualquier transform inline residual antes de animar
  slideEls[current].style.transform = '';
  slideEls[current].classList.remove('exit-left');

  slideEls[prev].style.transform = '';
  slideEls[prev].classList.remove('active');
  slideEls[prev].classList.add('exit-left');
  setTimeout(() => slideEls[prev].classList.remove('exit-left'), 420);

  requestAnimationFrame(() => {
    slideEls[current].style.transform = dir > 0 ? 'translateX(60px) scale(0.98)' : 'translateX(-60px) scale(0.98)';
    slideEls[current].classList.add('active');
    slideEls[current].scrollTop = 0;
    // Forzar reset del transform para que la transición CSS tome control
    requestAnimationFrame(() => {
      slideEls[current].style.transform = '';
    });
  });

  updateUI();
}

function updateUI() {
  const pct = current / (SLIDES.length - 1) * 100;
  progressLine.style.width = pct + '%';
  topicPill.textContent = SLIDES[current].title;
  slideNum.textContent  = `${current + 1} / ${SLIDES.length}`;

  dots.forEach((d, i) => {
    d.classList.toggle('active',  i === current);
    d.classList.toggle('visited', visited.has(i) && i !== current);
  });

  prevBtn.disabled = current === 0;
  nextBtn.disabled = current === SLIDES.length - 1;

  // Update agenda checkmarks
  document.querySelectorAll('.agenda-item').forEach((item, i) => {
    const slideIdx = parseInt(item.dataset.slide);
    item.classList.toggle('done', visited.has(slideIdx));
    const numEl = item.querySelector('.a-num');
    if (numEl) numEl.textContent = visited.has(slideIdx) ? '✓' : (slideIdx - 1);
  });
}

// ── Dot clicks ────────────────────────────────────
dots.forEach((dot, i) => {
  dot.addEventListener('click', () => goTo(i));
});

// ── Button clicks ─────────────────────────────────
prevBtn.addEventListener('click', () => goTo(current - 1));
nextBtn.addEventListener('click', () => goTo(current + 1));

// ── Keyboard ──────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
    e.preventDefault(); goTo(current + 1);
  }
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    e.preventDefault(); goTo(current - 1);
  }
});

// ── Tabs ──────────────────────────────────────────
document.querySelectorAll('[data-tabs]').forEach(wrap => {
  const bar = wrap.querySelector('.tabs-bar');
  const panels = wrap.querySelectorAll('.tab-panel');
  bar.querySelectorAll('.tab-btn').forEach((btn, i) => {
    btn.addEventListener('click', () => {
      bar.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      panels[i].classList.add('active');
    });
  });
});

// ── Copy buttons ──────────────────────────────────
document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const text = btn.closest('.code-wrap').querySelector('pre').innerText.trim();
    navigator.clipboard.writeText(text).then(() => {
      btn.textContent = '✓ Copiado';
      btn.classList.add('copied');
      setTimeout(() => { btn.textContent = 'Copiar'; btn.classList.remove('copied'); }, 2000);
    });
  });
});

// ── Typewriter ────────────────────────────────────
const tw = document.getElementById('typewriter');
if (tw) {
  const lines = [
    'claude "añade tests al módulo de auth"',
    'claude "refactoriza UserController.ts"',
    'claude "explica este algoritmo"',
    '/deploy → despliega a producción',
    '/changelog → genera el release notes',
  ];
  let li = 0, ci = 0, del = false;
  function type() {
    const cur = lines[li];
    tw.textContent = del ? cur.slice(0, ci - 1) : cur.slice(0, ci + 1);
    del ? ci-- : ci++;
    if (!del && ci === cur.length) { del = true; setTimeout(type, 2000); return; }
    if (del && ci === 0) { del = false; li = (li + 1) % lines.length; }
    setTimeout(type, del ? 30 : 60);
  }
  type();
}

// ── Init ──────────────────────────────────────────
slideEls[0].classList.add('active');
updateUI();
