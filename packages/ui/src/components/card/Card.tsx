import type { HTMLAttributes } from 'react';
import { cn } from '../../cn';

export type CardVariant = 'standard' | 'feature';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

/* Depth comes from the surface step (#260212 canvas -> #4f0423 card) plus a black
   hairline border. No shadows, glows, or gradients anywhere in this system. */
const variants: Record<CardVariant, string> = {
  standard: 'rounded-cards',
  feature: 'rounded-feature-cards',
};

export function Card({ variant = 'standard', className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'overflow-hidden border border-butcher-black bg-burgundy-stage font-body text-bone-white',
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('px-[24px] pt-[24px] pb-[16px]', className)} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('px-[24px] py-[16px]', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center gap-[8px] px-[24px] pt-[16px] pb-[24px]', className)}
      {...props}
    >
      {children}
    </div>
  );
}
