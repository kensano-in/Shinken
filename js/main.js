/**
 * SHINKEN — Main Application Entry Point
 * Initializes all modules and wires interactions
 */

import { ParticleSystem }         from './particles.js';
import { notify, notifySuccess, notifyInfo } from './notify.js';
import { ChatPreview }             from './chat.js';
import {
  $, $$, pad, isValidEmail,
  store, animateNum, onVisible, lerp
} from './utils.js';

/* ═══════════════════════════════════════════════════════════════
   1. LOADING SCREEN
   ═══════════════════════════════════════════════════════════════ */
(function initLoader() {
  const screen = $('#loading-screen');
  const fill   = $('#loader-fill');
  const text   = $('#loader-text');
  if (!screen) return;

  const steps = [
    'Initializing system…',
    'Loading modules…',
    'Calibrating UI…',
    'Establishing channels…',
    'Almost ready…',
    'System online.',
  ];

  let progress = 0;
  let stepIdx  = 0;

  const interval = setInterval(() => {
    progress = Math.min(progress + Math.random() * 22 + 8, 100);
    if (fill) fill.style.width = progress + '%';
    if (text && stepIdx < steps.length) {
      text.textContent = steps[stepIdx++];
    }
    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => screen.classList.add('hidden'), 400);
    }
  }, 220);
})();

/* ═══════════════════════════════════════════════════════════════
   2. CUSTOM CURSOR
   ═══════════════════════════════════════════════════════════════ */
(function initCursor() {
  const dot  = $('#cursor-dot');
  const ring = $('#cursor-ring');
  if (!dot || !ring) return;

  let mx = -200, my = -200;
  let rx = -200, ry = -200;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity  = '1';
    ring.style.opacity = '1';
  });

  let rafId;
  const tick = () => {
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
    rx = lerp(rx, mx, 0.13);
    ry = lerp(ry, my, 0.13);
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    rafId = requestAnimationFrame(tick);
  };
  tick();
})();

/* ═══════════════════════════════════════════════════════════════
   3. PARTICLES
   ═══════════════════════════════════════════════════════════════ */
const canvas = $('#bg-canvas');
if (canvas) {
  new ParticleSystem(canvas).init(85);
}

/* ═══════════════════════════════════════════════════════════════
   4. NAV SCROLL EFFECT
   ═══════════════════════════════════════════════════════════════ */
(function initNav() {
  const nav = $('#main-nav');
  if (!nav) return;
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 30);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ═══════════════════════════════════════════════════════════════
   5. NAV TABS (SPA routing)
   ═══════════════════════════════════════════════════════════════ */
(function initTabs() {
  const tabs = $$('.nav-tab');
  const sections = {
    home:      $('#section-home'),
    features:  $('#section-features'),
    chat:      $('#section-chat'),
    dashboard: $('#section-dashboard'),
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const target = sections[tab.dataset.tab];
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();

/* ═══════════════════════════════════════════════════════════════
   6. MOBILE MENU
   ═══════════════════════════════════════════════════════════════ */
(function initMobileMenu() {
  const menuBtn   = $('#mobile-menu-btn');
  const mobileNav = $('#mobile-nav');
  if (!menuBtn || !mobileNav) return;

  menuBtn.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });

  $$('.mobile-nav-tab', mobileNav).forEach(tab => {
    tab.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    });
  });
})();

/* ═══════════════════════════════════════════════════════════════
   7. COUNTDOWN TIMER
   ═══════════════════════════════════════════════════════════════ */
(function initCountdown() {
  const LAUNCH = new Date('2026-09-01T00:00:00');
  const ids = ['cd-days','cd-hours','cd-mins','cd-secs'];

  function tick(id, val) {
    const el = $('#' + id);
    if (!el) return;
    const s = pad(val);
    if (el.textContent !== s) {
      el.classList.remove('tick');
      void el.offsetWidth; // reflow
      el.classList.add('tick');
      setTimeout(() => el.classList.remove('tick'), 180);
      el.textContent = s;
    }
  }

  function update() {
    const diff = LAUNCH - Date.now();
    if (diff <= 0) {
      ids.forEach(id => { const el = $('#' + id); if (el) el.textContent = '00'; });
      return;
    }
    tick('cd-days',  Math.floor(diff / 86_400_000));
    tick('cd-hours', Math.floor((diff % 86_400_000) / 3_600_000));
    tick('cd-mins',  Math.floor((diff % 3_600_000)  / 60_000));
    tick('cd-secs',  Math.floor((diff % 60_000)     / 1_000));
  }

  update();
  setInterval(update, 1000);
})();

/* ═══════════════════════════════════════════════════════════════
   8. STATUS LINE CYCLE
   ═══════════════════════════════════════════════════════════════ */
(function initStatus() {
  const el = $('#status-text');
  if (!el) return;

  const msgs = [
    'System initializing…',
    'Loading core modules…',
    'Establishing secure channels…',
    'Preparing real-time engine…',
    'Calibrating encryption layer…',
    'Syncing distributed nodes…',
    'Almost ready…',
  ];

  let i = 0;
  setInterval(() => {
    el.style.opacity = '0';
    setTimeout(() => {
      i = (i + 1) % msgs.length;
      el.textContent = msgs[i];
      el.style.opacity = '1';
    }, 380);
  }, 3000);
})();

/* ═══════════════════════════════════════════════════════════════
   9. NOTIFY ME FORM
   ═══════════════════════════════════════════════════════════════ */
