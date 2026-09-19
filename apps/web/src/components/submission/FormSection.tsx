import type { ReactNode } from 'react';

type FormSectionProps = { index: string; title: string; children: ReactNode };

export function FormSection({ index, title, children }: FormSectionProps) {
  return (
    <fieldset className="flex flex-col gap-16">
      {/* NOTE: a rendered legend sits outside the fieldset's flex flow, so `gap` can't space it. */}
      <legend className="mb-16 flex items-baseline gap-12 border-b-4 border-bone-white pb-8 font-display text-heading-sm leading-heading-sm tracking-heading-sm uppercase">
        <span className="text-electric-red">{index}</span>
        {title}
      </legend>
      {children}
    </fieldset>
  );
}
