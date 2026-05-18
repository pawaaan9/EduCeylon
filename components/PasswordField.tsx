"use client";

import { useId, useState } from "react";
import { useT } from "@/lib/i18n/I18nProvider";

export function PasswordField({
  label,
  labelAside,
  className,
  ...inputProps
}: {
  label: string;
  labelAside?: React.ReactNode;
  className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">) {
  const t = useT();
  const id = useId();
  const [visible, setVisible] = useState(false);

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-1.5 gap-2">
        <label htmlFor={id} className="text-sm font-medium text-ink-700">
          {label}
        </label>
        {labelAside}
      </div>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          className="input-base pr-10"
          {...inputProps}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-0.5 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100/90 hover:text-ink-800 transition-colors"
          aria-label={visible ? t("auth.hidePassword") : t("auth.showPassword")}
          aria-pressed={visible}
        >
          <i
            className={`fa-solid ${visible ? "fa-eye-slash" : "fa-eye"} text-base leading-none`}
            aria-hidden
          />
        </button>
      </div>
    </div>
  );
}
