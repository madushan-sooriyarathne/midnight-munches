import { cn } from '../../cn';

export type ButtonVariant = 'primary' | 'ghost' | 'location';

/* Flat by design: colour contrast carries hierarchy, never elevation. */
const base =
  'inline-flex items-center justify-center gap-[6px] rounded-buttons px-[14px] py-[10px] font-body text-body-sm leading-[18px] font-medium tracking-body-sm uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bone-white disabled:cursor-not-allowed disabled:opacity-50';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-electric-red text-bone-white hover:bg-electric-red/90',
  ghost: 'border border-bone-white bg-transparent text-bone-white hover:bg-bone-white/10',
  location: 'border border-bone-white bg-transparent text-bone-white hover:bg-bone-white/10',
};

/**
 * Button styles for elements that must not be a `<button>`, e.g. a `next/link` CTA.
 * Lives outside `Button.tsx` because that module is `'use client'`, so its exports can't be
 * called from Server Components.
 */
export function getButtonClassName(variant: ButtonVariant = 'primary', className?: string): string {
  return cn(base, variants[variant], className);
}
