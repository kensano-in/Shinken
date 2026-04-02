'use client';

import { useEffect, useRef, useState } from 'react';

const STATS = [
  {
    value: 1247,
    suffix: '+',
    label: 'Joined Waitlist',
    subLabel: 'and growing',
    fill: '78%',
    red: false,
  },
  {
    value: 12,
    suffix: 'ms',
    label: 'Target Latency',
    subLabel: 'global average',
    fill: '96%',
    red: true,
  },
  {
    value: 99.9,
    suffix: '%',
    label: 'Uptime SLA',
    subLabel: 'zero downtime goal',
    fill: '99%',
    red: false,
    decimal: true,
  },
  {
    value: 256,
    suffix: '-bit',
    label: 'Encryption',
    subLabel: 'end-to-end, always',
    fill: '100%',
    red: false,
  },
];

function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, mn, mx) { return Math.min(Math.max(v, mn), mx); }

function StatCard({ stat }) {
  const [displayed, setDisplayed] = useState(0);
  const [started, setStarted] = useState(false);
  const cardRef = useRef(null);
  const barRef  = useRef(null);
  const rafRef  = useRef(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
          if (barRef.current) {
            setTimeout(() => {
              if (barRef.current) barRef.current.style.width = stat.fill;
            }, 200);
          }
          const duration = 1600;
          const startTime = performance.now();
          const animate = (now) => {
            const p = clamp((now - startTime) / duration, 0, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setDisplayed(lerp(0, stat.value, eased));
            if (p < 1) rafRef.current = requestAnimationFrame(animate);
          };
          rafRef.current = requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    io.observe(card);
    return () => {
      io.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [started, stat.value, stat.fill]);

  const displayStr = stat.decimal
    ? displayed.toFixed(1)
    : Math.round(displayed).toLocaleString();

  return (
    <div
      ref={cardRef}
      className="card stat-card"
      aria-label={`${stat.label}: ${stat.value}${stat.suffix}`}
    >
      <p className={`stat-value${stat.red ? ' red' : ''}`} aria-live="polite">
        {displayStr}
        <span style={{ color: stat.red ? 'var(--primary)' : undefined }}>
          {stat.suffix}
        </span>
      </p>
      <p className="stat-label">{stat.label}</p>
      <p style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.6rem',
        letterSpacing: '0.1em',
        color: 'var(--text-ghost)',
      }}>
        {stat.subLabel}
      </p>
      <div className="stat-bar" aria-hidden="true">
        <div
          ref={barRef}
          className="stat-bar-fill"
          style={{ width: started ? stat.fill : '0%' }}
        />
      </div>
    </div>
  );
}

export default function Stats() {
  return (
    <section
      id="stats"
      aria-labelledby="stats-heading"
      style={{ padding: 'var(--s20) 0' }}
    >
      <div className="section">
        <div style={{ textAlign: 'center', marginBottom: 'var(--s12)' }}>
          <p className="label" aria-hidden="true">Social Proof</p>
          <h2
            id="stats-heading"
            className="h2"
            style={{ marginTop: 'var(--s4)' }}
          >
            The numbers building up.
          </h2>
        </div>

        <div className="stats-inner">
          {STATS.map((s) => (
            <StatCard key={s.label} stat={s} />
          ))}
        </div>
      </div>
    </section>
  );
}
