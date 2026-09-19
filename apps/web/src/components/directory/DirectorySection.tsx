'use client';

import { getButtonClassName } from '@midnightmunches/ui';

import { useGeolocation } from '@/hooks/useGeolocation';
import { useStallFilters } from '@/hooks/useStallFilters';
import type { Stall } from '@/lib/dal/stalls';
import { matchesFilters, rankStalls, toSlug } from '@/lib/stalls';

import { CategoryTabs } from './CategoryTabs';
import { FilterBar } from './FilterBar';
import { StallCard } from './StallCard';
import { StallCarousel } from './StallCarousel';

// Six dots at 44px still fit a 320px viewport.
const CAROUSEL_LIMIT = 6;

// NOTE: 20px bold so red-on-wine (3.8:1) qualifies as large text, same as the hero eyebrow.
const eyebrowClassName =
  'font-body text-[20px] leading-body font-bold tracking-body-sm text-electric-red uppercase';
const headingClassName =
  'font-display text-heading leading-heading tracking-heading-lg text-electric-red uppercase md:text-heading-lg md:leading-heading-lg';

export function DirectorySection({ stalls }: { stalls: Stall[] }) {
  const { filters, setFilter, clearFilters } = useStallFilters();
  const geo = useGeolocation();

  const ranked = rankStalls(stalls, geo.state.status === 'granted' ? geo.state.coords : null);
  const results = ranked.filter((entry) => matchesFilters(entry, filters));
  const openNow = ranked
    .filter((entry) => entry.status.status === 'OPEN_NOW')
    .slice(0, CAROUSEL_LIMIT);
  const areas = [...new Map(stalls.map((stall) => [toSlug(stall.district), stall.district]))].sort(
    ([a], [b]) => a.localeCompare(b),
  );

  return (
    <>
      {openNow.length > 0 && (
        <section
          aria-labelledby="open-now-heading"
          className="mx-auto flex max-w-7xl flex-col gap-32 py-64"
        >
          <div className="flex flex-col items-center gap-16 px-16 text-center">
            <p className={eyebrowClassName}>
              <span aria-hidden="true">◂</span> Open right now <span aria-hidden="true">▸</span>
            </p>
            <h2 className={headingClassName} id="open-now-heading">
              Still frying
            </h2>
          </div>
          <StallCarousel stalls={openNow} />
        </section>
      )}

      <section
        aria-labelledby="spots-heading"
        className="mx-auto flex max-w-7xl flex-col gap-32 py-64"
        id="spots"
      >
        <div className="flex flex-col items-center gap-16 px-16 text-center">
          <p className={eyebrowClassName}>
            <span aria-hidden="true">◂</span> Find your fix <span aria-hidden="true">▸</span>
          </p>
          <h2 className={headingClassName} id="spots-heading">
            The spots
          </h2>
        </div>

        <FilterBar areas={areas} filters={filters} geo={geo} onFilterChange={setFilter} />
        <CategoryTabs
          active={filters.category}
          getCount={(category) =>
            ranked.filter((entry) => matchesFilters(entry, { ...filters, category })).length
          }
          onSelect={(category) => setFilter('category', category)}
        />

        <p
          aria-live="polite"
          className="px-16 text-center font-body text-body-sm leading-body-sm tracking-body-sm text-bone-white"
        >
          {results.length} {results.length === 1 ? 'spot' : 'spots'}
        </p>

        {results.length > 0 ? (
          <ul className="grid grid-cols-1 gap-16 px-16 sm:grid-cols-2 lg:grid-cols-4">
            {results.map((entry) => (
              <li key={entry.stall.id}>
                <StallCard {...entry} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-16 px-16 text-center">
            <p className="font-body text-body leading-body text-blush-highlight">
              No spots match these filters.
            </p>
            <button className={getButtonClassName('ghost')} onClick={clearFilters} type="button">
              Clear filters
            </button>
          </div>
        )}
      </section>
    </>
  );
}
