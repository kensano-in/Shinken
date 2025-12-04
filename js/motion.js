/* ============================================================
   SHINKEN MOTION ENGINE — GOD MODE BACKGROUND + UI
   ============================================================ */

(() => {
  // Small helper
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  // ==========================================================
  // 1. REAL-TIME CLOCK BAND
  // ==========================================================
  function initClock() {
    const el = document.getElementById("clock-time");
    if (!el) return;

    const update = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, "0");
      const m = String(now.getMinutes()).padStart(2, "0");
      const s = String(now.getSeconds()).padStart(2, "0");
      el.textContent = `${h}:${m}:${s}`;
    };

    update();
    setInterval(update, 1000);
  }

  // ==========================================================
  // 2. BACKGROUND CANVAS — PARTICLES + PARALLAX
  // ==========================================================
  function initBackground() {
    const canvas = document.getElementById("bg-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const particles = [];
    const STAR_COUNT = 120;
    const ORB_COUNT = 22;

    let width = 0;
    let height = 0;
    let px = 0;
    let py = 0;

    function resize() {
      width = canvas.width = window.innerWidth * window.devicePixelRatio;
      height = canvas.height = window.innerHeight * window.devicePixelRatio;
      ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    }

    function createParticles() {
      particles.length = 0;

      for (let i = 0; i < STAR_COUNT; i++) {
        particles.push({
          x: Math.random(),
          y: Math.random(),
          z: Math.random() * 0.7 + 0.3,
          type: "star",
        });
      }

      for (let i = 0; i < ORB_COUNT; i++) {
        particles.push({
          x: Math.random(),
          y: Math.random(),
          z: Math.random() * 0.8 + 0.6,
          r: 40 + Math.random() * 80,
          type: "orb",
        });
      }
    }

    function draw(t) {
      const time = t * 0.00006;

      ctx.clearRect(0, 0, width, height);

      // subtle gradient background
      const g = ctx.createLinearGradient(0, 0, 0, height);
      g.addColorStop(0, "#020813");
      g.addColorStop(0.3, "#020e1f");
      g.addColorStop(1, "#020815");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);

      // Slight movement factor from cursor
      const offsetX = px * 26;
      const offsetY = py * 30;

      for (const p of particles) {
        const baseX = p.x * width;
        const baseY = p.y * height;

        const depth = p.z;
        const parX = baseX + offsetX * (1.8 - depth);
        const parY = baseY + offsetY * (1.8 - depth);

        if (p.type === "star") {
          const twinkle = 0.6 + 0.4 * Math.sin(time * 8 + depth * 16 + p.x * 40);
          ctx.globalAlpha = 0.15 + 0.4 * twinkle;
          ctx.fillStyle = "#c9e9ff";
          ctx.beginPath();
          ctx.arc(parX, parY, 0.9 + 1.4 * depth, 0, Math.PI * 2);
          ctx.fill();
        } else {
          const pulse = 0.4 + 0.6 * Math.sin(time * 10 + depth * 24 + p.y * 50);
          ctx.globalAlpha = 0.08 * depth * pulse;
          const r = p.r * (0.7 + 0.3 * pulse);

          const rg = ctx.createRadialGradient(parX, parY, 0, parX, parY, r);
          rg.addColorStop(0, "rgba(130, 222, 255, 0.9)");
          rg.addColorStop(0.4, "rgba(83, 179, 255, 0.35)");
          rg.addColorStop(1, "transparent");

          ctx.fillStyle = rg;
          ctx.beginPath();
          ctx.arc(parX, parY, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;
      requestAnimationFrame(draw);
    }

    function handlePointer(x, y) {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;

      px = clamp((x - cx) / cx, -1, 1);
      py = clamp((y - cy) / cy, -1, 1);
    }

    window.addEventListener("mousemove", (e) => {
      handlePointer(e.clientX, e.clientY);
    });

    // basic mobile support: move with scroll a bit
    window.addEventListener("scroll", () => {
      const y = window.scrollY;
      py = clamp(y / window.innerHeight, -1, 1) * -0.35;
    });

    resize();
    createParticles();

    window.addEventListener("resize", () => {
      resize();
      createParticles();
    });

    requestAnimationFrame(draw);
  }

  // ==========================================================
  // 3. UI PARALLAX — CARDS FOLLOW CURSOR
  // ==========================================================
  function initParallaxLayers() {
    const layers = Array.from(document.querySelectorAll(".parallax-layer"));
    if (!layers.length) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    function onMove(e) {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      targetX = clamp((e.clientX - cx) / cx, -1, 1);
      targetY = clamp((e.clientY - cy) / cy, -1, 1);
    }

    window.addEventListener("mousemove", onMove);

    function animate() {
      // smooth follow
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      layers.forEach((el) => {
        const depth = parseFloat(el.dataset.depth || "0.1");
        const tx = -currentX * depth * 22;
        const ty = -currentY * depth * 18;
        const tiltX = currentY * depth * 6;
        const tiltY = -currentX * depth * 6;

        el.style.transform = `translate3d(${tx}px, ${ty}px, 0) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
        if (Math.abs(currentX) > 0.05 || Math.abs(currentY) > 0.05) {
          el.classList.add("is-active");
        } else {
          el.classList.remove("is-active");
        }
      });

      requestAnimationFrame(animate);
    }

    animate();
  }

  // ==========================================================
  // 4. NOTIFICATION FORM — PROFESSIONAL HANDLING
  // ==========================================================
  function initNotification() {
    const form = document.getElementById("notify-form");
    const statusEl = document.getElementById("notify-status");
    if (!form || !statusEl) return;

    const ENDPOINT = "https://your-secure-endpoint.example/notify"; // TODO: replace with your backend

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      statusEl.textContent = "";
      statusEl.classList.remove("ok", "err");

      const data = new FormData(form);
      const email = String(data.get("email") || "").trim();

      if (!email || !email.includes("@")) {
        statusEl.textContent = "Supply a valid signal address.";
        statusEl.classList.add("err");
        return;
      }

      // Optimistic UI
      statusEl.textContent = "Routing to control surface…";
      form.querySelector("button[type='submit']").disabled = true;

      try {
        // NOTE:
        // For a truly professional setup, point this POST to a backend
        // that stores the email and handles notifications.
        // Do NOT put secret API keys or bot tokens in this frontend file.
        await fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        statusEl.textContent = "Registered. You’ll get a single quiet launch ping.";
        statusEl.classList.add("ok");
        form.reset();
      } catch (err) {
        console.error("Notify error:", err);
        statusEl.textContent =
          "Local registration only. Backend not wired yet, but we’ve kept it noted.";
        statusEl.classList.add("err");
      } finally {
        form.querySelector("button[type='submit']").disabled = false;
      }
    });
  }

  // ==========================================================
  // 5. BUTTON PRESS + MAGNETIC HOVER (tiny polish)
  // ==========================================================
  function initButtonPhysics() {
    const magnetic = document.querySelectorAll(".magnetic");

    magnetic.forEach((btn) => {
      const strength = parseFloat(btn.getAttribute("data-strength") || "25");

      function onMove(e) {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - (rect.left + rect.width / 2);
        const y = e.clientY - (rect.top + rect.height / 2);
        btn.style.transform = `translate(${x / strength}px, ${y / strength}px)`;
      }

      function reset() {
        btn.style.transform = "translate(0, 0)";
      }

      btn.addEventListener("mousemove", onMove);
      btn.addEventListener("mouseleave", reset);
    });
  }

  // ==========================================================
  // BOOTSTRAP
  // ==========================================================
  document.addEventListener("DOMContentLoaded", () => {
    initClock();
    initBackground();
    initParallaxLayers();
    initNotification();
    initButtonPhysics();
    console.log(
      "%cShinken Motion Engine: Online",
      "color:#8fd7ff;background:#031321;padding:4px 10px;border-radius:999px"
    );
  });
})();
