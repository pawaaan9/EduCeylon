/** Sri Lanka mobile/landline stored as E.164: +94 + 9 national digits. */
const E164_SL = /^\+94[1-9]\d{8}$/;

export const NATIONAL_PHONE_DIGITS = 9;

const NATIONAL_LENGTH = NATIONAL_PHONE_DIGITS;

/** Digits-only national number (9 digits, no leading 0). */
function nationalDigits(raw: string): string {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("94")) d = d.slice(2);
  else if (d.startsWith("0")) d = d.slice(1);
  return d.slice(0, NATIONAL_LENGTH);
}

/** National digits (0–9) for the input beside a fixed +94 prefix. */
export function phoneNationalPart(stored?: string): string {
  if (!stored?.trim()) return "";
  return nationalDigits(stored);
}

/** Build stored value from national digits only (empty → undefined). */
export function phoneFromNationalPart(national: string): string | undefined {
  const digits = national.replace(/\D/g, "").slice(0, NATIONAL_LENGTH);
  if (!digits) return undefined;
  return `+94${digits}`;
}

/**
 * Normalize user input to `+94XXXXXXXXX`, or `undefined` if empty / invalid length.
 */
export function normalizeSriLankaPhone(raw: string): string | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  const national = nationalDigits(trimmed);
  if (national.length !== NATIONAL_LENGTH) return undefined;
  return `+94${national}`;
}

export function isValidSriLankaPhone(raw: string): boolean {
  const normalized = normalizeSriLankaPhone(raw);
  return normalized !== undefined && E164_SL.test(normalized);
}

/** Keep only digits, max 9 — for controlled phone input. */
export function sanitizeNationalPhoneInput(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, NATIONAL_LENGTH);
}
