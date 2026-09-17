'use client';

import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../cn';

export interface FilterPillProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

const base =
  'inline-flex items-center justify-center rounded-toggles px-[16px] py-[10px] font-body text-body-sm leading-[18px] font-medium tracking-body-sm uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bone-white disabled:cursor-not-allowed disabled:opacity-50';

export function FilterPill({ active = false, className, children, ...props }: FilterPillProps) {
  return (
    <button
      aria-pressed={active}
      className={cn(
        base,
        active
          ? 'bg-electric-red text-bone-white'
          : 'bg-transparent text-blush-highlight hover:text-bone-white',
        className,
      )}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}
