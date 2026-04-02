import { Syne, DM_Mono, Inter } from 'next/font/google';
import './globals.css';

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-head',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const dmMono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['300', '400', '500'],
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300', '400', '500', '600'],
  display: 'swap',
});

export const metadata = {
  title: 'ShinChat — AI-Powered Chat is Coming',
  description:
    'The next-generation AI communication platform. Real-time chat with intelligence built in. Fast, private, and designed for humans. Join the waitlist.',
  keywords: ['ShinChat', 'AI chat', 'Shinken', 'messaging', 'AI platform', 'real-time chat'],
  authors: [{ name: 'Shinken', url: 'https://shinken.in' }],
  creator: 'Shinken',
  metadataBase: new URL('https://shinken.in'),
  openGraph: {
    title: 'ShinChat — AI-Powered Chat is Coming',
    description: 'The next-generation AI communication platform. Join the waitlist.',
    url: 'https://shinken.in',
    siteName: 'ShinChat by Shinken',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@Shinichirofr',
    creator: '@Shinichirofr',
    title: 'ShinChat — Coming Soon',
    description: 'AI-powered chat. Real-time. Private. Intelligent.',
  },
  robots: {
    index: true,
    follow: true,
  },
  themeColor: '#06060a',
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${syne.variable} ${dmMono.variable} ${inter.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>{children}</body>
    </html>
  );
}
