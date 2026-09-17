import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Midnight Munches Dashboard',
  description: 'Operations console for Midnight Munches outlets.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-butcher-black text-bone-white font-body antialiased">{children}</body>
    </html>
  );
}
