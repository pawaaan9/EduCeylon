"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CloseIcon } from "@/components/icons";
import { fetchSubCategorySuggestions } from "@/lib/api/lecturers";
import { useT } from "@/lib/i18n/I18nProvider";

function filterSuggestions(
  query: string,
  options: readonly string[],
  selected: readonly string[],
  limit = 8,
): string[] {
  const q = query.trim().toLowerCase();
  const pool = options.filter((o) => !selected.includes(o));
  if (!q) return pool.slice(0, limit);
  return pool.filter((o) => o.toLowerCase().includes(q)).slice(0, limit);
}

export function SubCategoriesInput({
  label,
  helper,
  values,
  onChange,
}: {
  label: string;
  helper?: string;
  values: string[];
  onChange: (next: string[]) => void;
}) {
  const t = useT();
  const listId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState("");
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    void fetchSubCategorySuggestions()
      .then((list) => {
        if (!cancelled) setSuggestions(list);
      })
      .catch(() => {
        if (!cancelled) setSuggestions([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const matches = filterSuggestions(draft, suggestions, values);

  function addTag(v: string) {
    const tag = v.trim();
    if (!tag || values.includes(tag)) return;
    onChange([...values, tag]);
    setDraft("");
    setOpen(false);
  }

  return (
    <div>
      <div className="text-sm font-medium text-ink-700 mb-1.5">{label}</div>
      <div ref={wrapRef} className="relative">
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-ink-200 bg-white p-2.5">
          {values.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800"
            >
              {v}
              <button
                type="button"
                onClick={() => onChange(values.filter((x) => x !== v))}
                className="inline-flex h-4 w-4 items-center justify-center rounded-full text-brand-700 hover:bg-brand-100"
                aria-label="Remove"
              >
                <CloseIcon className="h-3 w-3" />
              </button>
            </span>
          ))}
          <input
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addTag(draft);
              } else if (e.key === "Escape") {
                setOpen(false);
              }
            }}
            placeholder={t("onboard.prof.subCategories.placeholder")}
            className="flex-1 min-w-[160px] bg-transparent text-sm outline-none placeholder:text-ink-400"
            autoComplete="off"
            aria-autocomplete="list"
            aria-controls={listId}
          />
        </div>
        {open && matches.length > 0 && (
          <ul
            id={listId}
            role="listbox"
            className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-xl border border-ink-200 bg-white py-1 shadow-lg"
          >
            {matches.map((s) => (
              <li key={s} role="option">
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm text-ink-800 hover:bg-brand-50"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => addTag(s)}
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {helper && <p className="mt-1 text-xs text-ink-500">{helper}</p>}
    </div>
  );
}
