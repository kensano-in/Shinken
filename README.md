# ShinChat — AI-Powered Chat Platform

> **The next generation of conversation. Fast. Private. Intelligent.**

[![Status](https://img.shields.io/badge/status-coming%20soon-red?style=flat-square)](https://shinken.in)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square)](https://nextjs.org)
[![Deploy](https://img.shields.io/badge/deploy-Vercel-black?style=flat-square)](https://vercel.com)

---

## What is ShinChat?

ShinChat is an AI-powered communication platform built under the **Shinken** ecosystem.
Real-time chat with intelligence built directly into every conversation — summaries, smart replies,
and context-aware AI without ever leaving your chat.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | JavaScript (no TypeScript) |
| Styling | Global CSS (design token system) |
| Fonts | Syne · DM Mono · Inter (via `next/font`) |
| State | React hooks only |
| Persistence | localStorage (email waitlist) |
| Deployment | Vercel (primary) |

---

## Features

- **Hero** — Animated headline, live countdown, email waitlist with validation
- **Features Grid** — 6-card feature overview, hover interactions
- **AI Demo** — Live auto-playing chat demo with typing indicators, user can interact
- **Stats** — Scroll-triggered animated counters + progress bars
- **Email Capture** — Full CTA section with loading spinner + success state
- **Footer** — Brand, social links, copyright

---

## Project Structure

```
shinken/
├── app/
│   ├── layout.js           ← Root layout, fonts, SEO metadata
│   ├── page.js             ← Page assembly
│   └── globals.css         ← Design system (tokens, reset, all styles)
├── components/
│   ├── Navbar.js           ← Sticky nav with scroll effect
│   ├── Hero.js             ← Hero + countdown + email form
│   ├── Features.js         ← 6-card features grid
│   ├── AIDemo.js           ← Interactive AI chat demo
│   ├── Stats.js            ← Animated stats on scroll
│   ├── EmailCapture.js     ← Bottom CTA email capture
│   └── Footer.js           ← Footer + social links
├── lib/
│   └── utils.js            ← Email validation, storage, helpers
├── next.config.js
├── package.json
└── .gitignore
```

---

## Getting Started

> Requires **Node.js 18+** — [Download here](https://nodejs.org)

```bash
# 1. Install dependencies
npm install

# 2. Run dev server
npm run dev
# → Opens at http://localhost:3000

# 3. Build for production
npm run build

# 4. Preview production build
npm start
```

---

## Deployment (Vercel — Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"** → import `kensano-in/Shinken`
3. Framework: **Next.js** (auto-detected)
4. Click **Deploy** — done ✓

To add your custom domain (`shinken.in`):
- Vercel Dashboard → Project → Settings → Domains → Add `shinken.in`
- Update DNS: add a CNAME record pointing to `cname.vercel-dns.com`

---

## Contact

| Platform | Handle |
|---|---|
| Email | admin@kensano.in |
| X / Twitter | [@Shinichirofr](https://x.com/Shinichirofr) |
| Instagram | [@shinichiro.2](https://instagram.com/shinichiro.2) |
| Telegram | [@Shinichirofr](https://t.me/Shinichirofr) |

---

© 2026 Shinken. All rights reserved.