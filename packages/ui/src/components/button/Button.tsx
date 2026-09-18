'use client';

import { ChevronRight, MapPin } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { type ButtonVariant, getButtonClassName } from './get-button-class-name';

export type { ButtonVariant };

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  /** Replaces the variant's default glyph. Pass `null` to render no icon at all. */
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

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
    <button className={getButtonClassName(variant, className)} type={type} {...props}>
      {position === 'left' ? glyph : null}
      {children}
      {position === 'right' ? glyph : null}
    </button>
  );
}
