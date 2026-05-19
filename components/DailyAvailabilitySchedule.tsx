"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useT } from "@/lib/i18n/I18nProvider";
import {
  DEFAULT_DAY_SLOT,
  type AvailableSchedule,
  type DayKey,
  type DayScheduleSlot,
  isValidDaySlot,
} from "@/lib/onboarding/schedule";
import {
  HOURS_12,
  MINUTES,
  formatTime12,
  parseTime24,
  toTime24,
  type Time12Parts,
} from "@/lib/time/format";

export function DailyAvailabilitySchedule({
  days,
  schedule,
  onChange,
}: {
  days: string[];
  schedule: AvailableSchedule;
  onChange: (schedule: AvailableSchedule) => void;
}) {
  const t = useT();

  if (days.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-ink-200 bg-ink-50 px-4 py-3 text-sm text-ink-500">
        {t("onboard.teaching.scheduleSelectDays")}
      </p>
    );
  }

  const firstDay = days[0] as DayKey;

  function updateDay(day: DayKey, patch: Partial<DayScheduleSlot>) {
    const current = schedule[day] ?? { ...DEFAULT_DAY_SLOT };
    onChange({
      ...schedule,
      [day]: { ...current, ...patch },
    });
  }

  function applyToAll() {
    const template = schedule[firstDay] ?? DEFAULT_DAY_SLOT;
    const next: AvailableSchedule = { ...schedule };
    for (const day of days) {
      next[day as DayKey] = { ...template };
    }
    onChange(next);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-ink-900">
            {t("onboard.teaching.scheduleTitle")}
          </p>
          <p className="text-xs text-ink-500">{t("onboard.teaching.scheduleHint")}</p>
        </div>
        {days.length > 1 && (
          <button
            type="button"
            onClick={applyToAll}
            className="text-xs font-semibold text-brand-700 hover:text-brand-800 underline-offset-2 hover:underline"
          >
            {t("onboard.teaching.applyToAll")}
          </button>
        )}
      </div>

      <ul className="space-y-2">
        {days.map((day) => {
          const key = day as DayKey;
          const slot = schedule[key] ?? DEFAULT_DAY_SLOT;
          const invalid = !isValidDaySlot(slot);
          return (
            <li
              key={day}
              className={`flex flex-col gap-2 rounded-xl border bg-white p-3 shadow-sm transition-colors sm:flex-row sm:items-center sm:gap-3 ${
                invalid
                  ? "border-rose-200 ring-1 ring-rose-100"
                  : "border-ink-100 hover:border-brand-200"
              }`}
            >
              <span className="flex h-9 w-12 shrink-0 items-center justify-center rounded-lg brand-gradient text-xs font-bold uppercase text-white shadow-sm">
                {t(`onboard.days.${day}`)}
              </span>
              <div className="flex flex-1 flex-wrap items-center gap-2 sm:gap-3">
                <TimeChip
                  label={t("onboard.teaching.from")}
                  value={slot.from}
                  onChange={(from) => updateDay(key, { from })}
                />
                <span className="text-ink-300" aria-hidden>
                  →
                </span>
                <TimeChip
                  label={t("onboard.teaching.to")}
                  value={slot.to}
                  onChange={(to) => updateDay(key, { to })}
                />
              </div>
              {invalid && (
                <p className="text-xs text-rose-600 sm:ml-auto">
                  {t("onboard.teaching.dayInvalid")}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function TimeChip({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (time24: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const parts =
    parseTime24(value) ??
    ({ hour12: 8, minute: 0, period: "AM" } satisfies Time12Parts);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function apply(next: Partial<Time12Parts>) {
    onChange(toTime24({ ...parts, ...next }));
  }

  return (
    <div ref={wrapRef} className="relative min-w-[7.5rem] flex-1">
      <span className="sr-only">{label}</span>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-ink-200 bg-ink-50/80 px-3 py-2 text-left transition-colors hover:border-brand-400 hover:bg-white focus:border-brand-500 focus:outline-none focus:shadow-[0_0_0_3px_rgba(59,130,246,0.12)]"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`${label}: ${formatTime12(value)}`}
      >
        <span className="text-sm font-bold tabular-nums text-ink-900">
          {formatTime12(value)}
        </span>
        <ClockIcon />
      </button>

      {open && (
        <div
          id={listId}
          className="absolute z-40 mt-1 w-[min(100%,16rem)] rounded-xl border border-ink-200 bg-white p-3 shadow-card"
        >
          <div className="grid grid-cols-3 gap-2">
            <PickerColumn
              label="Hr"
              options={HOURS_12.map(String)}
              value={String(parts.hour12)}
              onSelect={(h) => apply({ hour12: parseInt(h, 10) })}
            />
            <PickerColumn
              label="Min"
              options={MINUTES.map((m) => String(m).padStart(2, "0"))}
              value={String(parts.minute).padStart(2, "0")}
              onSelect={(m) => apply({ minute: parseInt(m, 10) })}
            />
            <PickerColumn
              label="AM/PM"
              options={["AM", "PM"]}
              value={parts.period}
              onSelect={(p) => apply({ period: p as "AM" | "PM" })}
            />
          </div>
          <button
            type="button"
            className="btn btn-primary mt-2 w-full justify-center py-1.5 text-xs"
            onClick={() => setOpen(false)}
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}

function PickerColumn({
  label,
  options,
  value,
  onSelect,
}: {
  label: string;
  options: string[];
  value: string;
  onSelect: (v: string) => void;
}) {
  return (
    <div>
      <div className="mb-1 text-center text-[9px] font-semibold uppercase tracking-wider text-ink-400">
        {label}
      </div>
      <div className="max-h-28 overflow-y-auto rounded-lg bg-ink-50 p-0.5">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onSelect(opt)}
            className={`mb-0.5 w-full rounded-md py-1.5 text-xs font-semibold tabular-nums transition-colors ${
              opt === value
                ? "brand-gradient text-white"
                : "text-ink-700 hover:bg-white"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function ClockIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-brand-600"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
