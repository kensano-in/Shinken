'use client';

import { useEffect, useState } from 'react';
import NavBar from '@/components/platform/NavBar';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetch('/api/profile?username=Guest_One').then((r) => r.json()).then(setProfile);
  }, []);

  if (!profile) return <main className="app-wrap"><NavBar /><section className="game-shell">Loading profile...</section></main>;

  return (
    <main className="app-wrap">
      <NavBar />
      <section className="game-shell">
        <h1>{profile.avatar} {profile.username}</h1>
        <p>Level {profile.level} • XP {profile.xp} • Rating {profile.rating}</p>
        <p>W/L: {profile.wins}/{profile.losses} • Achievements: {profile.achievements.join(', ')}</p>
      </section>
    </main>
  );
}
