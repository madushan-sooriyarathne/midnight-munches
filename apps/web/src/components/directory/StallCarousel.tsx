import { cn } from '@midnightmunches/ui';
import { type UIEvent, useRef, useState } from 'react';

import type { RankedStall } from '@/lib/stalls';

import { StallCard } from './StallCard';

// CSS scroll-snap does the swiping; JS only tracks which dot is lit.
export function StallCarousel({ stalls }: { stalls: RankedStall[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef<HTMLUListElement>(null);

  function handleScroll(event: UIEvent<HTMLUListElement>) {
    const track = event.currentTarget;
    // Peeking slides can't all snap to the start, so the end of the track lights the last dot.
    const isAtEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;
    const slideWidth = track.scrollWidth / stalls.length;
    setActiveIndex(isAtEnd ? stalls.length - 1 : Math.round(track.scrollLeft / slideWidth));
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <ul
        className="flex w-full snap-x snap-mandatory scroll-px-16 gap-16 overflow-x-auto px-16 [scrollbar-width:none] motion-safe:scroll-smooth"
        onScroll={handleScroll}
        ref={trackRef}
      >
        {stalls.map((entry) => (
          <li className="w-[85%] shrink-0 snap-start sm:w-[45%] lg:w-[30%]" key={entry.stall.id}>
            <StallCard {...entry} />
          </li>
        ))}
      </ul>

      <div className="flex">
        {stalls.map((entry, index) => (
          <button
            aria-current={index === activeIndex}
            aria-label={`Show ${entry.stall.name}`}
            className="flex size-[44px] items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bone-white"
            key={entry.stall.id}
            // No `behavior`: the track's CSS scroll-behavior applies, so reduced motion is honoured.
            onClick={() =>
              trackRef.current?.children[index]?.scrollIntoView({
                block: 'nearest',
                inline: 'start',
              })
            }
            type="button"
          >
            <span
              className={cn(
                'size-8 rounded-full bg-blush-highlight',
                index === activeIndex && 'bg-electric-red',
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