(function initNotifyForm() {
  const btn   = $('#notify-btn');
  const input = $('#notify-input');
  if (!btn || !input) return;

  // Pre-fill from storage
  const savedEmail = store.get('waitlist_email');
  if (savedEmail) {
    input.placeholder = 'You\'re already on the list ✓';
    btn.classList.add('success');
    btn.querySelector('.btn-text').textContent = 'Joined!';
  }

  const submit = () => {
    const email = input.value.trim();
    if (!isValidEmail(email)) {
      const row = input.closest('.input-row');
      if (row) {
        row.style.borderColor = 'rgba(255,59,63,0.7)';
        row.style.boxShadow   = '0 0 0 3px rgba(255,59,63,0.12)';
        input.focus();
        setTimeout(() => { row.style.borderColor = ''; row.style.boxShadow = ''; }, 900);
      }
      notify('Invalid email', 'Please enter a valid email address.', 'default');
      return;
    }

    store.set('waitlist_email', email);
    btn.classList.add('success');
    input.value = '';
    input.placeholder = 'You\'re on the list ✓';

    const statusEl = $('#status-text');
    if (statusEl) statusEl.textContent = 'Access request logged.';

    notifySuccess('You\'re in!', `We'll notify you at ${email} when ShinChat launches.`);

    setTimeout(() => {
      btn.classList.remove('success');
      btn.querySelector('.btn-text').textContent = 'Notify Me';
    }, 5000);
  };

  btn.addEventListener('click', submit);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
})();

/* ═══════════════════════════════════════════════════════════════
   10. CHAT PREVIEW
   ═══════════════════════════════════════════════════════════════ */
(function initChatPreview() {
  const el = $('#chat-preview');
  if (!el) return;
  const chat = new ChatPreview(el);
  chat.initInput();
  onVisible(el, () => chat.start());
})();

/* ═══════════════════════════════════════════════════════════════
   11. STATS COUNTER ANIMATION
   ═══════════════════════════════════════════════════════════════ */
(function initStats() {
  const statEls = $$('[data-count]');
  statEls.forEach(el => {
    const target   = parseInt(el.dataset.count, 10);
    const duration = parseInt(el.dataset.duration ?? '1600', 10);
    onVisible(el.closest('.stat-card') ?? el, () => {
      animateNum(el, 0, target, duration);
      el.classList.add('counting');
    });
  });

  // Animate stat bars
  $$('[data-fill]').forEach(bar => {
    onVisible(bar.closest('.stat-card') ?? bar, () => {
      setTimeout(() => { bar.style.width = bar.dataset.fill; }, 200);
    });
  });
})();

/* ═══════════════════════════════════════════════════════════════
   12. FEATURE CARDS — SCROLL REVEAL
   ═══════════════════════════════════════════════════════════════ */
(function initReveal() {
  const cards = $$('[data-reveal]');
  cards.forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(24px)';
    card.style.transition = `opacity 0.5s ${i * 0.07}s ease, transform 0.5s ${i * 0.07}s ease`;
    onVisible(card, () => {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, { threshold: 0.1 });
  });
})();

/* ═══════════════════════════════════════════════════════════════
   13. GAMES
   ═══════════════════════════════════════════════════════════════ */
(function initGames() {
  // Click-the-target mini-game
  const gameBtn = $('#play-reflex');
  if (!gameBtn) return;

  let active    = false;
  let score     = 0;
  let timeLeft  = 15;
  let timer, spawnTimer;
  const arena   = $('#reflex-arena');
  const scoreEl = $('#reflex-score');
  const timerEl = $('#reflex-timer');

  if (!arena) return;

  function spawnTarget() {
    if (!active) return;
    const target = document.createElement('button');
    target.className = 'reflex-target';
    const size = Math.random() * 32 + 28;
    target.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random() * (arena.offsetWidth  - size)}px;
      top:${Math.random() * (arena.offsetHeight - size)}px;
    `;
    target.addEventListener('click', () => {
      score++;
      if (scoreEl) scoreEl.textContent = score;
      target.remove();
      spawnTarget();
      // flash
      arena.classList.add('flash');
      setTimeout(() => arena.classList.remove('flash'), 100);
    });
    arena.appendChild(target);
    spawnTimer = setTimeout(() => { target.remove(); spawnTarget(); }, 1200);
  }

  gameBtn.addEventListener('click', () => {
    if (active) return;
    active = true; score = 0; timeLeft = 15;
    if (scoreEl) scoreEl.textContent = '0';
    arena.innerHTML = '';
    gameBtn.disabled = true;
    gameBtn.textContent = 'Go!';
    spawnTarget();

    timer = setInterval(() => {
      timeLeft--;
      if (timerEl) timerEl.textContent = timeLeft;
      if (timeLeft <= 0) {
        clearInterval(timer);
        clearTimeout(spawnTimer);
        arena.innerHTML = '';
        active = false;
        gameBtn.disabled = false;
        gameBtn.textContent = 'Play Again';
        notifyInfo('Game Over!', `You scored ${score} points.`);
      }
    }, 1000);
  });
})();

/* ═══════════════════════════════════════════════════════════════
   14. PERIODIC NOTIFICATIONS (ambient)
   ═══════════════════════════════════════════════════════════════ */
(function initAmbientNotifs() {
  const msgs = [
    ['ShinChat Engine', 'Core modules loaded successfully.', 'success'],
    ['Encryption Layer', 'End-to-end channels established.', 'info'],
    ['Real-time Sync',  'Distributed nodes synchronized.', 'info'],
    ['Security Check',  'Zero vulnerabilities detected.', 'success'],
  ];
  let idx = 0;
  setTimeout(() => {
    const show = () => {
      const [title, msg, type] = msgs[idx % msgs.length];
      notify(title, msg, type);
      idx++;
    };
    show();
    setInterval(show, 18000);
  }, 5000);
})();
