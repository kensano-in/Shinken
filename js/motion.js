/* ============================================================
   SHINKEN – MOTION ENGINE
   Layer: UX physics, reveals, clock, ambient FX
   ============================================================ */

console.log(
  "%cShinken Motion Engine online",
  "color:#93c5fd;background:#020617;padding:4px 10px;border-radius:999px;font-size:11px;"
);

/* ============================================================
   1. SMOOTH SCROLL (soft inertia, optional)
   ============================================================ */

(function () {
  const prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReduced) return;

  let last = window.scrollY || window.pageYOffset || 0;

  const smooth = () => {
    const current = window.scrollY || window.pageYOffset || 0;
    last += (current - last) * 0.08;

    // Only adjust if the delta is meaningful, avoids jitter at top
    if (Math.abs(current - last) > 0.3) {
      window.scrollTo(0, last);
    }

    requestAnimationFrame(smooth);
  };

  requestAnimationFrame(smooth);
})();

/* ============================================================
   2. MAGNETIC BUTTONS (subtle cursor attraction)
   Elements: any with class .magnetic
   ============================================================ */

(function () {
  const elements = document.querySelectorAll(".magnetic");
  if (!elements.length) return;

  const strengthDefault = 30;

  elements.forEach((el) => {
    const strength =
      parseFloat(el.getAttribute("data-strength")) || strengthDefault;

    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const relX = e.clientX - (rect.left + rect.width / 2);
      const relY = e.clientY - (rect.top + rect.height / 2);

      const moveX = (relX / rect.width) * strength;
      const moveY = (relY / rect.height) * strength;

      el.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
    });

    el.addEventListener("mouseleave", () => {
      el.style.transform = "translate3d(0, 0, 0)";
    });
  });
})();

/* ============================================================
   3. PARALLAX TILT (global “panel tilt” via CSS vars)
   Root CSS should read vars --tilt-x / --tilt-y
   ============================================================ */

(function () {
  const prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return;

  const docEl = document.documentElement;
  if (!docEl) return;

  document.addEventListener("mousemove", (e) => {
    const w = window.innerWidth || 1;
    const h = window.innerHeight || 1;

    const x = (e.clientX - w / 2) / w; // -0.5 to 0.5
    const y = (e.clientY - h / 2) / h;

    // scale to degrees
    const tiltX = x * 6; // yaw
    const tiltY = -y * 6; // pitch

    docEl.style.setProperty("--tilt-x", tiltX.toFixed(3));
    docEl.style.setProperty("--tilt-y", tiltY.toFixed(3));
  });
})();

/* ============================================================
   4. FADE-IN ON LOAD + PRELOADER CLEANUP
   Body gets .shinken-loaded when ready
   Optional element: .preloader
   ============================================================ */

window.addEventListener("load", () => {
  document.body.classList.add("shinken-loaded");

  const pre = document.querySelector(".preloader");
  if (!pre) return;

  pre.style.transition = "opacity 0.4s ease-out, transform 0.4s ease-out";
  pre.style.opacity = "0";
  pre.style.transform = "translate3d(0, -8px, 0)";

  setTimeout(() => {
    pre.remove();
  }, 600);
});

/* ============================================================
   5. REVEAL ON SCROLL
   .reveal      → .reveal-show
   .soft-reveal → .soft-reveal-show
   ============================================================ */

(function () {
  const targetsHard = document.querySelectorAll(".reveal");
  const targetsSoft = document.querySelectorAll(".soft-reveal");

  if (!targetsHard.length && !targetsSoft.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;

        if (el.classList.contains("reveal")) {
          el.classList.add("reveal-show");
        }
        if (el.classList.contains("soft-reveal")) {
          el.classList.add("soft-reveal-show");
        }

        observer.unobserve(el);
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -40px 0px",
    }
  );

  targetsHard.forEach((el) => observer.observe(el));
  targetsSoft.forEach((el) => observer.observe(el));
})();

