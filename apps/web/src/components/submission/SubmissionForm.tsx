'use client';

import { mediaTypeSchema, submissionSchema } from '@midnightmunches/types/submission';
import { Button, getButtonClassName } from '@midnightmunches/ui';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { type FormEvent, useEffect, useRef, useState, useTransition } from 'react';

import { useGeolocation } from '@/hooks/useGeolocation';
import type { Coords } from '@/lib/stalls';
import {
  createDefaultHours,
  DISTRICTS,
  FOOD_TYPES,
  getHoursErrors,
  submitStall,
  toFieldErrors,
  toSubmissionInput,
  uploadMedia,
} from '@/lib/submission';

import { Field, labelClassName } from './Field';
import { FieldError } from './FieldError';
import { FormSection } from './FormSection';
import { HoursMatrixInput } from './HoursMatrixInput';
import { type MediaFiles, MediaUploader } from './MediaUploader';

// Leaflet reads `window` on import; `ssr: false` is only allowed from a Client Component.
const MapCoordinatePicker = dynamic(
  () => import('./MapCoordinatePicker').then((module) => module.MapCoordinatePicker),
  {
    ssr: false,
    loading: () => <div aria-hidden="true" className="h-[360px] border-2 border-bone-white" />,
  },
);

const EMPTY_MEDIA: MediaFiles = { cover: [], menu: [], photo: [] };

// Prefixes for the error summary, so "Use a full https:// link" says which link.
const FIELD_LABELS: Record<string, string> = {
  name: 'Name',
  address: 'Address',
  district: 'District',
  phone: 'Phone',
  foodTypes: 'Food types',
  'deliveryUrls.ubereats': 'Uber Eats link',
  'deliveryUrls.pickme': 'PickMe link',
  'deliveryUrls.direct': 'Order link',
  latitude: 'Location',
  longitude: 'Location',
  operatingHours: 'Hours',
  media: 'Photos',
};

const inputClassName =
  'min-h-[44px] w-full border-2 border-bone-white bg-butcher-black px-12 py-8 font-body text-body leading-body text-bone-white placeholder:text-bone-white/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bone-white aria-[invalid=true]:border-electric-red';

type Submitted = Awaited<ReturnType<typeof submitStall>>;

