import { Button, cn } from '@midnightmunches/ui';

import { DAYS, type HoursRow } from '@/lib/submission';

import { FieldError } from './FieldError';

type HoursMatrixInputProps = {
  value: HoursRow[];
  onChange: (rows: HoursRow[]) => void;
  errors: Record<string, string>;
};

const checkboxLabelClassName =
  'flex min-h-[44px] items-center gap-8 font-body text-body-sm leading-body-sm font-medium tracking-body-sm uppercase';

const timeInputClassName =
  'min-h-[44px] border-2 border-bone-white bg-butcher-black px-8 font-body text-body-sm text-bone-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bone-white disabled:opacity-40 aria-[invalid=true]:border-electric-red';

const smallButtonClassName = 'min-h-[44px] px-12 py-8';

export function HoursMatrixInput({ value, onChange, errors }: HoursMatrixInputProps) {
  function updateRow(day: number, patch: Partial<HoursRow>) {
    onChange(value.map((row, index) => (index === day ? { ...row, ...patch } : row)));
  }

  function handleCopyToAll(source: HoursRow) {
    onChange(value.map(() => ({ ...source })));
  }

  // 00:00-06:00 ends the day it starts, so it is not overnight by the API's rule.
  function handleMidnightPreset() {
    onChange(
      value.map(() => ({
        isOpen: true,
        openTime: '00:00',
        closeTime: '06:00',
        isOvernight: false,
      })),
    );
  }

  return (
    <div className="flex flex-col gap-16" id="operatingHours">
      <p className="font-body text-body-sm leading-body-sm tracking-body-sm text-blush-highlight">
        Pick the day you open. Open Friday 10 PM, close Saturday 4 AM? Tick Friday and Overnight.
      </p>
      <Button
        className={cn('self-start', smallButtonClassName)}
        icon={null}
        onClick={handleMidnightPreset}
        variant="ghost"
      >
        Every day 12 AM – 6 AM
      </Button>

      <ul className="flex flex-col border-t-2 border-bone-white">
        {value.map((row, day) => {
          const dayName = DAYS[day];
          const error = errors[`hours.${day}`];
          const errorId = `hours.${day}-error`;

          return (
            <li className="flex flex-col gap-8 border-b-2 border-bone-white py-12" key={dayName}>
              <div className="flex flex-wrap items-center gap-x-16 gap-y-8">
                <label className={cn('w-[9.5rem]', checkboxLabelClassName)}>
                  <input
                    checked={row.isOpen}
                    className="size-20 accent-electric-red"
                    onChange={(event) => updateRow(day, { isOpen: event.target.checked })}
                    type="checkbox"
                  />
                  {dayName}
                </label>

                <div className="flex items-center gap-8">
                  <input
                    aria-describedby={error ? errorId : undefined}
                    aria-invalid={Boolean(error)}
                    aria-label={`${dayName} opens`}
                    className={timeInputClassName}
                    disabled={!row.isOpen}
                    id={`hours.${day}`}
                    onChange={(event) => updateRow(day, { openTime: event.target.value })}
                    type="time"
                    value={row.openTime}
                  />
                  <span aria-hidden="true">–</span>
                  <input
                    aria-describedby={error ? errorId : undefined}
                    aria-invalid={Boolean(error)}
                    aria-label={`${dayName} closes`}
                    className={timeInputClassName}
                    disabled={!row.isOpen}
                    onChange={(event) => updateRow(day, { closeTime: event.target.value })}
                    type="time"
                    value={row.closeTime}
                  />
                </div>

                <label className={checkboxLabelClassName}>
                  <input
                    checked={row.isOvernight}
                    className="size-20 accent-electric-red"
                    disabled={!row.isOpen}
                    onChange={(event) => updateRow(day, { isOvernight: event.target.checked })}
                    type="checkbox"
                  />
                  Overnight
                </label>

                <Button
                  aria-label={`Copy to all days: ${dayName} hours`}
                  className={smallButtonClassName}
                  disabled={!row.isOpen}
                  icon={null}
                  onClick={() => handleCopyToAll(row)}
                  variant="ghost"
                >
                  Copy to all
                </Button>
              </div>
              <FieldError id={errorId} message={error} />
            </li>
          );
        })}
      </ul>
      <FieldError id="operatingHours-error" message={errors.operatingHours} />
    </div>
  );
}
