import { INicDetails } from "./types";

// Old NIC: 9 digits + V/X  (e.g. 972002662V) — birth year assumed 19xx.
const OLD_NIC = /^(\d{2})(\d{3})\d{4}[VX]$/;
// New NIC: 12 digits        (e.g. 199720002662) — 4-digit year, 19xx or 20xx.
const NEW_NIC = /^((?:19|20)\d{2})(\d{3})\d{5}$/;

const isLeapYear = (year: number): boolean =>
  (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

/**
 * Pulls the birth year and the 1..366 day-of-year out of any SL NIC.
 * Returns null if the NIC is malformed or the day-of-year is out of range.
 * Females are offset by 500 in the NIC, so 560 -> day 60 -> Feb 29.
 */
function parse(
  nic: string
): { year: number; dayOfYear: number; isFemale: boolean } | null {
  const normalized = nic.trim().toUpperCase();
  const oldMatch = normalized.match(OLD_NIC);
  const newMatch = normalized.match(NEW_NIC);

  let year: number;
  let dayField: number;

  if (oldMatch) {
    year = 1900 + Number(oldMatch[1]); // old cards are 19xx
    dayField = Number(oldMatch[2]);
  } else if (newMatch) {
    year = Number(newMatch[1]);
    dayField = Number(newMatch[2]);
  } else {
    return null; // wrong shape
  }

  const isFemale = dayField > 500;
  const dayOfYear = isFemale ? dayField - 500 : dayField;

  // Single range check — replaces the two ranges 001–366 / 501–866.
  if (dayOfYear < 1 || dayOfYear > 366) return null;

  return { year, dayOfYear, isFemale };
}

export function isValidSlNic(nic: string): boolean {
  return parse(nic) !== null;
}

export function extractDetailsFromSlNic(nic: string): INicDetails | undefined {
  const parsed = parse(nic);
  if (!parsed) return undefined;

  const { year, dayOfYear, isFemale } = parsed;

  // Day-of-year -> month/day via a leap anchor. 2000 is a leap year (366 days),
  // matching the NIC's "every year has a Feb 29" assumption, so day 60 -> Feb 29
  // and day 61 -> Mar 1 regardless of the actual birth year.
  const anchor = new Date(Date.UTC(2000, 0, dayOfYear));
  const month = anchor.getUTCMonth() + 1; // 1..12
  const day = anchor.getUTCDate(); // 1..31

  // Faithful to the encoding: a non-leap-year day-60 stays "02-29".
  // Uncomment to instead reject impossible calendar dates:
  // if (month === 2 && day === 29 && !isLeapYear(year)) return undefined;

  const pad = (n: number) => String(n).padStart(2, "0");
  const dateOfBirth = `${year}-${pad(month)}-${pad(day)}`;

  // Age from the decoded numbers directly — never `new Date(dateOfBirth)`, which
  // would silently roll "1997-02-29" forward to Mar 1 and skew the result.
  const today = new Date();
  let age = today.getFullYear() - year;
  const tm = today.getMonth() + 1;
  const td = today.getDate();
  if (tm < month || (tm === month && td < day)) age--;

  return {
    dateOfBirth,
    age,
    gender: isFemale ? "Female" : "Male",
  };
}