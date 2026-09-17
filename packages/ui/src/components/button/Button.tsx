'use client';

import { ChevronRight, MapPin } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../cn';

export type ButtonVariant = 'primary' | 'ghost' | 'location';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  /** Replaces the variant's default glyph. Pass `null` to render no icon at all. */
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

/* Flat by design: colour contrast carries hierarchy, never elevation. */
const base =
  'inline-flex items-center justify-center gap-[6px] rounded-buttons px-[14px] py-[10px] font-body text-body-sm leading-[18px] font-medium tracking-body-sm uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bone-white disabled:cursor-not-allowed disabled:opacity-50';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-electric-red text-bone-white hover:bg-electric-red/90',
  ghost: 'border border-bone-white bg-transparent text-bone-white hover:bg-bone-white/10',
  location: 'border border-bone-white bg-transparent text-bone-white hover:bg-bone-white/10',
};

const defaultIcons: Record<ButtonVariant, ReactNode> = {
  primary: <ChevronRight aria-hidden="true" className="size-[14px]" strokeWidth={2} />,
  ghost: null,
  location: <MapPin aria-hidden="true" className="size-[14px]" strokeWidth={2} />,
};

const defaultIconPositions: Record<ButtonVariant, 'left' | 'right'> = {
  primary: 'right',
  ghost: 'right',
  location: 'left',
};

export function Button({
  variant = 'primary',
  icon,
  iconPosition,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  const glyph = icon === undefined ? defaultIcons[variant] : icon;
  const position = iconPosition ?? defaultIconPositions[variant];

  return (
    <button className={cn(base, variants[variant], className)} type={type} {...props}>
      {position === 'left' ? glyph : null}
      {children}
      {position === 'right' ? glyph : null}
    </button>
  );
}
