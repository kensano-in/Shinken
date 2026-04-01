# ShinChat — Shinken Ecosystem

> **The next-generation, privacy-first chat platform.** Fast. Private. Alive.

[![Status](https://img.shields.io/badge/status-coming%20soon-red?style=flat-square)](https://shinken.in)
[![Deployment](https://img.shields.io/badge/deployed-GitHub%20Pages-black?style=flat-square)](https://shinken.in)
[![License](https://img.shields.io/badge/license-All%20Rights%20Reserved-red?style=flat-square)](#)

---

## Overview

ShinChat is a real-time communication platform built under the **Shinken** ecosystem. This repository hosts the production landing page — a fully interactive, feature-rich coming-soon hub.

---

## Features

| Feature | Description |
|---|---|
| 🎨 **Design System** | Full token-based CSS design system (colors, spacing, typography, motion) |
| ⚡ **Particle Engine** | Modular canvas-based particle system |
| 💬 **Chat Preview** | Live animated chat UI mockup with typing indicators |
| 📊 **Dashboard Stats** | Animated counter stats with scroll-triggered reveals |
| 🎯 **Mini Games** | Built-in reflex/click game, modular architecture for more |
| 🔔 **Toast Notifications** | 4-type notification system (default, success, warn, info) |
| 🕶️ **Custom Cursor** | Smooth lagging cursor with magnetic hover states |
| ⏱ **Live Countdown** | Real-time launch countdown timer |
| 📧 **Waitlist Form** | Email capture with localStorage persistence |
| 📱 **Fully Responsive** | Mobile-first design with overlay navigation |
| ♿ **Accessible** | Semantic HTML, ARIA labels, focus management |
| 🔍 **SEO-ready** | OG tags, meta descriptions, canonical URLs |

---

## Project Structure

```
shinken/
├── index.html           # Main HTML — semantic, accessible, SEO-complete
├── css/
│   ├── design-system.css  # Tokens, reset, base utilities, cursor, animations
│   └── sections.css       # Section-level styles: hero, chat, stats, games
├── js/
│   ├── main.js           # App entry — wires all modules
│   ├── particles.js      # Canvas particle system (class-based)
│   ├── chat.js           # Chat preview animation module
│   ├── notify.js         # Toast notification module
│   └── utils.js          # Shared helpers (debounce, lerp, store, etc.)
├── CNAME                 # GitHub Pages custom domain
└── README.md
```

---

## Local Development

No build step required — it's a pure HTML/CSS/JS static site.

```bash
# Option 1: Python
python -m http.server 8080

# Option 2: Node http-server
npx http-server . -p 8080

# Option 3: VS Code Live Server extension
# Right-click index.html → "Open with Live Server"
```

> **Important:** JS modules (`type="module"`) require a server — opening `index.html` directly in the browser will fail due to CORS restrictions on ES module imports.

---

## Deployment

Deployed automatically via **GitHub Pages** to [shinken.in](https://shinken.in).

```
Branch: main (or gh-pages)
Custom Domain: shinken.in (via CNAME)
```

---

## Design Principles

- **Apple** — Clarity and purposeful whitespace
- **Stripe** — Engineering-first, zero compromises
- **Vercel** — Performance as the default
- **Linear** — UI precision and respect for the user

---

## Contact

| Platform | Handle |
|---|---|
| Email | admin@kensano.in |
| Instagram | [@shinichiro.2](https://instagram.com/shinichiro.2) |
| Telegram | [@Shinichirofr](https://t.me/Shinichirofr) |
| X / Twitter | [@Shinichirofr](https://x.com/Shinichirofr) |

---

© 2026 Shinken. All rights reserved.