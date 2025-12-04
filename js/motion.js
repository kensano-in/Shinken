/* ----------------------------------------------------------
   SHINKEN MOTION ENGINE — Core Physics Layer
   Author: Ken (structural counterpart)
-----------------------------------------------------------*/

console.log("%cShinken Motion Engine Active", "color:#9ecbff;background:#00111c;padding:6px 12px;font-size:14px;");

/* ----------------------------------------------------------
   1. SMOOTH SCROLL PHYSICS
-----------------------------------------------------------*/

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

/* ----------------------------------------------------------
   2. MAGNETIC BUTTONS
-----------------------------------------------------------*/

const magneticElements = document.querySelectorAll(".magnetic");

magneticElements.forEach(el => {
    const strength = parseFloat(el.getAttribute("data-strength")) || 25;

    el.addEventListener("mousemove", e => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        el.style.transform = `translate(${x / strength}px, ${y / strength}px)`;
    });

    el.addEventListener("mouseleave", () => {
        el.style.transform = "translate(0px, 0px)";
    });
});

/* ----------------------------------------------------------
   3. PARALLAX MOUSE DEPTH
-----------------------------------------------------------*/

document.addEventListener("mousemove", e => {
    const x = (e.clientX - window.innerWidth / 2) * 0.003;
    const y = (e.clientY - window.innerHeight / 2) * 0.003;
    document.documentElement.style.setProperty("--tilt-x", y);
    document.documentElement.style.setProperty("--tilt-y", x);
});

/* ----------------------------------------------------------
   4. SMOOTH FADE-IN ON LOAD
-----------------------------------------------------------*/

window.addEventListener("load", () => {
    document.body.classList.add("shinken-loaded");

    setTimeout(() => {
        const el = document.querySelector(".preloader");
        if (el) el.style.opacity = "0";
    }, 400);

    setTimeout(() => {
        const el = document.querySelector(".preloader");
        if (el) el?.remove();
    }, 900);
});


/* ----------------------------------------------------------
   5. REVEAL ON SCROLL (Observer)
-----------------------------------------------------------*/

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("reveal-show");
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll(".reveal").forEach(el => {
    observer.observe(el);
});

/* ----------------------------------------------------------
   6. BUTTON PRESS ANIMATION
-----------------------------------------------------------*/

document.querySelectorAll(".btn-press").forEach(button => {
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




/* ---------------------------------------------------------
   7. REAL-TIME SYSTEM CLOCK (UI CLOCK MODULE)
----------------------------------------------------------*/

function initShinkenClock() {
    const clockEl = document.querySelector(".ui-clock");
    if (!clockEl) return;

    function updateClock() {
        const now = new Date();
        const h = now.getHours().toString().padStart(2, "0");
        const m = now.getMinutes().toString().padStart(2, "0");
        const s = now.getSeconds().toString().padStart(2, "0");
        clockEl.innerHTML = `${h}:${m}:${s}`;
    }

    updateClock();
    setInterval(updateClock, 1000);
}

document.addEventListener("DOMContentLoaded", initShinkenClock);



/* ---------------------------------------------------------
   8. AMBIENT FLOAT LAYER (Soft rotation + parallax depth)
----------------------------------------------------------*/

(function () {
    const floats = document.querySelectorAll(".float-layer");

    window.addEventListener("mousemove", (e) => {
        const x = (e.clientX - window.innerWidth / 2) * 0.002;
        const y = (e.clientY - window.innerHeight / 2) * 0.002;

        floats.forEach((el) => {
            el.style.transform = `translate(${x * 20}px, ${y * 20}px) rotate(${x * 4}deg)`;
        });
    });
})();



/* ---------------------------------------------------------
   9. GLOW SCAN-LINE (Cyber surface highlight sweep)
----------------------------------------------------------*/

(function () {
    const scan = document.createElement("div");
    scan.className = "scanline";
    document.body.appendChild(scan);

    let pos = -200;

    function animateScan() {
        pos += 1.2;
        scan.style.top = pos + "px";

        if (pos > window.innerHeight + 200) pos = -200;

        requestAnimationFrame(animateScan);
    }

    animateScan();
})();



/* ---------------------------------------------------------
   10. SECTION FADE PROGRESSION (God-tier cinematic reveal)
----------------------------------------------------------*/

const sections = document.querySelectorAll(".soft-reveal");

const progressiveObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("soft-reveal-show");
            }
        });
    },
    { threshold: 0.3 }
);

sections.forEach((s) => progressiveObserver.observe(s));



/* ---------------------------------------------------------
   11. MICRO-PARTICLE FIELD (Subtle atmospheric dust)
----------------------------------------------------------*/

(function () {
    const particleLayer = document.createElement("canvas");
    particleLayer.className = "particle-field";
    document.body.appendChild(particleLayer);

    const ctx = particleLayer.getContext("2d");

    let particles = [];
    const count = 60;

    function resize() {
        particleLayer.width = window.innerWidth;
        particleLayer.height = window.innerHeight;
    }

    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * particleLayer.width,
            y: Math.random() * particleLayer.height,
            size: Math.random() * 2 + 0.5,
            speed: Math.random() * 0.4 + 0.1,
        });
    }

    function animate() {
        ctx.clearRect(0, 0, particleLayer.width, particleLayer.height);

        particles.forEach((p) => {
            p.y += p.speed;
            if (p.y > particleLayer.height) p.y = 0;

            ctx.fillStyle = "rgba(255,255,255,0.08)";
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });

        requestAnimationFrame(animate);
    }

    animate();
})();
