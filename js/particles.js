/**
 * SHINKEN — Canvas Particle System
 * Lightweight, GPU-friendly floating particles for the background
 */

import { rand } from './utils.js';

export class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.W = 0;
    this.H = 0;
    this.raf = null;
    this.running = false;
    this._onResize = this._resize.bind(this);
  }

  _resize() {
    this.W = this.canvas.width  = window.innerWidth;
    this.H = this.canvas.height = window.innerHeight;
  }

  _spawn(init = false) {
    return {
      x:       rand(0, this.W),
      y:       init ? rand(0, this.H) : this.H + 20,
      r:       rand(0.3, 1.6),
      vy:      -(rand(0.06, 0.35)),
      vx:      (Math.random() - 0.5) * 0.1,
      alpha:   rand(0.05, 0.38),
      life:    0,
      maxLife: rand(300, 800),
    };
  }

  init(count = 80) {
    this._resize();
    window.addEventListener('resize', this._onResize);
    this.particles = Array.from({ length: count }, () => this._spawn(true));
    this.running = true;
    this._loop();
    return this;
  }

  _loop() {
    if (!this.running) return;
    const { ctx, W, H } = this;
    ctx.clearRect(0, 0, W, H);

    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.life++;

      if (p.y < -10 || p.life > p.maxLife) {
        Object.assign(p, this._spawn(false));
        continue;
      }

      const fade = Math.min(1, p.life / 80) * Math.min(1, (p.maxLife - p.life) / 80);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,80,84,${p.alpha * fade})`;
      ctx.fill();
    }

    this.raf = requestAnimationFrame(() => this._loop());
  }

  destroy() {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this._onResize);
  }
}
