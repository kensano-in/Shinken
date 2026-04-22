import './globals.css';

export const metadata = {
  title: 'Shinken Fun Games Universe',
  description: 'Real-time multiplayer web gaming platform with AI bots, ranking, rewards, and modular game architecture.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
