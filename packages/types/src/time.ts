export type OperatingWindow = {
  // 0 = Sunday through 6 = Saturday
  dayOfWeek: number;
  // HH:mm (API input) or HH:mm:ss (Postgres time)
  openTime: string;
  closeTime: string;
};

export type StallSchedule = {
  isEmergencyClosed: boolean;
  operatingHours: readonly OperatingWindow[];
};

export type StallStatusResult =
  | { status: 'OPEN_NOW'; closesInMinutes: number; label: string }
  | {
      status: 'OPENS_AT';
      opensInMinutes: number;
      opensAt: string;
      day: 'today' | 'tomorrow';
      label: string;
    }
  | { status: 'CLOSED'; isEmergency: boolean; label: string };

const DAY = 86_400;
const WEEK = 7 * DAY;
// ponytail: fixed +05:30, Sri Lanka has had no DST since 2006. Switch to Intl formatToParts if
// that ever changes.
const COLOMBO_OFFSET_MS = 19_800_000;

/** Live trading state of a stall in Asia/Colombo, independent of the host's timezone. */
export function getStallStatus(stall: StallSchedule, now = new Date()): StallStatusResult {
  if (stall.isEmergencyClosed) return { status: 'CLOSED', isEmergency: true, label: 'Closed' };

  // Shift the instant and read only UTC fields, so the host TZ never enters the math.
  const colombo = new Date(now.getTime() + COLOMBO_OFFSET_MS);
  const nowSec =
    colombo.getUTCDay() * DAY +
    colombo.getUTCHours() * 3600 +
    colombo.getUTCMinutes() * 60 +
    colombo.getUTCSeconds();

  let closesIn = 0;
  let opensIn = Number.POSITIVE_INFINITY;
  let opensAt = '';
  for (const slot of stall.operatingHours) {
    const open = toSeconds(slot.openTime);
    const start = slot.dayOfWeek * DAY + open;
    // close <= open wraps past midnight; open === close is a 24h window.
    const duration = (toSeconds(slot.closeTime) - open + DAY) % DAY || DAY;
    // Measured modulo a week, so yesterday's overnight slot and the Sat→Sun wrap need no special case.
    const sinceStart = (nowSec - start + WEEK) % WEEK;

    if (sinceStart < duration) {
      // ponytail: overlaps take the latest close; back-to-back slots (11–15, 15–23) aren't
      // chained, merge them first if "Closes in" must span both.
      closesIn = Math.max(closesIn, duration - sinceStart);
    } else if (WEEK - sinceStart < opensIn) {
      opensIn = WEEK - sinceStart;
      opensAt = formatClock(open);
    }
  }

  if (closesIn > 0) {
    const minutes = Math.ceil(closesIn / 60);
    return {
      status: 'OPEN_NOW',
      closesInMinutes: minutes,
      label: `Closes in ${formatDuration(minutes)}`,
    };
  }

  if (opensIn <= DAY) {
    const day = (nowSec % DAY) + opensIn < DAY ? 'today' : 'tomorrow';
    return {
      status: 'OPENS_AT',
      opensInMinutes: Math.ceil(opensIn / 60),
      opensAt,
      day,
      label: `Opens ${day} at ${opensAt}`,
    };
  }

  return { status: 'CLOSED', isEmergency: false, label: 'Closed' };
}

function toSeconds(time: string) {
  const [hours = 0, minutes = 0, seconds = 0] = time.split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds;
}

// Hand-rolled rather than Intl: ICU builds disagree on the space before AM/PM (U+202F vs U+0020),
// which would break hydration between server and browser renders.
function formatClock(secondsOfDay: number) {
  const hours = Math.floor(secondsOfDay / 3600);
  const minutes = String(Math.floor(secondsOfDay / 60) % 60).padStart(2, '0');
  return `${hours % 12 || 12}:${minutes} ${hours < 12 ? 'AM' : 'PM'}`;
}

function formatDuration(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (!hours) return `${minutes}m`;
  return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
}
