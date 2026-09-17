import type { HTMLAttributes } from 'react';
import { cn } from '../../cn';

export interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Live trading state of the stall. */
  open: boolean;
  /** Overrides the default 'OPEN NOW' / 'CLOSED' copy. */
  label?: string;
}

/** Solid-fill, zero-shadow indicator for a stall's real-time status. */
export function StatusBadge({ open, label, className, ...props }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-toggles px-[12px] py-[4px] font-body text-caption font-medium uppercase tracking-caption',
        open
          ? 'bg-electric-red text-bone-white'
          : 'border border-butcher-black bg-burgundy-stage text-blush-highlight',
        className,
      )}
      role="status"
      {...props}
    >
      {label ?? (open ? 'Open now' : 'Closed')}
    </span>
  );
}
