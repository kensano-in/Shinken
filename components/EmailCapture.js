'use client';

import { useEffect, useRef, useState } from 'react';
import { isValidEmail, storage } from '@/lib/utils';

export default function EmailCapture() {
  const [email, setEmail]   = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (storage.get('sc_email')) setStatus('success');
  }, []);

  const submit = () => {
    const trimmed = email.trim();
    if (!isValidEmail(trimmed)) {
      setErrorMsg('Enter a valid email to continue.');
      setStatus('error');
      inputRef.current?.focus();
      setTimeout(() => setStatus('idle'), 1400);
      return;
    }
    setStatus('loading');
    setTimeout(() => {
      storage.set('sc_email', trimmed);
      setStatus('success');
    }, 900);
  };

  if (status === 'success') {
    return (
      <section id="waitlist" style={{ padding: 'var(--s24) 0' }}>
        <div className="section">
          <div className="capture-section">
            <div className="capture-inner">
              <div className="capture-success" role="status" aria-live="polite">
                <div className="capture-success-icon" aria-hidden="true">✓</div>
                <h2 className="capture-success-title">You&apos;re in the list.</h2>
                <p className="capture-success-sub">
                  Welcome to ShinChat. We&apos;ll reach out before launch with early access details.
                  Keep an eye on your inbox.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="waitlist"
      aria-labelledby="waitlist-heading"
      style={{ padding: 'var(--s24) 0' }}
    >
      <div className="section">
        <div className="capture-section">

          {/* background glow */}
          <div style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            width: 600, height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(232,64,63,0.08), transparent 70%)',
            filter: 'blur(40px)',
            pointerEvents: 'none',
            zIndex: 0,
          }} aria-hidden="true" />

          <div className="capture-inner" style={{ position: 'relative', zIndex: 1 }}>
            <p className="label" aria-hidden="true">Join the Waitlist</p>
            <h2 id="waitlist-heading" className="h2 capture-title" style={{ marginTop: 'var(--s4)' }}>
              Get in before everyone else.
            </h2>
            <p className="capture-sub">
              Founding members get lifetime perks — priority access, locked-in pricing,
              and direct input on what ShinChat becomes.
            </p>

            <div
              className={`capture-form${status === 'error' ? ' error' : ''}`}
              role="group"
              aria-label="Waitlist email form"
            >
              <input
                ref={inputRef}
                className="capture-input"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
                disabled={status === 'loading'}
                aria-label="Email address"
                aria-describedby={status === 'error' ? 'capture-error' : undefined}
                autoComplete="email"
              />
              <button
                className="btn btn-primary btn-lg"
                onClick={submit}
                disabled={status === 'loading'}
                aria-label="Join the ShinChat waitlist"
              >
                {status === 'loading' ? (
                  <>
                    <span aria-hidden="true" style={{
                      width: 16, height: 16,
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#fff',
                      borderRadius: '50%',
                      display: 'inline-block',
                      animation: 'spin 0.7s linear infinite',
                      flexShrink: 0,
                    }} />
                    Joining…
                  </>
                ) : 'Join Waitlist'}
              </button>
            </div>

            {status === 'error' && (
              <p
                id="capture-error"
                role="alert"
                style={{
                  color: 'var(--primary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.68rem',
                  letterSpacing: '0.1em',
                  marginTop: 'var(--s3)',
                }}
              >
                {errorMsg}
              </p>
            )}

            <p className="capture-trust">
              🔒 &nbsp;No spam · No selling · Unsubscribe anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
