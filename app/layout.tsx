import type { Metadata } from 'next';
import { Playfair_Display, DM_Sans } from 'next/font/google';
import './globals.css';

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair-display',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans-variable',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Career Archetype Navigator | Dan\'s Career Corner',
  description:
    'Discover your career archetype. MBTI-powered career exploration that reveals your strengths, transferable skills, and best-fit career paths.',
  openGraph: {
    title: 'Career Archetype Navigator',
    description: 'MBTI-powered career exploration by Dan\'s Career Corner',
    siteName: "Dan's Career Corner",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfairDisplay.variable} ${dmSans.variable}`}
    >
      <body
        style={{
          fontFamily: 'var(--font-dm-sans-variable), system-ui, sans-serif',
          background: '#0F1C2E',
          color: '#F5EDD6',
          minHeight: '100vh',
        }}
      >
        {children}
      </body>
    </html>
  );
}
