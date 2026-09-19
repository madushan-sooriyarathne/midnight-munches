import { Card, getButtonClassName, StatusBadge } from '@midnightmunches/ui';
import { ChevronRight, MapPin, UtensilsCrossed } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import type { RankedStall } from '@/lib/stalls';

const orderLinkClassName =
  'inline-flex min-h-[44px] items-center font-body text-body-sm leading-body-sm font-medium tracking-body-sm text-blush-highlight uppercase transition-colors hover:text-bone-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bone-white';

export function StallCard({ stall, status, distanceKm }: RankedStall) {
  const cover = stall.media[0]?.url;
  const { ubereats, pickme } = stall.deliveryUrls ?? {};

  return (
    <Card className="flex h-full flex-col">
      {/* Square photo lands at roughly 60% of the card height with the content below. */}
      <div className="relative flex aspect-square items-center justify-center">
        {cover ? (
          // Decorative: the stall name sits directly below.
          <Image
            alt=""
            className="object-cover"
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 85vw"
            src={cover}
          />
        ) : (
          <UtensilsCrossed aria-hidden="true" className="size-40 text-blush-highlight" />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-12 p-16">
        <h3 className="font-display text-subheading leading-subheading tracking-subheading text-blush-highlight uppercase">
          {stall.name}
        </h3>

        <div className="flex flex-wrap items-center gap-8 font-body text-body-sm leading-body-sm tracking-body-sm text-bone-white">
          <StatusBadge
            label={status.status === 'OPENS_AT' ? `Opens at ${status.opensAt}` : undefined}
            open={status.status === 'OPEN_NOW'}
          />
          <span>
            {stall.district}
            {distanceKm !== null && ` · ${distanceKm.toFixed(1)} km`}
          </span>
        </div>

        {(stall.phone || ubereats || pickme) && (
          <ul className="flex flex-wrap gap-x-16">
            {stall.phone && (
              <li>
                <a
                  className={orderLinkClassName}
                  href={`tel:${stall.phone.replace(/[^\d+]/g, '')}`}
                >
                  Call
                </a>
              </li>
            )}
            {ubereats && (
              <li>
                <a
                  className={orderLinkClassName}
                  href={ubereats}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Uber Eats
                </a>
              </li>
            )}
            {pickme && (
              <li>
                <a
                  className={orderLinkClassName}
                  href={pickme}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  PickMe
                </a>
              </li>
            )}
          </ul>
        )}

        {/* flex-1: side by side when the card is wide enough, full-width stack when not. */}
        <div className="mt-auto flex flex-wrap gap-8">
          <Link
            className={getButtonClassName('primary', 'flex-1 whitespace-nowrap')}
            href={`/spots/${stall.slug}`}
          >
            Explore
            <ChevronRight aria-hidden="true" className="size-[14px]" strokeWidth={2} />
          </Link>
          <a
            className={getButtonClassName('location', 'flex-1 whitespace-nowrap')}
            href={`https://www.google.com/maps/dir/?api=1&destination=${stall.latitude},${stall.longitude}`}
            rel="noopener noreferrer"
            target="_blank"
          >
            <MapPin aria-hidden="true" className="size-[14px]" strokeWidth={2} />
            Directions
          </a>
        </div>
      </div>
    </Card>
  );
}
