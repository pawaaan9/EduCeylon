"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";
import { useI18n } from "@/lib/i18n/I18nProvider";
import {
  calendarCells,
  formatDateDisplay,
  formatMonthYear,
  isSameIso,
  parseIsoDate,
  todayIso,
  weekdayLabels,
} from "@/lib/time/date";

type PanelCoords = {
  top: number;
  left: number;
  width: number;
  placement: "below" | "above";
};

const PANEL_ESTIMATED_HEIGHT = 360;

export function DateChipPicker({
  label,
  value,
  onChange,
  className,
  disabled,
}: {
  label: string;
  value?: string;
  onChange: (iso: string | undefined) => void;
  className?: string;
  disabled?: boolean;
}) {
  const { locale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<PanelCoords | null>(null);
  const [viewYear, setViewYear] = useState(() => {
    const d = parseIsoDate(value) ?? new Date();
    return d.getFullYear();
  });
  const [viewMonth, setViewMonth] = useState(() => {
    const d = parseIsoDate(value) ?? new Date();
    return d.getMonth();
  });

  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const display = formatDateDisplay(value, locale);
  const today = todayIso();
  const cells = calendarCells(viewYear, viewMonth);
  const weekdays = weekdayLabels(locale);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const d = parseIsoDate(value) ?? new Date();
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }, [open, value]);

  const updateCoords = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const placement =
      spaceBelow < PANEL_ESTIMATED_HEIGHT && rect.top > PANEL_ESTIMATED_HEIGHT
        ? "above"
        : "below";
    const panelWidth = 300;
    const maxLeft = Math.max(8, window.innerWidth - panelWidth - 8);
    setCoords({
      top: placement === "below" ? rect.bottom + 6 : rect.top - 6,
      left: Math.min(rect.left, maxLeft),
      width: panelWidth,
      placement,
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    updateCoords();
    window.addEventListener("resize", updateCoords);
    window.addEventListener("scroll", updateCoords, true);
    return () => {
      window.removeEventListener("resize", updateCoords);
      window.removeEventListener("scroll", updateCoords, true);
    };
  }, [open, updateCoords]);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node;
      if (wrapRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  function prevMonth() {
    setViewMonth((m) => {
      if (m === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  }

  function nextMonth() {
    setViewMonth((m) => {
      if (m === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  }

  function pick(iso: string) {
    onChange(iso);
    setOpen(false);
  }

  const panel =
    open && coords && mounted ? (
      <div
        ref={panelRef}
        id={listId}
        role="dialog"
        aria-label={label}
        className="fixed z-[200] overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-card"
        style={{
          left: coords.left,
          width: coords.width,
          ...(coords.placement === "below"
            ? { top: coords.top }
            : { bottom: window.innerHeight - coords.top }),
        }}
      >
        <div className="border-b border-brand-100 bg-gradient-to-r from-brand-50 via-white to-brand-50/60 px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={prevMonth}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-600 hover:bg-white hover:text-brand-700"
              aria-label={t("datePicker.prevMonth")}
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <div className="text-sm font-bold text-ink-900">
              {formatMonthYear(viewYear, viewMonth, locale)}
            </div>
            <button
              type="button"
              onClick={nextMonth}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-600 hover:bg-white hover:text-brand-700"
              aria-label={t("datePicker.nextMonth")}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="p-3">
          <div className="mb-1 grid grid-cols-7 gap-0.5">
            {weekdays.map((wd) => (
              <div
                key={wd}
                className="py-1 text-center text-[10px] font-semibold uppercase tracking-wide text-ink-400"
              >
                {wd}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((cell) => {
              const selected = isSameIso(value, cell.iso);
              const isToday = cell.iso === today;
              return (
                <button
                  key={cell.iso}
                  type="button"
                  onClick={() => pick(cell.iso)}
                  className={`flex h-9 w-full items-center justify-center rounded-lg text-sm font-semibold tabular-nums transition-colors ${
                    selected
                      ? "brand-gradient text-white shadow-sm"
                      : isToday
                        ? "ring-2 ring-brand-400 ring-offset-1 text-brand-800 bg-brand-50"
                        : cell.inMonth
                          ? "text-ink-800 hover:bg-brand-50 hover:text-brand-800"
                          : "text-ink-300 hover:bg-ink-50"
                  }`}
                >
                  {cell.date.getDate()}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-2 border-t border-ink-100 bg-ink-50/60 px-3 py-2.5">
          <button
            type="button"
            className="btn btn-secondary flex-1 justify-center py-2 text-xs"
            onClick={() => {
              onChange(undefined);
              setOpen(false);
            }}
          >
            {t("datePicker.clear")}
          </button>
          <button
            type="button"
            className="btn btn-primary flex-1 justify-center py-2 text-xs"
            onClick={() => pick(today)}
          >
            {t("datePicker.today")}
          </button>
        </div>
      </div>
    ) : null;

  return (
    <div ref={wrapRef} className={className}>
      <span className="sr-only">{label}</span>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-ink-200 bg-gradient-to-b from-white to-ink-50/80 px-3.5 py-2.5 text-left shadow-sm transition-all hover:border-brand-400 hover:shadow-md focus:border-brand-500 focus:outline-none focus:shadow-[0_0_0_3px_rgba(59,130,246,0.12)] disabled:cursor-not-allowed disabled:bg-ink-50 disabled:text-ink-400 disabled:opacity-70"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={
          display
            ? `${label}: ${display}`
            : `${label}: ${t("datePicker.placeholder")}`
        }
      >
        <span
          className={`text-base font-bold tabular-nums tracking-tight ${
            display ? "text-ink-900" : "text-ink-400"
          }`}
        >
          {display || t("datePicker.placeholder")}
        </span>
        <CalendarIcon />
      </button>

      {mounted && panel ? createPortal(panel, document.body) : null}
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-brand-600"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
    </svg>
  );
}
