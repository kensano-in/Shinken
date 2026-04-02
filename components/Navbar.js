'use client';

import { useEffect, useState } from 'react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`} aria-label="Primary navigation">
      <div className="navbar-inner">

        {/* Logo */}
        <a href="#hero" className="nav-logo" aria-label="ShinChat home">
          Shin<span>Chat</span>
        </a>

        {/* Center links */}
        <div className="nav-links" role="list">
          <button
            className="nav-link"
            onClick={() => scrollTo('features')}
            aria-label="Go to features"
          >
            Features
          </button>
          <button
            className="nav-link"
            onClick={() => scrollTo('aidemo')}
            aria-label="See AI demo"
          >
            AI Demo
          </button>
          <button
            className="nav-link"
            onClick={() => scrollTo('contact')}
            aria-label="Contact"
          >
            Contact
          </button>
        </div>

        {/* Right — status + CTA */}
        <div className="nav-right">
          <span className="badge badge-online" aria-label="System status: online">
            <span className="status-dot" aria-hidden="true" />
            System Online
          </span>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => scrollTo('waitlist')}
            aria-label="Join the waitlist"
          >
            Get Access
          </button>
        </div>

      </div>
    </nav>
  );
}
