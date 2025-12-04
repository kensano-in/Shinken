/* =========================================================
   SHINKEN MOTION ENGINE — SINGLE GOD-TIER LAYER
   Handles:
   - Smooth scroll easing
   - Magnetic buttons
   - Parallax tilt
   - Loader reveal
   - IntersectionObserver reveals
   - Clock engine v2 (with phase text)
   - Scanline + particle field motion
   ========================================================= */

console.log(
  "%cShinken Motion Engine online",
  "color:#8fd9ff;background:#00111f;padding:6px 10px;border-radius:999px;font-size:11px;"
);

/* 1. SMOOTH SCROLL (subtle easing) */
(function () {
  let last = 0;
  const smooth = () => {
    const current = window.scrollY;
    last += (current - last) * 0.08;
    window.scrollTo(0, last);
    requestAnimationFrame(smooth);
  };
  requestAnimationFrame(smooth);
})();

/* 2. MAGNETIC BUTTONS */

const magneticElements = document.querySelectorAll(".magnetic");

magneticElements.forEach((el) => {
  const strength = parseFloat(el.getAttribute("data-strength")) || 25;

  el.addEventListener("mousemove", (e) => {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    el.style.transform =
      "translate(" + x / strength + "px," + y / strength + "px)";
  });

  el.addEventListener("mouseleave", () => {
    el.style.transform = "translate(0px,0px)";
  });
});

/* 3. PARALLAX TILT (whole document) */

document.addEventListener("mousemove", (e) => {
  const x = (e.clientX - window.innerWidth / 2) * 0.003;
  const y = (e.clientY - window.innerHeight / 2) * 0.003;
  document.documentElement.style.setProperty("--tilt-x", y);
  document.documentElement.style.setProperty("--tilt-y", x);
});

/* 4. INITIAL REVEAL (basic fade from loader state) */

window.addEventListener("load", () => {
  document.body.classList.add("shinken-loaded");
});

/* 5. REVEAL ON SCROLL (panels sliding in) */

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        if (entry.target.classList.contains("soft-reveal")) {
          entry.target.classList.add("soft-reveal-show");
        } else {
          entry.target.classList.add("reveal-show");
        }
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll(".reveal, .soft-reveal").forEach((el) =>
  observer.observe(el)
);

/* 6. BUTTON PRESS ANIMATION */

document.querySelectorAll(".btn-press").forEach((button) => {
  button.addEventListener("mousedown", () => {
    button.classList.add("pressed");
  });
  button.addEventListener("mouseup", () => {
    button.classList.remove("pressed");
  });
  button.addEventListener("mouseleave", () => {
    button.classList.remove("pressed");
  });
});

/* 7. CLOCK ENGINE v2 — time + phase string */

function initShinkenClock() {
  const clockEl = document.querySelector(".ui-clock");
  if (!clockEl) return;

  function pad(n) {
    return n.toString().padStart(2, "0");
  }

  function getPhase(hours) {
    if (hours < 5) return "Night window";
    if (hours < 11) return "Morning surface";
    if (hours < 17) return "Working band";
    if (hours < 21) return "Evening layer";
    return "Low-noise hours";
  }

  function updateClock() {
    const now = new Date();
    const h = pad(now.getHours());
    const m = pad(now.getMinutes());
    const s = pad(now.getSeconds());
    const phase = getPhase(now.getHours());

    clockEl.textContent = `${h}:${m}:${s} · ${phase}`;
  }

  updateClock();
  setInterval(updateClock, 1000);
}

document.addEventListener("DOMContentLoaded", initShinkenClock);

/* 8. AMBIENT FLOAT LAYER + PARTICLES + SCAN SWEEP */

(function initParticles() {
  const canvas = document.querySelector(".particle-field");
  const scan = document.querySelector(".scanline");
  if (!canvas || !scan) return;

  const ctx = canvas.getContext("2d");
  let w = (canvas.width = window.innerWidth);
  let h = (canvas.height = window.innerHeight);

  let particles = [];
  const COUNT = 120;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  window.addEventListener("resize", resize);

  function spawnParticles() {
    particles = [];
    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 1.3 + 0.4,
        alpha: Math.random() * 0.35 + 0.15,
        speedY: Math.random() * 0.12 + 0.02,
        offsetX: (Math.random() - 0.5) * 0.2,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach((p) => {
      p.y -= p.speedY;
      p.x += p.offsetX;

      if (p.y < -20) {
        p.y = h + 10;
        p.x = Math.random() * w;
      }

      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = "rgba(189, 236, 255,0.85)";
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  function animateScan() {
    let pos = -200;
    function step() {
      pos += 1.4;
      if (pos > h + 200) pos = -200;
      scan.style.top = pos + "px";
      requestAnimationFrame(step);
    }
    step();
  }

  resize();
  spawnParticles();
  draw();
  animateScan();
})();
