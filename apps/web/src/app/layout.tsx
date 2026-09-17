import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Midnight Munches',
  description: 'Late-night food, delivered across Sri Lanka.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-velvet-wine text-bone-white font-body antialiased">{children}</body>
    </html>
  );
}
