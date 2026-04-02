/* Server component */

const SOCIALS = [
  {
    label: 'X (Twitter)',
    href: 'https://x.com/Shinichirofr',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width={14} height={14} aria-hidden="true">
        <path d="M13.94 10.54 20.56 3h-1.57l-5.73 6.47L8.4 3H3l6.95 9.86L3 21h1.57l6.08-6.87L15.6 21H21l-7.06-10.46zm-2.15 2.43-.7-1L5.15 4.2h2.4l4.52 6.43.7 1 5.88 8.37h-2.4l-4.56-6.47-.9-.01z"/>
      </svg>
    ),
    handle: '@Shinichirofr',
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com/shinichiro.2',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}
           strokeLinecap="round" strokeLinejoin="round" width={14} height={14} aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5"/>
        <circle cx="12" cy="12" r="4.5"/>
        <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none"/>
      </svg>
    ),
    handle: '@shinichiro.2',
  },
  {
    label: 'Telegram',
    href: 'https://t.me/Shinichirofr',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}
           strokeLinecap="round" strokeLinejoin="round" width={14} height={14} aria-hidden="true">
        <path d="M21.5 2.5L2.5 9.75l6.25 2.5L21.5 2.5z"/>
        <path d="M8.75 12.25L11.5 21.5l3.25-5"/>
        <path d="M8.75 12.25l12.75-9.75"/>
      </svg>
    ),
    handle: '@Shinichirofr',
  },
  {
    label: 'Email',
    href: 'mailto:admin@kensano.in',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}
           strokeLinecap="round" strokeLinejoin="round" width={14} height={14} aria-hidden="true">
        <rect x="2" y="4" width="20" height="16" rx="3"/>
        <polyline points="2,4 12,13 22,4"/>
      </svg>
    ),
    handle: 'admin@kensano.in',
  },
];

export default function Footer() {
  return (
    <footer id="contact" className="footer" role="contentinfo">
      <div className="footer-inner">

        {/* Brand */}
        <div className="footer-brand">
          <div className="nav-logo">
            Shin<span style={{ color: 'var(--primary)' }}>Chat</span>
          </div>
          <p className="footer-tagline">Intelligent conversation. Coming soon.</p>
        </div>

        {/* Social links */}
        <nav className="footer-links" aria-label="Social media links">
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              className="footer-link"
              target={s.href.startsWith('mailto') ? undefined : '_blank'}
              rel={s.href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
              aria-label={`${s.label}: ${s.handle}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              {s.icon}
              {s.handle}
            </a>
          ))}
        </nav>

        {/* Copyright */}
        <div className="footer-copy">
          <p>© 2026 Shinken. All rights reserved.</p>
          <p style={{ marginTop: 4, display: 'flex', gap: 'var(--s4)', justifyContent: 'flex-end' }}>
            <a href="#" className="footer-link">Privacy</a>
            <a href="#" className="footer-link">Terms</a>
          </p>
        </div>

      </div>
    </footer>
  );
}
