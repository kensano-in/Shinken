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
