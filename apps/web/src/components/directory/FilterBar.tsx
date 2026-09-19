import { FilterPill } from '@midnightmunches/ui';
import { LocateFixed } from 'lucide-react';

import type { GeolocationState, useGeolocation } from '@/hooks/useGeolocation';
import type { useStallFilters } from '@/hooks/useStallFilters';
import type { Filters, Platform } from '@/lib/stalls';

type FilterBarProps = {
  filters: Filters;
  onFilterChange: ReturnType<typeof useStallFilters>['setFilter'];
  /** [slug, label] pairs, e.g. ['colombo-03', 'Colombo 03']. */
  areas: [string, string][];
  geo: ReturnType<typeof useGeolocation>;
};

const PLATFORM_PILLS: { value: Platform; label: string }[] = [
  { value: 'ubereats', label: 'Uber Eats' },
  { value: 'pickme', label: 'PickMe' },
];

const GEO_MESSAGES: Record<GeolocationState['status'], string> = {
  idle: '',
  pending: 'Finding you…',
  granted: 'Sorted nearest first.',
  denied: 'Location is blocked. Allow it in your browser settings to sort by distance.',
  unavailable: "Couldn't get your location. Showing every spot instead.",
};

export function FilterBar({ filters, onFilterChange, areas, geo }: FilterBarProps) {
  const isNearMe = geo.state.status === 'granted';

  return (
    <div className="flex flex-col items-center gap-8 px-16">
      <div className="flex flex-wrap items-center justify-center gap-[6px]">
        <FilterPill
          active={Boolean(filters.open)}
          className="min-h-[44px]"
          onClick={() => onFilterChange('open', filters.open ? undefined : '1')}
        >
          Open now
        </FilterPill>

        {PLATFORM_PILLS.map(({ value, label }) => (
          <FilterPill
            active={filters.platform === value}
            className="min-h-[44px]"
            key={value}
            onClick={() =>
              onFilterChange('platform', filters.platform === value ? undefined : value)
            }
          >
            {label}
          </FilterPill>
        ))}

        <FilterPill
          active={isNearMe}
          className="min-h-[44px] gap-[6px]"
          disabled={geo.state.status === 'pending'}
          onClick={isNearMe ? geo.clear : geo.request}
        >
          <LocateFixed aria-hidden="true" className="size-[14px]" strokeWidth={2} />
          Near me
        </FilterPill>

        <label className="sr-only" htmlFor="area-filter">
          Area
        </label>
        <select
          className="min-h-[44px] rounded-toggles border border-butcher-black bg-velvet-wine px-[16px] py-[10px] font-body text-body-sm leading-[18px] font-medium tracking-body-sm text-bone-white uppercase [color-scheme:dark] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bone-white"
          id="area-filter"
          onChange={(event) => onFilterChange('area', event.target.value || undefined)}
          value={filters.area ?? ''}
        >
          <option value="">All areas</option>
          {areas.map(([slug, label]) => (
            <option key={slug} value={slug}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <p aria-live="polite" className="font-body text-body-sm leading-body-sm text-blush-highlight">
        {GEO_MESSAGES[geo.state.status]}
      </p>
    </div>
  );
}
