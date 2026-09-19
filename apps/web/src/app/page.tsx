import { connection } from 'next/server';

import { DirectorySection } from '@/components/directory/DirectorySection';
import { Hero } from '@/components/hero/Hero';
import { getStalls } from '@/lib/dal/stalls';

export default async function HomePage() {
  // NOTE: render per request so open/closed status in the server HTML is current; the stall
  // fetch itself stays cached. ponytail: move to a static shell + Suspense if TTFB matters.
  await connection();
  const stalls = await getStalls();

  return (
    <main>
      <Hero />
      {stalls ? (
        <DirectorySection stalls={stalls} />
      ) : (
        <p className="px-16 py-64 text-center font-body text-body leading-body text-blush-highlight">
          Stalls didn't load. Refresh to try again.
        </p>
      )}
    </main>
  );
}
