import type { Metadata } from 'next';
import { Bebas_Neue, Hubot_Sans } from 'next/font/google';
import type { ReactNode } from 'react';

import { Navbar } from '@/components/layout/Navbar';

import './globals.css';

const bebasNeue = Bebas_Neue({ weight: '400', subsets: ['latin'], variable: '--font-bebas-neue' });
const hubotSans = Hubot_Sans({ subsets: ['latin'], variable: '--font-hubot-sans' });

export const metadata: Metadata = {
  title: 'Midnight Munches',
  description: 'Late-night food, delivered across Sri Lanka.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // NOTE: font vars must sit on <html>: the theme tokens referencing them resolve on :root.
    <html className={`${bebasNeue.variable} ${hubotSans.variable}`} lang="en">
      <body className="bg-velvet-wine text-bone-white font-body antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
