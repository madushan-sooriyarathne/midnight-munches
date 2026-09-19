import { TriangleAlert } from 'lucide-react';

type FieldErrorProps = { id: string; message: string | undefined };

/** Inline error under an input; point the input's `aria-describedby` at `id`. */
export function FieldError({ id, message }: FieldErrorProps) {
  if (!message) return null;

  return (
    // Red text fails 4.5:1 on velvet-wine, so red stays on the icon and the text stays blush.
    <p
      className="flex items-start gap-8 font-body text-body-sm leading-body-sm tracking-body-sm text-blush-highlight"
      id={id}
    >
      <TriangleAlert
        aria-hidden="true"
        className="mt-[2px] size-16 shrink-0 text-electric-red"
        strokeWidth={2}
      />
      {message}
    </p>
  );
}
