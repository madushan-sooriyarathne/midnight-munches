import { useState } from 'react';

import type { Coords } from '@/lib/stalls';

export type GeolocationState =
  | { status: 'idle' | 'pending' | 'denied' | 'unavailable' }
  | { status: 'granted'; coords: Coords };

/** Browser geolocation on demand; call `request` from a user action, never on page load. */
export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({ status: 'idle' });

  function request() {
    if (!('geolocation' in navigator)) {
      setState({ status: 'unavailable' });
      return;
    }

    setState({ status: 'pending' });
    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        setState({
          status: 'granted',
          coords: { latitude: coords.latitude, longitude: coords.longitude },
        }),
      (error) =>
        setState({ status: error.code === error.PERMISSION_DENIED ? 'denied' : 'unavailable' }),
      // City-level accuracy is plenty for sorting stalls, and a 5 min old fix saves battery.
      { timeout: 10_000, maximumAge: 300_000 },
    );
  }

  return { state, request, clear: () => setState({ status: 'idle' }) };
}
