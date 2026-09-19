import { useSearchParams } from 'next/navigation';

import { type Filters, parseFilters } from '@/lib/stalls';

/** Directory filters, stored in the URL so any filtered view is shareable. */
export function useStallFilters() {
  const searchParams = useSearchParams();
  const filters = parseFilters(searchParams);

  function setFilter<Key extends keyof Filters>(key: Key, value: Filters[Key]) {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    replaceQuery(params.toString());
  }

  return { filters, setFilter, clearFilters: () => replaceQuery('') };
}

// Next keeps useSearchParams in sync with the History API, so this skips a server round trip,
// and replace (not push) keeps every pill tap out of the back stack.
function replaceQuery(query: string) {
  window.history.replaceState(null, '', query ? `?${query}` : window.location.pathname);
}
