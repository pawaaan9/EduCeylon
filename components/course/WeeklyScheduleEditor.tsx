"use client";

import { PlusIcon, TrashIcon } from "@/components/icons";
import { TimeChipPicker } from "@/components/TimeChipPicker";
import {
  newClientId,
  WEEKLY_DAY_OPTIONS,
  type WeeklyDay,
  type WeeklyScheduleSlot,
} from "@/lib/courses/types";
import { useT } from "@/lib/i18n/I18nProvider";
import {
  formatScheduleDuration,
  formatTimeRange12,
  scheduleDurationMinutes,
} from "@/lib/time/format";

const DAY_ORDER: Record<WeeklyDay, number> = {
  monday: 0,
  tuesday: 1,
  wednesday: 2,
  thursday: 3,
  friday: 4,
  saturday: 5,
  sunday: 6,
};

export function WeeklyScheduleEditor({
  slots,
  onChange,
}: {
  slots: WeeklyScheduleSlot[];
  onChange: (next: WeeklyScheduleSlot[]) => void;
}) {
  const t = useT();

  function addSlot() {
    onChange([
      ...slots,
      {
        id: newClientId("slot"),
        day: "monday",
        startTime: "08:00",
        endTime: "17:00",
        title: "",
      },
    ]);
  }

  function updateSlot(id: string, patch: Partial<WeeklyScheduleSlot>) {
    onChange(slots.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function removeSlot(id: string) {
    onChange(slots.filter((s) => s.id !== id));
  }

  const sorted = [...slots].sort((a, b) => {
    const dayDiff = DAY_ORDER[a.day] - DAY_ORDER[b.day];
    if (dayDiff !== 0) return dayDiff;
    return a.startTime.localeCompare(b.startTime);
  });

  return (
    <div className="grid gap-4">
      {sorted.length === 0 ? (
        <div className="rounded-xl border border-dashed border-ink-300 bg-ink-50 p-8 text-center text-sm text-ink-500">
          {t("lecturer.create.schedule.empty")}
        </div>
      ) : (
        sorted.map((slot) => (
          <ScheduleSlotCard
            key={slot.id}
            slot={slot}
            t={t}
            onUpdate={(patch) => updateSlot(slot.id, patch)}
            onRemove={() => removeSlot(slot.id)}
          />
        ))
      )}

      <div>
        <button type="button" onClick={addSlot} className="btn btn-secondary">
          <PlusIcon className="h-4 w-4" />
          {t("lecturer.create.schedule.add")}
        </button>
      </div>
    </div>
  );
}

function ScheduleSlotCard({
  slot,
  t,
  onUpdate,
  onRemove,
}: {
  slot: WeeklyScheduleSlot;
  t: (key: string) => string;
  onUpdate: (patch: Partial<WeeklyScheduleSlot>) => void;
  onRemove: () => void;
}) {
  const durationMin = scheduleDurationMinutes(slot.startTime, slot.endTime);
  const dayLabel = t(`lecturer.create.day.${slot.day}`);
  const dayAbbr =
    dayLabel.length > 3 ? dayLabel.slice(0, 3).toUpperCase() : dayLabel.toUpperCase();

  return (
    <article className="rounded-2xl border border-ink-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Time banner */}
      <div className="flex flex-wrap items-center gap-3 rounded-t-2xl border-b border-brand-100 bg-gradient-to-r from-brand-50 via-white to-brand-50/40 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl brand-gradient text-xs font-bold uppercase tracking-wide text-white shadow-sm">
            {dayAbbr}
          </span>

          <div className="min-w-0 flex-1">
            <select
              className="mb-0.5 block w-full max-w-[12rem] border-0 bg-transparent p-0 text-sm font-semibold text-ink-900 focus:outline-none focus:ring-0 cursor-pointer"
              value={slot.day}
              onChange={(e) =>
                onUpdate({ day: e.target.value as WeeklyDay })
              }
              aria-label={t("lecturer.create.schedule.day")}
            >
              {WEEKLY_DAY_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {t(`lecturer.create.day.${d}`)}
                </option>
              ))}
            </select>
            <p className="text-sm font-bold tabular-nums text-brand-800 sm:text-base">
              {formatTimeRange12(slot.startTime, slot.endTime)}
            </p>
          </div>
        </div>

        {durationMin !== null && (
          <span className="inline-flex items-center rounded-full bg-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-800">
            {formatScheduleDuration(durationMin)}
          </span>
        )}

        <button
          type="button"
          onClick={onRemove}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-ink-500 hover:bg-rose-50 hover:text-rose-600"
          aria-label={t("lecturer.create.schedule.remove")}
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Time pickers */}
      <div className="px-4 py-4 sm:px-5">
        <p className="mb-2 text-xs font-medium text-ink-500">
          {t("lecturer.create.schedule.timeRange")}
        </p>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <TimeChipPicker
            label={t("lecturer.create.schedule.startTime")}
            value={slot.startTime}
            onChange={(startTime) => onUpdate({ startTime })}
            className="min-w-[8.5rem] flex-1 sm:flex-none sm:min-w-[9rem]"
          />
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink-100 text-sm font-bold text-ink-400"
            aria-hidden
          >
            →
          </span>
          <TimeChipPicker
            label={t("lecturer.create.schedule.endTime")}
            value={slot.endTime}
            onChange={(endTime) => onUpdate({ endTime })}
            className="min-w-[8.5rem] flex-1 sm:flex-none sm:min-w-[9rem]"
          />
        </div>

        <div className="mt-4">
          <label className="block">
            <span className="text-xs font-medium text-ink-600 mb-1.5 block">
              {t("lecturer.create.schedule.classTitle")}
            </span>
            <input
              className="input-base"
              placeholder={t("lecturer.create.schedule.classTitle.placeholder")}
              value={slot.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
            />
          </label>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-medium text-ink-600 mb-1.5 block">
              {t("lecturer.create.schedule.meetingURL")}
            </span>
            <input
              type="url"
              className="input-base"
              placeholder="https://meet.…"
              value={slot.meetingURL ?? ""}
              onChange={(e) => onUpdate({ meetingURL: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-ink-600 mb-1.5 block">
              {t("lecturer.create.schedule.notes")}
            </span>
            <input
              className="input-base"
              value={slot.description ?? ""}
              onChange={(e) => onUpdate({ description: e.target.value })}
            />
          </label>
        </div>
      </div>
    </article>
  );
}
