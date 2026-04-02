'use client';

import { useEffect, useRef, useState } from 'react';
import { pad } from '@/lib/utils';
import { isValidEmail, storage } from '@/lib/utils';

/* ── Launch target date ─────────────────────────────────────── */
const LAUNCH_DATE = new Date('2026-09-01T00:00:00');

/* ── Countdown hook ─────────────────────────────────────────── */
function useCountdown(target) {
  const [time, setTime] = useState({ d: '--', h: '--', m: '--', s: '--' });
  const [ticking, setTicking] = useState(null); // which unit ticked

  useEffect(() => {
    const update = () => {
      const diff = target - Date.now();
      if (diff <= 0) {
        setTime({ d: '00', h: '00', m: '00', s: '00' });
        return;
      }
      const newS = pad(Math.floor((diff % 60000) / 1000));
      setTime(prev => {
        if (prev.s !== newS) setTicking('s');
        setTimeout(() => setTicking(null), 160);
        return {
          d: pad(Math.floor(diff / 86400000)),
          h: pad(Math.floor((diff % 86400000) / 3600000)),
          m: pad(Math.floor((diff % 3600000) / 60000)),
          s: newS,
        };
      });
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [target]);

  return { time, ticking };
}

/* ── Email form hook ─────────────────────────────────────────── */
function useEmailForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');

  // Restore from storage
  useEffect(() => {
    if (storage.get('sc_email')) setStatus('success');
  }, []);

  const submit = () => {
    const trimmed = email.trim();
    if (!isValidEmail(trimmed)) {
      setErrorMsg('Please enter a valid email.');
      setStatus('error');
      setTimeout(() => setStatus('idle'), 1200);
      return;
    }
    setStatus('loading');
    // Simulate async submit
    setTimeout(() => {
      storage.set('sc_email', trimmed);
      setStatus('success');
      setEmail('');
    }, 900);
  };

  return { email, setEmail, status, errorMsg, submit };
}

/* ── Countdown block ────────────────────────────────────────── */
function CdBlock({ value, label, tick }) {
  return (
    <div className="cd-block" aria-label={`${value} ${label}`}>
      <span className={`cd-num${tick ? ' tick' : ''}`} aria-live="polite">{value}</span>
      <span className="cd-label">{label}</span>
    </div>
  );
}

/* ── Hero component ─────────────────────────────────────────── */
export default function Hero() {
  const { time } = useCountdown(LAUNCH_DATE);
  const { email, setEmail, status, errorMsg, submit } = useEmailForm();
  const inputRef = useRef(null);

  const handleKey = (e) => {
    if (e.key === 'Enter') submit();
  };

  return (
    <section id="hero" className="hero" aria-label="Hero — ShinChat coming soon">

      {/* Background layers */}
      <div className="hero-bg"    aria-hidden="true" />
      <div className="hero-grid"  aria-hidden="true" />
      <div className="hero-noise" aria-hidden="true" />

      {/* Content */}
      <div className="hero-content">

        {/* Label */}
        <div className="label hero-label" aria-label="Product status">
          AI-Powered Chat · Coming Soon
        </div>

        {/* Headline */}
        <h1 className="h1 hero-title">
          The future of<br />
          <span className="hero-line-2">conversation.</span>
        </h1>

        {/* Subtitle */}
        <p className="hero-sub">
          <strong>ShinChat</strong> brings AI intelligence inside every conversation.
          Real-time, private, and built for the generation that never stops talking.
        </p>

        {/* Countdown */}
        <div
          className="countdown-wrap"
          role="timer"
          aria-label="Countdown to launch"
        >
          <CdBlock value={time.d} label="Days"    />
          <span className="cd-sep" aria-hidden="true">:</span>
          <CdBlock value={time.h} label="Hours"   />
          <span className="cd-sep" aria-hidden="true">:</span>
          <CdBlock value={time.m} label="Minutes" />
          <span className="cd-sep" aria-hidden="true">:</span>
          <CdBlock value={time.s} label="Seconds" />
        </div>

        {/* Email form */}
        {status === 'success' ? (
          <p className="hero-success-msg" role="status">
            ✓&nbsp;&nbsp;You&apos;re in. Welcome to ShinChat — we&apos;ll reach out before launch.
          </p>
        ) : (
          <div
            className="hero-form-wrap"
            role="group"
            aria-label="Email waitlist signup"
          >
            <div className={`hero-input-row${status === 'error' ? ' error' : ''}`}>
              <input
                ref={inputRef}
                className="hero-email-input"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKey}
                disabled={status === 'loading'}
                aria-label="Email address"
                autoComplete="email"
                spellCheck={false}
              />
              <button
                className="btn btn-primary"
                onClick={submit}
                disabled={status === 'loading'}
                aria-label="Join the waitlist"
              >
                {status === 'loading' ? (
                  <span aria-hidden="true" style={{
                    width: 16, height: 16,
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    display: 'inline-block',
                    animation: 'spin 0.7s linear infinite',
                  }} />
                ) : 'Get Early Access'}
              </button>
            </div>
            {status === 'error' && (
              <p style={{ color: 'var(--primary)', fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }} role="alert">
                {errorMsg}
              </p>
            )}
            <p className="hero-cta-hint">
              <span className="status-dot" style={{ width: 5, height: 5 }} aria-hidden="true" />
              No spam. No selling. Just early access.
            </p>
          </div>
        )}

      </div>
    </section>
  );
}
