export type Time12Parts = {
  hour12: number;
  minute: number;
  period: "AM" | "PM";
};

const HOURS_12 = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;
const MINUTES = [0, 15, 30, 45] as const;

export { HOURS_12, MINUTES };

export function parseTime24(value: string | undefined): Time12Parts | null {
  if (!value || !/^\d{2}:\d{2}$/.test(value)) return null;
  const [hStr, mStr] = value.split(":");
  const h24 = parseInt(hStr!, 10);
  const minute = parseInt(mStr!, 10);
  if (h24 < 0 || h24 > 23 || minute < 0 || minute > 59) return null;

  const period: "AM" | "PM" = h24 >= 12 ? "PM" : "AM";
  let hour12 = h24 % 12;
  if (hour12 === 0) hour12 = 12;

  return { hour12, minute: Math.round(minute / 15) * 15 % 60, period };
}

export function toTime24(parts: Time12Parts): string {
  let h = parts.hour12 % 12;
  if (parts.period === "PM") h += 12;
  if (parts.hour12 === 12 && parts.period === "AM") h = 0;
  if (parts.hour12 === 12 && parts.period === "PM") h = 12;
  return `${String(h).padStart(2, "0")}:${String(parts.minute).padStart(2, "0")}`;
}

export function formatTime12(value: string | undefined): string {
  const p = parseTime24(value);
  if (!p) return "—";
  return `${p.hour12}:${String(p.minute).padStart(2, "0")} ${p.period}`;
}
