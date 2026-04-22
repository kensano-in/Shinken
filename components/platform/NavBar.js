import Link from 'next/link';

const links = [
  ['Home', '/'],
  ['Lobby', '/lobby'],
  ['Leaderboard', '/leaderboard'],
  ['Profile', '/profile'],
];

export default function NavBar() {
  return (
    <header className="topbar">
      <div className="brand">Shinken • Fun Games Universe</div>
      <nav>
        {links.map(([label, href]) => (
          <Link key={href} href={href} className="toplink">{label}</Link>
        ))}
      </nav>
    </header>
  );
}
