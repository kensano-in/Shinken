/* Server component — no 'use client' needed */

const FEATURES = [
  {
    icon: '⚡',
    name: 'Real-Time Chat',
    desc: 'Messages delivered in under 50ms globally via a distributed edge network. No lag. Ever.',
    chip: 'Core Engine',
  },
  {
    icon: '🤖',
    name: 'AI Inside Conversations',
    desc: 'Get instant summaries, smart replies, and context-aware suggestions — without leaving your chat.',
    chip: 'Intelligence Layer',
  },
  {
    icon: '🔐',
    name: 'Privacy by Design',
    desc: 'End-to-end encrypted by default. Zero data sold. Zero backdoors. Your conversations are yours.',
    chip: 'Security',
  },
  {
    icon: '🌐',
    name: 'Global Infrastructure',
    desc: 'Deployed across 30+ edge regions. Sub-100ms anywhere on the planet. Built to scale to millions.',
    chip: 'Infrastructure',
  },
  {
    icon: '📱',
    name: 'Every Platform',
    desc: 'Native iOS, Android, and a blazing-fast Progressive Web App. One account. Every device.',
    chip: 'Cross-Platform',
  },
  {
    icon: '🎨',
    name: 'Built for You',
    desc: 'Fully customizable spaces. Themes, layouts, and AI personas that adapt to how you communicate.',
    chip: 'Experience',
  },
];

export default function Features() {
  return (
    <section id="features" aria-labelledby="features-heading" style={{ padding: 'var(--s24) 0' }}>
      <div className="section">

        {/* Header */}
        <div className="features-header">
          <p className="label" aria-hidden="true">What&apos;s Inside</p>
          <h2 id="features-heading" className="h2" style={{ marginTop: 'var(--s4)' }}>
            Engineered different.
          </h2>
          <p style={{
            color: 'var(--text-muted)',
            fontWeight: 300,
            fontSize: '0.95rem',
            maxWidth: 500,
            margin: 'var(--s4) auto 0',
            lineHeight: 1.7,
          }}>
            Every feature exists for a reason. No bloat. No filler.
            Just the tools that make communication feel like the future.
          </p>
        </div>

        {/* Grid */}
        <div className="features-grid" role="list">
          {FEATURES.map((f) => (
            <article
              key={f.name}
              className="card feature-card"
              role="listitem"
              aria-label={f.name}
            >
              <div className="feature-icon-wrap" aria-hidden="true">{f.icon}</div>
              <h3 className="h3 feature-name">{f.name}</h3>
              <p className="feature-desc">{f.desc}</p>
              <span className="feature-chip" aria-label={`Category: ${f.chip}`}>{f.chip}</span>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}
