/* ==========================================================================
   SHINKEN MOTION ENGINE — GOD TIER MONOLITH v1
   Authors: Shinichiro & Ken
   Scope  : All front-end motion for shinken.in
   Notes  : Single source of truth for physics, scroll, clock, atmospherics.
   ========================================================================== */

(() => {
  "use strict";

  /* -----------------------------------------------------------------------
     0. GLOBAL CONFIG + SAFETY
     ----------------------------------------------------------------------- */

  const MotionConfig = {
    debug: false,                        // console spam toggle
    scrollEase: 0.08,                    // smooth scroll easing
    magneticStrengthDefault: 25,         // px offset for .magnetic
    revealThreshold: 0.15,               // scroll reveal threshold
    softRevealThreshold: 0.3,            // soft section reveal threshold
    particleCountDesktop: 80,
    particleCountMobile: 35,
    particleMaxSize: 2.4,
    particleMinSize: 0.7,
    particleSpeedBase: 0.08,
    clockFrameMs: 1000 / 30,             // 30 fps visual loop
    clockJitter: 0.0025,                 // jitter intensity
    floatIntensity: 0.002,               // float parallax response
    floatRotationMultiplier: 4,          // degrees per normalized offset
    scanlineDuration: 16_000,            // ms for full sweep
  };

  const isTouch =
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0;

  const log = (...args) => {
    if (!MotionConfig.debug) return;
    console.log("[ShinkenMotion]", ...args);
  };

  console.log(
    "%cShinken Motion Engine — Monolith Online",
    "color:#9ecbff;background:#00111c;padding:6px 14px;font-size:13px;border-radius:999px;"
  );

  /* -----------------------------------------------------------------------
     1. UTILITIES
     ----------------------------------------------------------------------- */

  const clamp = (val, min, max) => Math.min(max, Math.max(min, val));

  const lerp = (from, to, t) => from + (to - from) * t;

  const isMobileViewport = () => window.innerWidth <= 768;

  const raf = (fn) => window.requestAnimationFrame(fn);

  const onDOMReady = (fn) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  };

  /* -----------------------------------------------------------------------
     2. SMOOTH SCROLL PHYSICS (body scroll dampening)
     ----------------------------------------------------------------------- */

  function initSmoothScroll() {
    let lastScrollY = window.scrollY || window.pageYOffset || 0;
    let virtualScrollY = lastScrollY;
    let ticking = false;

    const update = () => {
      const current = window.scrollY || window.pageYOffset || 0;
      virtualScrollY = lerp(virtualScrollY, current, MotionConfig.scrollEase);

      const diff = current - virtualScrollY;
      const yTilt = clamp(diff * 0.0005, -0.8, 0.8);

      document.documentElement.style.setProperty("--scroll-tilt-y", yTilt.toString());

      if (Math.abs(diff) > 0.4) {
        raf(update);
      } else {
        ticking = false;
        document.documentElement.style.setProperty("--scroll-tilt-y", "0");
      }
    };

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          ticking = true;
          raf(update);
        }
      },
      { passive: true }
    );

    log("Smooth scroll physics online.");
  }

  /* -----------------------------------------------------------------------
     3. MAGNETIC BUTTONS / ELEMENTS
     ----------------------------------------------------------------------- */

  function initMagneticElements() {
    const elements = document.querySelectorAll(".magnetic");
    if (!elements.length) return;

    elements.forEach((el) => {
      const strength =
        parseFloat(el.getAttribute("data-strength")) ||
        MotionConfig.magneticStrengthDefault;

      let hover = false;

      const onMove = (e) => {
        if (!hover) return;
        const rect = el.getBoundingClientRect();
        const relX = e.clientX - (rect.left + rect.width / 2);
        const relY = e.clientY - (rect.top + rect.height / 2);

        const x = clamp(relX / (rect.width / 2), -1, 1) * strength;
        const y = clamp(relY / (rect.height / 2), -1, 1) * strength;

        el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      };

      const onEnter = () => {
        hover = true;
        document.addEventListener("mousemove", onMove);
        el.classList.add("magnetic-active");
      };

      const onLeave = () => {
        hover = false;
        document.removeEventListener("mousemove", onMove);
        el.style.transform = "translate3d(0, 0, 0)";
        el.classList.remove("magnetic-active");
      };

      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
    });

    log(`Magnetic field applied to ${elements.length} elements.`);
  }

  /* -----------------------------------------------------------------------
     4. PARALLAX MOUSE DEPTH (whole surface tilt)
     ----------------------------------------------------------------------- */

  function initMouseParallax() {
    if (isTouch) {
      log("Touch device detected, skipping mouse parallax.");
      return;
    }

    window.addEventListener(
      "mousemove",
      (e) => {
        const xNorm = (e.clientX / window.innerWidth - 0.5) * 2; // -1 to 1
        const yNorm = (e.clientY / window.innerHeight - 0.5) * 2;

        const tiltX = clamp(yNorm * 0.7, -1, 1);
        const tiltY = clamp(-xNorm * 0.7, -1, 1);

        document.documentElement.style.setProperty("--tilt-x", tiltX.toString());
        document.documentElement.style.setProperty("--tilt-y", tiltY.toString());
      },
      { passive: true }
    );

    log("Mouse parallax depth online.");
  }

  /* -----------------------------------------------------------------------
     5. SMOOTH FADE-IN ON LOAD (boot overlay removal)
     ----------------------------------------------------------------------- */

  function initBootFade() {
    window.addEventListener("load", () => {
      document.body.classList.add("shinken-loaded");

      // Soft boot overlay fade out if exists
      setTimeout(() => {
        const boot = document.querySelector(".preloader, #boot-screen");
        if (boot) {
          boot.style.opacity = "0";
        }
      }, 450);

      setTimeout(() => {
        const boot = document.querySelector(".preloader, #boot-screen");
        if (boot && boot.parentNode) boot.parentNode.removeChild(boot);
      }, 1000);

      log("Boot fade sequence complete.");
    });
  }

  /* -----------------------------------------------------------------------
     6. SCROLL REVEAL (hard + soft variants)
     ----------------------------------------------------------------------- */

  function initScrollReveal() {
    const revealEls = document.querySelectorAll(".reveal");
    const softSections = document.querySelectorAll(".soft-reveal");

    if (!revealEls.length && !softSections.length) return;

    if ("IntersectionObserver" in window) {
      // Hard reveal
      if (revealEls.length) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add("reveal-show");
                observer.unobserve(entry.target);
              }
            });
          },
          { threshold: MotionConfig.revealThreshold }
        );

        revealEls.forEach((el) => observer.observe(el));
      }

      // Soft cinematic fade progression
      if (softSections.length) {
        const softObs = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add("soft-reveal-show");
                softObs.unobserve(entry.target);
              }
            });
          },
          { threshold: MotionConfig.softRevealThreshold }
        );

        softSections.forEach((el) => softObs.observe(el));
      }

      log("Scroll reveal observers initialised.");
    } else {
      // Fallback: show them immediately
      revealEls.forEach((el) => el.classList.add("reveal-show"));
      softSections.forEach((el) => el.classList.add("soft-reveal-show"));
      log("IntersectionObserver not available, fallback reveal used.");
    }
  }

  /* -----------------------------------------------------------------------
     7. BUTTON PRESS STATES
     ----------------------------------------------------------------------- */

  function initButtonPress() {
    const buttons = document.querySelectorAll(".btn-press, .btn");
    if (!buttons.length) return;

    buttons.forEach((button) => {
      button.addEventListener("mousedown", () => {
        button.classList.add("pressed");
      });
      button.addEventListener("mouseup", () => {
        button.classList.remove("pressed");
      });
      button.addEventListener("mouseleave", () => {
        button.classList.remove("pressed");
      });
      // Touch support
      button.addEventListener("touchstart", () => {
        button.classList.add("pressed");
      });
      button.addEventListener("touchend", () => {
        button.classList.remove("pressed");
      });
    });

    log(`Button press animation attached to ${buttons.length} buttons.`);
  }

  /* -----------------------------------------------------------------------
     8. LEVEL-2 CLOCK PHYSICS (neon capsule + jitter)
     ----------------------------------------------------------------------- */

  function initClock() {
    const clockEl = document.querySelector(".ui-clock");
    if (!clockEl) {
      log("No .ui-clock found, skipping clock module.");
      return;
    }

    let lastRendered = 0;
    let smoothSeconds = 0;
    let lastTickSeconds = 0;

    const updateExactTime = () => {
      const now = new Date();
      const h = now.getHours().toString().padStart(2, "0");
      const m = now.getMinutes().toString().padStart(2, "0");
      const s = now.getSeconds().toString().padStart(2, "0");
      const totalSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

      return { h, m, s, totalSeconds };
    };

    const formatDisplay = ({ h, m, s }) => `${h}:${m}:${s}`;

    const update = (ts) => {
      if (!lastRendered) lastRendered = ts;
      const dt = ts - lastRendered;

      if (dt >= MotionConfig.clockFrameMs) {
        lastRendered = ts;

        const exact = updateExactTime();

        // Smooth progression towards actual seconds
        if (!smoothSeconds) smoothSeconds = exact.totalSeconds;

        smoothSeconds = lerp(smoothSeconds, exact.totalSeconds, 0.15);

        // Micro-jitter to make it feel like an instrument
        const jitter = (Math.random() - 0.5) * MotionConfig.clockJitter;
        const jittered = smoothSeconds + jitter;

        const secondsNormalized = (jittered % 60) / 60; // 0–1

        // Pass some values to CSS for glow animations if needed
        document.documentElement.style.setProperty(
          "--clock-sweep",
          secondsNormalized.toFixed(4)
        );

        const newSeconds = Math.round(jittered) % 60;
        if (newSeconds !== lastTickSeconds) {
          lastTickSeconds = newSeconds;
          clockEl.classList.remove("clock-tick");
          // trigger reflow so animation can retrigger
          void clockEl.offsetWidth;
          clockEl.classList.add("clock-tick");
        }

        // Update text every frame (already cheap)
        clockEl.textContent = formatDisplay(exact);
      }

      raf(update);
    };

    // Start loop
    raf(update);

    log("Level-2 clock physics online.");
  }

  /* -----------------------------------------------------------------------
     9. AMBIENT FLOAT LAYER (cards moving with mouse)
     ----------------------------------------------------------------------- */

  function initFloatLayer() {
    const floats = document.querySelectorAll(".float-layer, .float-card");
    if (!floats.length) return;

    if (isTouch) {
      // On touch devices just give them a slow idle float
      floats.forEach((el, index) => {
        const delay = (index * 779) % 4000;
        el.style.animationDelay = `${delay}ms`;
        el.classList.add("float-idle");
      });
      log("Float layer set to idle (touch device).");
      return;
    }

    window.addEventListener(
      "mousemove",
      (e) => {
        const xNorm = (e.clientX / window.innerWidth - 0.5) * 2;
        const yNorm = (e.clientY / window.innerHeight - 0.5) * 2;

        const x = xNorm * MotionConfig.floatIntensity * window.innerWidth;
        const y = yNorm * MotionConfig.floatIntensity * window.innerHeight;
        const rot = xNorm * MotionConfig.floatRotationMultiplier;

        floats.forEach((el, idx) => {
          const depth = 1 + idx * 0.18; // slightly different for each
          const tx = x / depth;
          const ty = y / depth;
          const r = rot / depth;

          el.style.transform = `translate3d(${tx}px, ${ty}px, 0) rotate3d(0,0,1,${r}deg)`;
        });
      },
      { passive: true }
    );

    log(`Float layer active on ${floats.length} elements.`);
  }

  /* -----------------------------------------------------------------------
     10. MICRO-PARTICLE FIELD (subtle dust in the air)
     ----------------------------------------------------------------------- */

  function initParticles() {
    const existing = document.querySelector(".particle-field");
    const canvas =
      existing ||
      (() => {
        const c = document.createElement("canvas");
        c.className = "particle-field";
        document.body.appendChild(c);
        return c;
      })();

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      log("Canvas 2D not available, skipping particles.");
      return;
    }

    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    resize();
    window.addEventListener("resize", resize);

    const count = isMobileViewport()
      ? MotionConfig.particleCountMobile
      : MotionConfig.particleCountDesktop;

    const particles = [];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size:
          MotionConfig.particleMinSize +
          Math.random() *
            (MotionConfig.particleMaxSize - MotionConfig.particleMinSize),
        speed:
          MotionConfig.particleSpeedBase +
          Math.random() * MotionConfig.particleSpeedBase * 2,
        drift: (Math.random() - 0.5) * 0.03,
        alpha: 0.02 + Math.random() * 0.06,
      });
    }

    const tick = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "screen";

      particles.forEach((p) => {
        p.y -= p.speed;
        p.x += p.drift;

        if (p.y < -20) p.y = height + 20;
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;

        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      raf(tick);
    };

    tick();
    log(`Particle field initialised with ${count} particles.`);
  }

  /* -----------------------------------------------------------------------
     11. SCANLINE SWEEP (cinematic vertical beam)
     ----------------------------------------------------------------------- */

  function initScanline() {
    let scan = document.querySelector(".scanline");
    if (!scan) {
      scan = document.createElement("div");
      scan.className = "scanline";
      document.body.appendChild(scan);
    }

    let lastTime = 0;
    const duration = MotionConfig.scanlineDuration;

    const loop = (ts) => {
      if (!lastTime) lastTime = ts;
      const elapsed = (ts - lastTime) % duration;
      const t = elapsed / duration; // 0..1

      const pos = -0.25 + t * 1.5; // move beyond viewport

      scan.style.transform = `translate3d(0, ${pos * 100}vh, 0)`;
      raf(loop);
    };

    raf(loop);
    log("Scanline sweep engaged.");
  }

  /* -----------------------------------------------------------------------
     12. SAFETY NETS & DEBUG HOOK
     ----------------------------------------------------------------------- */

  function attachDebug() {
    if (!MotionConfig.debug) return;

    window.ShinkenMotionDebug = {
      config: MotionConfig,
      toggleClockJitter(value) {
        MotionConfig.clockJitter = value;
      },
      logConfig() {
        console.table(MotionConfig);
      },
    };

    log("Debug namespace exposed as window.ShinkenMotionDebug");
  }

  /* -----------------------------------------------------------------------
     MASTER INIT
     ----------------------------------------------------------------------- */

  function initAll() {
    document.documentElement.classList.add("js-motion-ready");

    initSmoothScroll();
    initMagneticElements();
    initMouseParallax();
    initBootFade();
    initScrollReveal();
    initButtonPress();
    initClock();
    initFloatLayer();
    initParticles();
    initScanline();
    attachDebug();

    log("Shinken Motion Monolith fully initialised.");
  }

  onDOMReady(initAll);
})();
