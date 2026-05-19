"use client";

import { useState } from "react";
import { CloseIcon } from "@/components/icons";
import { useT } from "@/lib/i18n/I18nProvider";

export function CourseTagInput({
  values,
  onChange,
}: {
  values: string[];
  onChange: (next: string[]) => void;
}) {
  const t = useT();
  const [draft, setDraft] = useState("");

  function add() {
    const v = draft.trim();
    if (!v) return;
    if (!values.includes(v)) onChange([...values, v]);
    setDraft("");
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-ink-200 bg-white p-2.5 focus-within:border-brand-500 focus-within:shadow-[0_0_0_4px_rgba(59,130,246,0.15)]">
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
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add();
            }
            if (e.key === "Backspace" && !draft && values.length) {
              onChange(values.slice(0, -1));
            }
          }}
          onBlur={add}
          placeholder={t("lecturer.create.tags.helper")}
          className="flex-1 min-w-[160px] bg-transparent text-sm outline-none placeholder:text-ink-400"
        />
      </div>
    </div>
  );
}
