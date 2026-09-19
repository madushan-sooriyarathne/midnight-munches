'use client';

import 'leaflet/dist/leaflet.css';

import { SRI_LANKA_BOUNDS } from '@midnightmunches/types/submission';
import { divIcon, type LatLng, type Marker as LeafletMarker } from 'leaflet';
import { useEffect, useRef } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';

import type { Coords } from '@/lib/stalls';

type MapCoordinatePickerProps = {
  value: Coords | null;
  onChange: (coords: Coords) => void;
};

const COLOMBO: [number, number] = [6.9271, 79.8612];
const BOUNDS: [[number, number], [number, number]] = [
  [SRI_LANKA_BOUNDS.minLat, SRI_LANKA_BOUNDS.minLng],
  [SRI_LANKA_BOUNDS.maxLat, SRI_LANKA_BOUNDS.maxLng],
];

// A CSS pin instead of Leaflet's default PNG marker, whose image paths break once bundled.
// Rotated 24px square: the tip sits half a diagonal (~17px) below the centre.
const PIN = divIcon({
  className: '',
  html: '<span class="block size-24 rotate-45 rounded-full rounded-br-none border-2 border-bone-white bg-electric-red"></span>',
  iconSize: [24, 24],
  iconAnchor: [12, 29],
});

/** Loaded with `ssr: false` only: Leaflet touches `window` at import time. */
export function MapCoordinatePicker({ value, onChange }: MapCoordinatePickerProps) {
  const markerRef = useRef<LeafletMarker>(null);

  function handleDragEnd() {
    const marker = markerRef.current;
    if (marker) onChange(toCoords(marker.getLatLng()));
  }

  return (
    // NOTE: `isolate` keeps Leaflet's z-index 400+ panes under the sticky navbar.
    <div className="isolate h-[360px] border-2 border-bone-white">
      <MapContainer
        center={COLOMBO}
        className="size-full"
        maxBounds={BOUNDS}
        maxBoundsViscosity={1}
        minZoom={7}
        // Mid-form, the wheel should scroll the page, not zoom the map.
        scrollWheelZoom={false}
        zoom={13}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <DropPinOnClick onChange={onChange} />
        {value && (
          <>
            <Marker
              draggable
              eventHandlers={{ dragend: handleDragEnd }}
              icon={PIN}
              // The lat/lng inputs are the keyboard path; a focusable marker can't be moved.
              keyboard={false}
              position={[value.latitude, value.longitude]}
              ref={markerRef}
            />
            <KeepPinInView latitude={value.latitude} longitude={value.longitude} />
          </>
        )}
      </MapContainer>
    </div>
  );
}

function DropPinOnClick({ onChange }: Pick<MapCoordinatePickerProps, 'onChange'>) {
  useMapEvents({ click: (event) => onChange(toCoords(event.latlng)) });
  return null;
}

// Typed coordinates and "Use my location" move the pin from outside the map.
function KeepPinInView({ latitude, longitude }: Coords) {
  const map = useMap();

  useEffect(() => {
    if (!map.getBounds().contains([latitude, longitude])) map.panTo([latitude, longitude]);
  }, [map, latitude, longitude]);

  return null;
}

// 6 decimals is ~10 cm, finer than any phone GPS fix.
function toCoords({ lat, lng }: LatLng): Coords {
  return { latitude: Number(lat.toFixed(6)), longitude: Number(lng.toFixed(6)) };
}
