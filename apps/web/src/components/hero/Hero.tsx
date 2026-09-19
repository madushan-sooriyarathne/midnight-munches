import { cn, getButtonClassName } from '@midnightmunches/ui';
import { ChevronRight, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import burger from './images/burger.webp';
import flatbread from './images/flatbread.webp';
import friedChicken from './images/fried-chicken.webp';

// NOTE: placeholder Unsplash shots (Unsplash License) until real stall photography lands.
// Masks are deliberately rough, asymmetric polygons — between a blob and a hexagon, per DESIGN.md.
const HERO_IMAGES = [
  {
    src: flatbread,
    clipPath:
      'polygon(8% 12%, 38% 0%, 72% 6%, 96% 24%, 100% 58%, 84% 88%, 52% 100%, 20% 92%, 2% 68%, 0% 34%)',
    className: 'top-16 -left-32 -rotate-6 md:top-[18%] md:left-[2%]',
  },
  {
    src: burger,
    clipPath:
      'polygon(14% 4%, 58% 0%, 90% 14%, 100% 46%, 92% 80%, 62% 96%, 28% 100%, 6% 82%, 0% 48%)',
    className: '-right-32 bottom-16 rotate-3 md:right-[3%] md:bottom-[8%]',
  },
  {
    src: friedChicken,
    clipPath:
      'polygon(22% 0%, 66% 8%, 94% 2%, 100% 40%, 88% 70%, 96% 96%, 50% 100%, 12% 90%, 0% 60%, 10% 28%)',
    className: 'hidden rotate-6 md:top-[4%] md:right-[8%] md:block',
  },
] as const;

export function Hero() {
  return (
    // NOTE: overflow-x-clip (not hidden) trims off-edge masks without creating a scroll container.
    <section className="relative overflow-x-clip">
      {HERO_IMAGES.map((image) => (
        <div
          aria-hidden="true"
          className={cn('absolute aspect-[4/5] w-[clamp(6rem,16vw,13rem)]', image.className)}
          key={image.src.src}
          style={{ clipPath: image.clipPath }}
        >
          <Image
            alt=""
            className="object-cover"
            fill
            loading="eager"
            sizes="13rem"
            src={image.src}
          />
        </div>
      ))}

      <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-24 px-16 py-100 text-center md:py-148">
        {/* NOTE: 20px bold so red-on-wine (3.8:1) qualifies as large text for WCAG contrast. */}
        <p className="font-body text-[20px] leading-body font-bold tracking-body-sm text-electric-red uppercase">
          <span aria-hidden="true">◂</span> Cravings at 2am <span aria-hidden="true">▸</span>
        </p>

        <h1 className="font-display text-display leading-display tracking-display text-electric-red uppercase">
          <span className="block">Kottu</span>
          <span className="block">(at 2am)</span>
        </h1>

        <div className="flex flex-wrap justify-center gap-8">
          <Link className={getButtonClassName('primary')} href="/spots">
            Explore spots
            <ChevronRight aria-hidden="true" className="size-[14px]" strokeWidth={2} />
          </Link>
          <Link className={getButtonClassName('location')} href="/map">
            <MapPin aria-hidden="true" className="size-[14px]" strokeWidth={2} />
            Get directions
          </Link>
        </div>
      </div>
    </section>
  );
}
