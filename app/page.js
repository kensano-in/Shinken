import Navbar        from '@/components/Navbar';
import Hero          from '@/components/Hero';
import Features      from '@/components/Features';
import AIDemo        from '@/components/AIDemo';
import Stats         from '@/components/Stats';
import EmailCapture  from '@/components/EmailCapture';
import Footer        from '@/components/Footer';

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Features />
      <AIDemo />
      <Stats />
      <EmailCapture />
      <Footer />
    </main>
  );
}