/* ============================================================
   6. BUTTON PRESS ANIMATION
   Elements: .btn-press
   ============================================================ */

(function () {
  const buttons = document.querySelectorAll(".btn-press");
  if (!buttons.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener("mousedown", () => {
      btn.classList.add("pressed");
    });

    ["mouseup", "mouseleave", "blur", "touchend", "touchcancel"].forEach(
      (ev) => {
        btn.addEventListener(ev, () => {
          btn.classList.remove("pressed");
        });
      }
    );
  });
})();

/* ============================================================
   7. UI CLOCK
   Element: <div class="ui-clock"></div>
   Text format: HH:MM:SS · WORKING BAND
   ============================================================ */

(function () {
  const el = document.querySelector(".ui-clock");
  if (!el) return;

  const label = el.dataset.label || "WORKING BAND";

  const pad = (n) => n.toString().padStart(2, "0");

  const update = () => {
    const now = new Date();
    const h = pad(now.getHours());
    const m = pad(now.getMinutes());
    const s = pad(now.getSeconds());

    el.textContent = `${h}:${m}:${s} · ${label}`;
  };

  update();
  setInterval(update, 1000);
})();

/* ============================================================
   8. AMBIENT FLOAT LAYER
   Elements inside .float-layer (optional) get subtle drift
   ============================================================ */

(function () {
  const layer = document.querySelector(".float-layer");
  if (!layer) return;

  const items = Array.from(layer.children);
  if (!items.length) return;

  const prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return;

  let mouseX = 0;
  let mouseY = 0;

  document.addEventListener("mousemove", (e) => {
    const w = window.innerWidth || 1;
    const h = window.innerHeight || 1;
    mouseX = e.clientX / w - 0.5; // -0.5 to 0.5
    mouseY = e.clientY / h - 0.5;
  });

  const animate = () => {
    items.forEach((el, index) => {
      const depth = (index + 1) / items.length; // 0..1
      const strength = 24 * depth;

      const x = -mouseX * strength;
      const y = -mouseY * strength;

      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(
        1
      )}px, 0)`;
    });

    requestAnimationFrame(animate);
  };

  requestAnimationFrame(animate);
})();

/* ============================================================
   9. SCANLINE SWEEP
   Element: .scanline (full-width bar, defined in parallax.css)
   ============================================================ */

(function () {
  const bar = document.querySelector(".scanline");
  if (!bar) return;

  const prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return;

  let y = -200;

  const loop = () => {
    y += 1.1;

    if (y > window.innerHeight + 200) {
      y = -200;
    }

    bar.style.transform = `translate3d(0, ${y}px, 0)`;
    requestAnimationFrame(loop);
  };

  requestAnimationFrame(loop);
})();

/* ============================================================
   10. MICRO-PARTICLE FIELD
   Canvas: dynamically created .particle-field
   Subtle dust drifting in background
   ============================================================ */

(function () {
  const prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return;

  const canvas = document.createElement("canvas");
  canvas.className = "particle-field";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  const particles = [];
  let width = 0;
  let height = 0;
  const COUNT = 60;

  const resize = () => {
    width = canvas.width = window.innerWidth * window.devicePixelRatio;
    height = canvas.height = window.innerHeight * window.devicePixelRatio;
  };

  window.addEventListener("resize", resize);
  resize();

  for (let i = 0; i < COUNT; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 0.6 + Math.random() * 1.3,
      speedX: -0.08 + Math.random() * 0.16,
      speedY: -0.03 + Math.random() * 0.06,
      alpha: 0.15 + Math.random() * 0.25,
    });
  }

  const tick = () => {
    ctx.clearRect(0, 0, width, height);

    particles.forEach((p) => {
      p.x += p.speedX;
      p.y += p.speedY;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * window.devicePixelRatio, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(226,239,255,0.9)";
      ctx.fill();
    });

    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
})();
