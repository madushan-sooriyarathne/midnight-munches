import type { ReactNode } from 'react';

import { FieldError } from './FieldError';

type FieldProps = {
  name: string;
  label: string;
  error: string | undefined;
  children: ReactNode;
};

export const labelClassName =
  'font-body text-body-sm leading-body-sm font-medium tracking-body-sm uppercase';

/** Label + control + error. The control's `id` must equal `name`; the error renders as `${name}-error`. */
export function Field({ name, label, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-8">
      <label className={labelClassName} htmlFor={name}>
        {label}
      </label>
      {children}
      <FieldError id={`${name}-error`} message={error} />
    </div>
  );
}
