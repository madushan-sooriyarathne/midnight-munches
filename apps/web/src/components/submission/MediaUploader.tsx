import {
  MAX_MEDIA,
  MAX_UPLOAD_BYTES,
  type MediaType,
  uploadContentTypeSchema,
} from '@midnightmunches/types/submission';
import { Button } from '@midnightmunches/ui';
import { type ChangeEvent, useState } from 'react';

import { FieldError } from './FieldError';

export type MediaFiles = Record<MediaType, { id: string; file: File }[]>;

type MediaUploaderProps = {
  value: MediaFiles;
  onChange: (files: MediaFiles) => void;
  error: string | undefined;
};

const SLOTS: { type: MediaType; label: string; hint: string; isMultiple: boolean }[] = [
  { type: 'cover', label: 'Cover photo', hint: 'One shot of the stall front', isMultiple: false },
  { type: 'menu', label: 'Menu', hint: 'The menu board or price list', isMultiple: true },
  { type: 'photo', label: 'Stall photos', hint: 'Food, queue, late-night crowd', isMultiple: true },
];

const fileInputClassName =
  'w-full font-body text-body-sm leading-body-sm text-bone-white file:mr-12 file:min-h-[44px] file:cursor-pointer file:border-2 file:border-bone-white file:bg-transparent file:px-12 file:font-body file:text-body-sm file:font-medium file:text-bone-white file:uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bone-white';

/** Holds picked files only; they upload to R2 on submit, so abandoned forms leave no objects. */
export function MediaUploader({ value, onChange, error }: MediaUploaderProps) {
  const [rejection, setRejection] = useState<string | null>(null);

  function handleFiles(type: MediaType, event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    // State is the source of truth; clearing lets the same file be picked again after removal.
    event.target.value = '';

    const invalid = files.find(
      (file) =>
        !uploadContentTypeSchema.safeParse(file.type).success || file.size > MAX_UPLOAD_BYTES,
    );
    if (invalid) {
      setRejection(`${invalid.name}: use a JPG, PNG or WebP under 5 MB`);
      return;
    }

    const added = files.map((file) => ({ id: crypto.randomUUID(), file }));
    const next = {
      ...value,
      [type]: type === 'cover' ? added.slice(0, 1) : [...value[type], ...added],
    };
    if (Object.values(next).flat().length > MAX_MEDIA) {
      setRejection(`Up to ${MAX_MEDIA} files in total`);
      return;
    }

    setRejection(null);
    onChange(next);
  }

  function handleRemove(type: MediaType, id: string) {
    onChange({ ...value, [type]: value[type].filter((entry) => entry.id !== id) });
  }

  const message = rejection ?? error;

  return (
    <div className="flex flex-col gap-24" id="media">
      {SLOTS.map(({ type, label, hint, isMultiple }) => (
        <div className="flex flex-col gap-8" key={type}>
          <label
            className="font-body text-body-sm leading-body-sm font-medium tracking-body-sm uppercase"
            htmlFor={`media.${type}`}
          >
            {label} <span className="font-normal normal-case text-blush-highlight">— {hint}</span>
          </label>
          <input
            accept={uploadContentTypeSchema.options.join(',')}
            aria-describedby={message ? 'media-error' : undefined}
            className={fileInputClassName}
            id={`media.${type}`}
            multiple={isMultiple}
            onChange={(event) => handleFiles(type, event)}
            type="file"
          />
          {value[type].length > 0 && (
            <ul className="flex flex-col gap-4">
              {value[type].map(({ id, file }) => (
                <li
                  className="flex items-center justify-between gap-12 border-b border-bone-white/40 font-body text-body-sm leading-body-sm"
                  key={id}
                >
                  <span className="truncate">
                    {file.name} · {(file.size / 1024 / 1024).toFixed(1)} MB
                  </span>
                  <Button
                    aria-label={`Remove ${file.name}`}
                    className="min-h-[44px] px-12 py-8"
                    icon={null}
                    onClick={() => handleRemove(type, id)}
                    variant="ghost"
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
      <FieldError id="media-error" message={message} />
    </div>
  );
}
