"use client";

import {
  NATIONAL_PHONE_DIGITS,
  phoneFromNationalPart,
  phoneNationalPart,
  sanitizeNationalPhoneInput,
} from "@/lib/phone/sri-lanka";

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  error?: string;
};

export function SriLankaPhoneField({
  label,
  value,
  onChange,
  required,
  disabled,
  error,
}: Props) {
  const national = phoneNationalPart(value);

  function handleNationalChange(raw: string) {
    const digits = sanitizeNationalPhoneInput(raw);
    const next = phoneFromNationalPart(digits);
    onChange(next ?? "");
  }

  return (
    <label className="block">
      <span className="text-sm font-medium text-ink-700 mb-1.5 block">{label}</span>
      <div
        className={`flex overflow-hidden rounded-xl border bg-white focus-within:border-brand-500 focus-within:shadow-[0_0_0_4px_rgba(59,130,246,0.15)] ${
          error ? "border-rose-300 focus-within:border-rose-400" : "border-ink-200"
        }`}
      >
        <span
          className={`inline-flex items-center border-r border-ink-200 bg-ink-50 px-3 text-sm font-semibold text-ink-700 ${
            disabled ? "text-ink-400" : ""
          }`}
          aria-hidden
        >
          +94
        </span>
        <input
          className={`min-w-0 flex-1 border-0 bg-transparent px-3 py-2.5 text-sm text-ink-900 outline-none placeholder:text-ink-400 ${
            disabled ? "cursor-not-allowed text-ink-400" : ""
          }`}
          type="text"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="7X XXX XXXX"
          value={national}
          required={required}
          disabled={disabled}
          maxLength={NATIONAL_PHONE_DIGITS}
          aria-invalid={error ? true : undefined}
          onChange={(e) => handleNationalChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.ctrlKey || e.metaKey) return;
            const allowed = [
              "Backspace",
              "Delete",
              "Tab",
              "ArrowLeft",
              "ArrowRight",
              "Home",
              "End",
            ];
            if (allowed.includes(e.key)) return;
            if (e.key.length === 1 && !/\d/.test(e.key)) e.preventDefault();
          }}
          onPaste={(e) => {
            e.preventDefault();
            const text = e.clipboardData.getData("text");
            handleNationalChange(text);
          }}
        />
      </div>
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </label>
  );
}
