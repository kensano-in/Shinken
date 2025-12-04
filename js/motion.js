/* ============================================================
   SHINKEN – MOTION ENGINE
   Layers:
   1. Star field
   2. Cursor parallax (background + cards)
   3. Magnetic buttons
   4. Clock
   5. Notification form (front-end)
   6. Cookie / consent state
   ============================================================ */

console.log(
  "%cShinken Motion Engine online",
  "color:#9cecff;background:#00111e;padding:4px 10px;border-radius:999px;font-size:11px;"
);

/* ------------------------------------------------------------
   1. STAR FIELD
------------------------------------------------------------- */
(function initStarField() {
  const canvas = document.getElementById("bg-stars");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const STAR_COUNT = 120;
  const stars = [];

  function resize() {
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
    ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
  }

  function spawnStars() {
    stars.length = 0;
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 1.2 + 0.2,
        speed: Math.random() * 0.04 + 0.008,
        alpha: Math.random() * 0.6 + 0.2,
      });
    }
  }

  function step() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.fillStyle = "rgba(255,255,255,0.9)";

    for (const star of stars) {
      star.y -= star.speed;
      if (star.y < -4) {
        star.y = window.innerHeight + 4;
        star.x = Math.random() * window.innerWidth;
      }

      ctx.globalAlpha = star.alpha;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(step);
  }

  resize();
  spawnStars();
  window.addEventListener("resize", () => {
    resize();
    spawnStars();
  });

  requestAnimationFrame(step);
})();

/* ------------------------------------------------------------
   2. CURSOR PARALLAX – BACKGROUND + CARDS
------------------------------------------------------------- */
(function initParallax() {
  const gradient = document.querySelector(".bg-gradient");
  const depthTargets = document.querySelectorAll("[data-tilt-target]");

  if (!gradient && !depthTargets.length) return;

  const state = { x: 0, y: 0, tx: 0, ty: 0 };

  function handleMove(e) {
    const rect = document.body.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    const x = (e.clientX - cx) / cx;
    const y = (e.clientY - cy) / cy;

    state.tx = x;
    state.ty = y;
  }

  function loop() {
    state.x += (state.tx - state.x) * 0.08;
    state.y += (state.ty - state.y) * 0.08;

    const gx = state.x * 12;
    const gy = state.y * 12;
    if (gradient) {
      gradient.style.transform = `translate3d(${gx}px, ${gy}px, 0)`;
    }

    depthTargets.forEach((el) => {
      const depth = parseFloat(el.getAttribute("data-depth")) || 16;
      const tx = -state.x * depth;
      const ty = -state.y * depth;
      el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      el.classList.add("is-tilting");
    });

    requestAnimationFrame(loop);
  }

  window.addEventListener("pointermove", handleMove, { passive: true });
  requestAnimationFrame(loop);
})();

/* ------------------------------------------------------------
   3. MAGNETIC BUTTONS
------------------------------------------------------------- */
(function initMagnetic() {
  const magnetic = document.querySelectorAll(".magnetic");
  if (!magnetic.length) return;

  magnetic.forEach((el) => {
    const strength = parseFloat(el.getAttribute("data-strength")) || 18;

    function move(e) {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);
      el.style.transform = `translate(${x / strength}px, ${y / strength}px)`;
    }

    function leave() {
      el.style.transform = "translate(0, 0)";
    }

    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
  });
})();

/* ------------------------------------------------------------
   4. REAL-TIME CLOCK
------------------------------------------------------------- */
(function initClock() {
  const el = document.getElementById("ui-clock");
  if (!el) return;

  function pad(n) {
    return n.toString().padStart(2, "0");
  }

  function tick() {
    const now = new Date();
    const h = pad(now.getHours());
    const m = pad(now.getMinutes());
    const s = pad(now.getSeconds());
    el.textContent = `${h}:${m}:${s}`;
  }

  tick();
  setInterval(tick, 1000);
})();

/* ------------------------------------------------------------
   5. NOTIFICATION FORM – FRONT-END HANDLER
   NOTE:
   - This only sends a POST to /notify
   - You must implement /notify (e.g., Cloudflare Worker)
     to actually send Telegram / email and store addresses.
------------------------------------------------------------- */
(function initNotifyForm() {
  const form = document.getElementById("notify-form");
  const statusEl = document.getElementById("notify-status");
  const btn = document.getElementById("notify-btn");
  const consent = document.getElementById("notify-consent");

  if (!form || !statusEl || !btn || !consent) return;

  async function handleSubmit(e) {
    e.preventDefault();

    const email = form.email.value.trim();

    if (!email) {
      statusEl.textContent = "Drop a working email first.";
      statusEl.style.color = "#ffb35b";
      return;
    }

    if (!consent.checked) {
      statusEl.textContent = "You need to consent to a single launch notice.";
      statusEl.style.color = "#ffb35b";
      return;
    }

    btn.disabled = true;
    btn.textContent = "Queuing…";
    statusEl.textContent = "";
    statusEl.style.color = "";

    try {
      const res = await fetch("/notify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        throw new Error("Non-200 response");
      }

      statusEl.textContent = "Locked in. You’ll get a single quiet ping when we go live.";
      statusEl.style.color = "#9cecff";
      form.reset();
    } catch (err) {
      console.error("Notify error:", err);
      statusEl.textContent =
        "Signal failed on the first pass. Try once more later—line stays open.";
      statusEl.style.color = "#ffb35b";
    } finally {
      btn.disabled = false;
      btn.textContent = "Notify me";
    }
  }

  form.addEventListener("submit", handleSubmit);
})();

/* ------------------------------------------------------------
   6. COOKIE / CONSENT BANNER
------------------------------------------------------------- */
(function initConsent() {
  const banner = document.getElementById("consent-banner");
  const acceptBtn = document.getElementById("consent-accept");
  const rejectBtn = document.getElementById("consent-reject");

  if (!banner || !acceptBtn || !rejectBtn) return;

  const STORAGE_KEY = "shinken_consent";

  function getState() {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      return v ? JSON.parse(v) : null;
    } catch {
      return null;
    }
  }

  function setState(value) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch {
      // ignore
    }
  }

  function hide() {
    banner.classList.add("hidden");
  }

  function show() {
    banner.classList.remove("hidden");
  }

  const existing = getState();

  if (!existing) {
    show();
  }

  acceptBtn.addEventListener("click", () => {
    setState({ analytics: true, ts: Date.now() });
    hide();
    // Here you’d wire your analytics (Plausible, etc.) if you use one.
  });

  rejectBtn.addEventListener("click", () => {
    setState({ analytics: false, ts: Date.now() });
    hide();
  });
})();
