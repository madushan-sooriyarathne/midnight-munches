import type { HTMLAttributes } from 'react';
import { cn } from '../../cn';

export interface CategoryBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Count shown inside the badge, e.g. the number of stalls in a category. */
  count: number;
}

/** 16px round counter that sits beside a category label. */
export function CategoryBadge({ count, className, ...props }: CategoryBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex size-[16px] items-center justify-center rounded-full bg-burgundy-stage font-body text-caption font-medium text-bone-white leading-none tracking-caption',
        className,
      )}
      {...props}
    >
      {count}
    </span>
  );
}
