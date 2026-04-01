/**
 * SHINKEN — Core JS Utilities
 * Shared helpers used across all modules
 */

/* ── QUERY HELPERS ────────────────────────────────────────────── */
export const $ = (sel, ctx = document) => ctx.querySelector(sel);
export const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ── DEBOUNCE ─────────────────────────────────────────────────── */
export function debounce(fn, ms = 100) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

/* ── CLAMP ────────────────────────────────────────────────────── */
export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

/* ── LERP ─────────────────────────────────────────────────────── */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/* ── RANDOM RANGE ─────────────────────────────────────────────── */
export function rand(min, max) {
  return Math.random() * (max - min) + min;
}

/* ── FORMAT NUMBER ────────────────────────────────────────────── */
export function formatNum(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}

/* ── ANIMATE NUMBER ───────────────────────────────────────────── */
export function animateNum(el, from, to, duration = 1600, format = formatNum) {
  const start = performance.now();
  function step(now) {
    const p = clamp((now - start) / duration, 0, 1);
    const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
    el.textContent = format(Math.round(lerp(from, to, eased)));
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ── INTERSECTION OBSERVER HELPER ─────────────────────────────── */
export function onVisible(el, fn, options = {}) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        fn(entry);
        if (options.once !== false) io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, ...options });
  io.observe(el);
  return io;
}

/* ── LOCAL STORAGE HELPERS ────────────────────────────────────── */
export const store = {
  get(key, fallback = null) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  },
  set(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); }
    catch {/* quota exceeded — silent fail */}
  },
  remove(key) {
    try { localStorage.removeItem(key); }
    catch { }
  }
};

/* ── VALIDATE EMAIL ───────────────────────────────────────────── */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ── DATE PAD ─────────────────────────────────────────────────── */
export function pad(n) { return String(n).padStart(2, '0'); }
