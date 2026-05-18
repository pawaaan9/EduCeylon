"use client";

import { useState } from "react";
import { GradientHeader } from "@/components/GradientHeader";
import { UploadIcon } from "@/components/icons";
import { CATEGORIES } from "@/lib/data/mock";
import { useT } from "@/lib/i18n/I18nProvider";
import { SUPPORTED_LOCALES, LOCALE_LABELS } from "@/lib/i18n/config";

export default function CreateCoursePage() {
  const t = useT();
  const [thumb, setThumb] = useState<string | null>(null);

  return (
    <>
      <GradientHeader
        title={t("lecturer.create.title")}
        subtitle={t("lecturer.create.subtitle")}
        actions={
          <div className="flex gap-2">
            <button className="btn border border-white/30 text-white hover:bg-white/10">
              {t("lecturer.create.draft")}
            </button>
            <button className="btn bg-white text-brand-700 hover:bg-white/90">
              {t("lecturer.create.publish")}
            </button>
          </div>
        }
      />

      <form className="grid lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 card p-6 sm:p-8 flex flex-col gap-5">
          <h2 className="text-lg font-semibold text-ink-900">
            {t("lecturer.create.basics")}
          </h2>
          <Field
            label={t("lecturer.create.title.label")}
            placeholder="e.g. A/L Combined Maths 2026"
          />
          <label className="block">
            <span className="text-sm font-medium text-ink-700 mb-1.5 block">
              {t("lecturer.create.description.label")}
            </span>
            <textarea
              rows={5}
              className="input-base h-auto py-3 resize-none"
              placeholder="Describe what students will learn in this course…"
            />
          </label>

          <div className="grid sm:grid-cols-2 gap-4">
            <Select label={t("lecturer.create.category")}>
              {CATEGORIES.map((c) => (
                <option key={c.key} value={c.key}>
                  {t(`category.${c.key}`)}
                </option>
              ))}
            </Select>
            <Select label={t("lecturer.create.level")}>
              {(["beginner", "intermediate", "advanced", "allLevels"] as const).map((l) => (
                <option key={l} value={l}>
                  {t(`level.${l}`)}
                </option>
              ))}
            </Select>
            <Select label={t("lecturer.create.language")}>
              {SUPPORTED_LOCALES.map((code) => (
                <option key={code} value={code}>
                  {LOCALE_LABELS[code].native}
                </option>
              ))}
            </Select>
            <Field label={t("lecturer.create.price")} type="number" placeholder="9500" />
          </div>
        </section>

        <aside className="card p-6 sm:p-8 flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-ink-900">
            {t("lecturer.create.thumbnail")}
          </h2>
          <label className="block">
            <div
              className="aspect-[16/9] rounded-xl border-2 border-dashed border-ink-300 hover:border-brand-500 transition-colors flex flex-col items-center justify-center text-ink-500 hover:text-brand-600 cursor-pointer overflow-hidden"
              style={
                thumb
                  ? { background: thumb }
                  : { background: "linear-gradient(135deg,#1d4ed8,#2563eb)" }
              }
            >
              {!thumb && (
                <div className="text-white text-center">
                  <UploadIcon className="h-8 w-8 mx-auto mb-2" />
                  <div className="text-sm font-medium">
                    {t("lecturer.create.upload")}
                  </div>
                  <div className="text-xs opacity-80">PNG, JPG up to 5MB</div>
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={() =>
                setThumb("linear-gradient(135deg,#0d9488,#14b8a6 70%,#5eead4)")
              }
            />
          </label>

          <div className="p-4 rounded-xl bg-brand-50 text-brand-900 text-sm">
            <strong>Tip:</strong> A high-contrast thumbnail with your course title
            boosts click-through by up to 3×.
          </div>
        </aside>
      </form>
    </>
  );
}

function Field({
  label,
  ...inputProps
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink-700 mb-1.5 block">{label}</span>
      <input className="input-base" {...inputProps} />
    </label>
  );
}

function Select({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink-700 mb-1.5 block">{label}</span>
      <select className="input-base">{children}</select>
    </label>
  );
}
