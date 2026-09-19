import { cn, getButtonClassName } from '@midnightmunches/ui';
import { ChevronDown, ChevronRight, Menu } from 'lucide-react';
import Link from 'next/link';

// NOTE: these routes are planned but not built yet; they 404 until their pages land.
const NAV_LINKS = [
  { href: '/spots', label: 'Spots' },
  { href: '/open-now', label: 'Open now' },
  { href: '/map', label: 'Map' },
] as const;

const VENDOR_LINKS = [
  { href: '/submit', label: 'List your spot' },
  { href: '/vendors/login', label: 'Vendor login' },
] as const;

const linkClassName =
  'inline-flex min-h-[44px] items-center gap-4 font-body text-body-sm leading-body-sm font-medium tracking-body-sm text-bone-white uppercase transition-colors hover:text-blush-highlight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bone-white';

const summaryClassName = cn(
  linkClassName,
  'cursor-pointer list-none [&::-webkit-details-marker]:hidden',
);

// ponytail: native <details> menus need no JS but don't close on outside click or client-side
// navigation; swap for a small client component with open state if that starts to bite.
export function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-butcher-black">
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-16 py-8 md:gap-16"
      >
        <Link
          className="font-display text-[22px] leading-subheading tracking-subheading whitespace-nowrap text-electric-red uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bone-white"
          href="/"
        >
          Midnight Munches
        </Link>

        <ul className="hidden items-center gap-24 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link className={linkClassName} href={link.href}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-8 md:gap-16">
          <details className="relative hidden md:block">
            <summary className={summaryClassName}>
              Vendors
              <ChevronDown aria-hidden="true" className="size-[14px]" strokeWidth={2} />
            </summary>
            <ul className="absolute top-full right-0 flex w-max flex-col rounded-cards bg-butcher-black px-16 pb-8">
              {VENDOR_LINKS.map((link) => (
                <li key={link.href}>
                  <Link className={linkClassName} href={link.href}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </details>

          <Link
            className={getButtonClassName('primary', 'whitespace-nowrap max-[359px]:hidden')}
            href="/spots"
          >
            Find food
            <ChevronRight aria-hidden="true" className="size-[14px]" strokeWidth={2} />
          </Link>

          {/* NOTE: not `relative`, so the panel anchors to the sticky header and spans its width. */}
          <details className="md:hidden">
            <summary
              aria-label="Menu"
              className={cn(summaryClassName, 'min-w-[44px] justify-center')}
            >
              <Menu aria-hidden="true" className="size-24" strokeWidth={2} />
            </summary>
            <ul className="absolute inset-x-0 top-full flex flex-col bg-butcher-black px-16 pb-16">
              {[...NAV_LINKS, ...VENDOR_LINKS].map((link) => (
                <li key={link.href}>
                  <Link className={linkClassName} href={link.href}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        </div>
      </nav>
    </header>
  );
}