export function SubmissionForm() {
  const [isPending, startTransition] = useTransition();
  const [progress, setProgress] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<Submitted | null>(null);
  const [hours, setHours] = useState(createDefaultHours);
  const [media, setMedia] = useState(EMPTY_MEDIA);
  // null = untouched, so a "Use my location" fix shows through until the pin is moved.
  const [coords, setCoords] = useState<Coords | null>(null);
  const geo = useGeolocation();
  const summaryRef = useRef<HTMLDivElement>(null);

  const pin = coords ?? (geo.state.status === 'granted' ? geo.state.coords : null);
  const mapValue =
    pin && Number.isFinite(pin.latitude) && Number.isFinite(pin.longitude) ? pin : null;
  const errorEntries = Object.entries(errors).filter(
    // Both coordinates fail together with the same message; list it once.
    ([key]) => key !== 'longitude' || !errors.latitude,
  );

  useEffect(() => {
    if (Object.keys(errors).length) summaryRef.current?.focus();
  }, [errors]);

  function handleLocate() {
    setCoords(null);
    geo.request();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Validated before any upload, so a typo never costs R2 writes. Media is checked on its own.
    const input = toSubmissionInput(new FormData(event.currentTarget), hours);
    const parsed = submissionSchema.safeParse(input);
    const nextErrors = {
      ...(parsed.success ? {} : toFieldErrors(parsed.error.issues)),
      ...getHoursErrors(hours),
    };
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const fileCount = Object.values(media).flat().length;
    setProgress(fileCount ? `Uploading ${fileCount} files…` : 'Submitting…');

    startTransition(async () => {
      try {
        const uploaded = await Promise.all(
          mediaTypeSchema.options.flatMap((type) =>
            media[type].map(({ file }) => uploadMedia(file, type)),
          ),
        );
        setProgress('Submitting…');
        setSubmitted(await submitStall({ ...input, media: uploaded }));
      } catch (error) {
        setErrors({
          form: error instanceof Error ? error.message : 'Submission failed. Try again',
        });
      }
    });
  }

  function handleReset() {
    setSubmitted(null);
    setErrors({});
    setHours(createDefaultHours());
    setMedia(EMPTY_MEDIA);
    setCoords(null);
    geo.clear();
  }

  if (submitted) {
    return (
      <section
        className="flex flex-col items-start gap-16 border-2 border-bone-white bg-butcher-black p-24"
        role="status"
      >
        <p className="border-2 border-electric-red px-8 py-4 font-body text-body-sm leading-body-sm font-medium tracking-body-sm uppercase">
          Status: {submitted.status}
        </p>
        <h2
          className="font-display text-heading leading-heading tracking-heading uppercase"
          ref={(node) => node?.focus()}
          tabIndex={-1}
        >
          Submitted. Pending review.
        </h2>
        <p className="font-body text-body leading-body tracking-body text-blush-highlight">
          {submitted.name} in {submitted.district} is in the moderation queue. It goes live once a
          moderator approves it.
        </p>
        <div className="flex flex-wrap gap-12">
          <Link className={getButtonClassName('primary')} href="/">
            Back to directory
          </Link>
          <Button icon={null} onClick={handleReset} variant="ghost">
            Submit another
          </Button>
        </div>
      </section>
    );
  }

  const fieldProps = (name: string) => ({
    id: name,
    name,
    'aria-invalid': Boolean(errors[name]),
    'aria-describedby': errors[name] ? `${name}-error` : undefined,
  });

  return (
    <form className="flex flex-col gap-40 [color-scheme:dark]" noValidate onSubmit={handleSubmit}>
      {errorEntries.length > 0 && (
        <div
          className="flex flex-col gap-12 border-4 border-electric-red bg-butcher-black p-16 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bone-white"
          ref={summaryRef}
          role="alert"
          tabIndex={-1}
        >
          <h2 className="font-display text-subheading leading-subheading tracking-subheading uppercase">
            {errors.form
              ? 'Submission failed'
              : `Fix ${errorEntries.length} ${errorEntries.length === 1 ? 'thing' : 'things'}`}
          </h2>
          <ul className="flex list-inside list-[square] flex-col gap-4 font-body text-body-sm leading-body-sm tracking-body-sm">
            {errorEntries.map(([key, message]) => (
              <li key={key}>
                {key === 'form' ? (
                  message
                ) : (
                  <a
                    className="underline underline-offset-4 hover:text-blush-highlight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bone-white"
                    href={`#${key}`}
                  >
                    {FIELD_LABELS[key] ? `${FIELD_LABELS[key]}: ${message}` : message}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <FormSection index="01" title="The stall">
        <Field error={errors.name} label="Name" name="name">
          <input
            {...fieldProps('name')}
            autoComplete="organization"
            className={inputClassName}
            maxLength={120}
            placeholder="Hela Kottu Kadé"
          />
        </Field>
        <Field error={errors.address} label="Street address" name="address">
          <input
            {...fieldProps('address')}
            autoComplete="street-address"
            className={inputClassName}
            maxLength={500}
            placeholder="12 Galle Road"
          />
        </Field>
        <Field error={errors.district} label="District" name="district">
          <select {...fieldProps('district')} className={inputClassName} defaultValue="">
            <option disabled value="">
              Pick a district
            </option>
            {DISTRICTS.map((district) => (
              <option key={district}>{district}</option>
            ))}
          </select>
        </Field>
        <Field error={errors.phone} label="Phone (optional)" name="phone">
          <input
            {...fieldProps('phone')}
            autoComplete="tel"
            className={inputClassName}
            inputMode="tel"
            placeholder="077 123 4567"
            type="tel"
          />
        </Field>

        <fieldset
          aria-describedby={errors.foodTypes ? 'foodTypes-error' : undefined}
          className="flex flex-col gap-8"
          id="foodTypes"
        >
          <legend className={labelClassName}>Food types</legend>
          <div className="flex flex-wrap gap-8">
            {FOOD_TYPES.map((foodType) => (
              <label
                className="flex min-h-[44px] items-center gap-8 border-2 border-bone-white px-12 font-body text-body-sm leading-body-sm font-medium tracking-body-sm uppercase has-[:checked]:bg-electric-red"
                key={foodType}
              >
                <input
                  className="size-20 accent-butcher-black"
                  name="foodTypes"
                  type="checkbox"
                  value={foodType}
                />
                {foodType}
              </label>
            ))}
          </div>
          <FieldError id="foodTypes-error" message={errors.foodTypes} />
        </fieldset>

        <fieldset className="flex flex-col gap-12">
          <legend className={labelClassName}>Delivery links (optional)</legend>
          {(
            [
              ['deliveryUrls.ubereats', 'Uber Eats', 'https://www.ubereats.com/lk/store/…'],
              ['deliveryUrls.pickme', 'PickMe', 'https://pickme.lk/…'],
              ['deliveryUrls.direct', 'Own website or order link', 'https://…'],
            ] as const
          ).map(([name, label, placeholder]) => (
            <Field error={errors[name]} key={name} label={label} name={name}>
              <input
                {...fieldProps(name)}
                className={inputClassName}
                inputMode="url"
                placeholder={placeholder}
                type="url"
              />
            </Field>
          ))}
        </fieldset>
      </FormSection>

      <FormSection index="02" title="Location">
        <p className="font-body text-body-sm leading-body-sm tracking-body-sm text-blush-highlight">
          Tap the map to drop the pin, then drag it to the exact spot. Or type the coordinates.
        </p>
        <div className="flex flex-wrap items-center gap-12">
          <Button
            disabled={geo.state.status === 'pending'}
            onClick={handleLocate}
            variant="location"
          >
            {geo.state.status === 'pending' ? 'Locating…' : 'Use my location'}
          </Button>
          <p
            aria-live="polite"
            className="font-body text-body-sm leading-body-sm text-blush-highlight"
          >
            {geo.state.status === 'denied' && 'Location blocked. Tap the map instead.'}
            {geo.state.status === 'unavailable' &&
              "Couldn't get your location. Tap the map instead."}
          </p>
        </div>
        <MapCoordinatePicker onChange={setCoords} value={mapValue} />
        <div className="grid grid-cols-2 gap-12">
          {/* Both coordinates share the one error below the grid. */}
          <Field error={undefined} label="Latitude" name="latitude">
            <input
              {...fieldProps('latitude')}
              className={inputClassName}
              inputMode="decimal"
              onChange={(event) =>
                setCoords({
                  latitude: event.currentTarget.valueAsNumber,
                  longitude: pin?.longitude ?? Number.NaN,
                })
              }
              step="any"
              type="number"
              value={pin && Number.isFinite(pin.latitude) ? pin.latitude : ''}
            />
          </Field>
          <Field error={undefined} label="Longitude" name="longitude">
            <input
              {...fieldProps('longitude')}
              aria-describedby={errors.latitude || errors.longitude ? 'latitude-error' : undefined}
              className={inputClassName}
              inputMode="decimal"
              onChange={(event) =>
                setCoords({
                  latitude: pin?.latitude ?? Number.NaN,
                  longitude: event.currentTarget.valueAsNumber,
                })
              }
              step="any"
              type="number"
              value={pin && Number.isFinite(pin.longitude) ? pin.longitude : ''}
            />
          </Field>
        </div>
        <FieldError id="latitude-error" message={errors.latitude ?? errors.longitude} />
      </FormSection>

      <FormSection index="03" title="Hours">
        <HoursMatrixInput errors={errors} onChange={setHours} value={hours} />
      </FormSection>

      <FormSection index="04" title="Photos (optional)">
        <MediaUploader error={errors.media} onChange={setMedia} value={media} />
      </FormSection>

      <div className="flex flex-wrap items-center gap-16 border-t-2 border-bone-white pt-24">
        <Button disabled={isPending} type="submit">
          {isPending ? 'Working…' : 'Submit for review'}
        </Button>
        <p
          aria-live="polite"
          className="font-body text-body-sm leading-body-sm text-blush-highlight"
        >
          {isPending ? progress : ''}
        </p>
      </div>
    </form>
  );
}
