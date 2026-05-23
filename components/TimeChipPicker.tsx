"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  HOURS_12,
  MINUTES,
  formatTime12,
  parseTime24,
  toTime24,
  type Time12Parts,
} from "@/lib/time/format";

type PanelCoords = {
  top: number;
  left: number;
  width: number;
  placement: "below" | "above";
};

const PANEL_ESTIMATED_HEIGHT = 240;

export function TimeChipPicker({
  label,
  value,
  onChange,
  className,
}: {
  label: string;
  value: string;
  onChange: (time24: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<PanelCoords | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const parts =
    parseTime24(value) ??
    ({ hour12: 8, minute: 0, period: "AM" } satisfies Time12Parts);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updateCoords = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const placement =
      spaceBelow < PANEL_ESTIMATED_HEIGHT && rect.top > PANEL_ESTIMATED_HEIGHT
        ? "above"
        : "below";
    const maxLeft = Math.max(8, window.innerWidth - 264);
    setCoords({
      top:
        placement === "below"
          ? rect.bottom + 6
          : rect.top - 6,
      left: Math.min(rect.left, maxLeft),
      width: Math.max(rect.width, 256),
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

  function apply(next: Partial<Time12Parts>) {
    onChange(toTime24({ ...parts, ...next }));
  }

  const panel =
    open && coords && mounted ? (
      <div
        ref={panelRef}
        id={listId}
        role="dialog"
        aria-label={label}
        className="fixed z-[200] rounded-xl border border-ink-200 bg-white p-3 shadow-card"
        style={{
          left: coords.left,
          width: coords.width,
          ...(coords.placement === "below"
            ? { top: coords.top }
            : { bottom: window.innerHeight - coords.top }),
        }}
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
          className="btn btn-primary mt-2 w-full justify-center py-2 text-xs"
          onClick={() => setOpen(false)}
        >
          Done
        </button>
      </div>
    ) : null;

  return (
    <div ref={wrapRef} className={`relative ${className ?? "min-w-[7.5rem]"}`}>
      <span className="sr-only">{label}</span>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-ink-200 bg-gradient-to-b from-white to-ink-50/80 px-3.5 py-2.5 text-left shadow-sm transition-all hover:border-brand-400 hover:shadow-md focus:border-brand-500 focus:outline-none focus:shadow-[0_0_0_3px_rgba(59,130,246,0.12)]"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`${label}: ${formatTime12(value)}`}
      >
        <span className="text-base font-bold tabular-nums tracking-tight text-ink-900">
          {formatTime12(value)}
        </span>
        <ClockIcon />
      </button>

      {mounted && panel ? createPortal(panel, document.body) : null}
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
      <div className="max-h-28 overflow-y-auto rounded-lg bg-ink-50 p-0.5 scrollbar-thin">
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
