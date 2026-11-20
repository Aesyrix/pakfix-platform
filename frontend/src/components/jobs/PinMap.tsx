'use client';

import 'leaflet/dist/leaflet.css';
import type { Map as LeafletMap } from 'leaflet';
import { LocateFixed, MapPin } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils/cn';

export interface LatLng {
  lat: number;
  lng: number;
}

/**
 * A map with a pin fixed in the middle, like the app's PinMap: people move
 * the map, not the pin, and `onSettled` gets the pin's position each time
 * the map stops. Leaflet with OpenStreetMap tiles, credited on the map.
 * Leaflet is loaded in the browser only, so the static build never touches it.
 */
export function PinMap({
  center,
  onSettled,
  onMyLocation,
  locating = false,
  myLocationLabel,
  attribution,
  moveTo,
  className,
}: {
  /** Where the map starts. */
  center: LatLng;
  onSettled: (at: LatLng) => void;
  onMyLocation?: () => void;
  locating?: boolean;
  myLocationLabel: string;
  attribution: string;
  /** Change it to move the map there (e.g. after "My location"). */
  moveTo?: LatLng | null;
  className?: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const settled = useRef(onSettled);
  const [moving, setMoving] = useState(false);

  useEffect(() => {
    settled.current = onSettled;
  }, [onSettled]);

  // Create the map once.
  useEffect(() => {
    let cancelled = false;
    void import('leaflet').then((L) => {
      if (cancelled || !box.current || map.current) return;
      const m = L.map(box.current, { zoomControl: true, attributionControl: true }).setView([center.lat, center.lng], 16);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: `<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">${attribution}</a>`,
      }).addTo(m);
      m.attributionControl.setPrefix(false);
      m.on('movestart', () => setMoving(true));
      m.on('moveend', () => {
        setMoving(false);
        const c = m.getCenter();
        settled.current({ lat: c.lat, lng: c.lng });
      });
      map.current = m;
      settled.current(center);
    });
    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
    };
    // The start position and credit are read once; later moves use `moveTo`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (moveTo && map.current) map.current.setView([moveTo.lat, moveTo.lng], 17);
  }, [moveTo]);

  return (
    <div className={cn('relative isolate overflow-hidden rounded-2xl border border-line', className)}>
      <div ref={box} className="h-full w-full" />
      {/* The pin, its tip on the map's centre; it lifts while the map moves. */}
      <MapPin
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute start-1/2 top-1/2 z-[500] h-11 w-11 -translate-x-1/2 fill-brand-600 text-white drop-shadow-md transition-transform rtl:translate-x-1/2',
          moving ? '-translate-y-[120%]' : '-translate-y-full'
        )}
      />
      {onMyLocation ? (
        <button
          type="button"
          onClick={onMyLocation}
          disabled={locating}
          aria-label={myLocationLabel}
          title={myLocationLabel}
          className="absolute bottom-8 end-3 z-[500] flex h-11 w-11 items-center justify-center rounded-full bg-surface text-brand-700 shadow-md disabled:opacity-60"
        >
          <LocateFixed className={cn('h-5 w-5', locating && 'animate-pulse')} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
