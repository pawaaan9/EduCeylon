"use client";

import { GradientHeader } from "@/components/GradientHeader";
import { PlusIcon } from "@/components/icons";
import { CATEGORIES } from "@/lib/data/mock";
import { useT } from "@/lib/i18n/I18nProvider";

export default function CategoriesPage() {
  const t = useT();
  return (
    <>
      <GradientHeader
        title={t("admin.nav.categories")}
        subtitle="Organise the marketplace into discoverable categories."
        actions={<button className="btn bg-white text-brand-700 hover:bg-white/90"><PlusIcon className="h-4 w-4" /> Add category</button>}
      />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {CATEGORIES.map((c, idx) => (
          <div key={c.key} className="card overflow-hidden">
            <div className="h-24" style={{ background: c.gradient }} />
            <div className="p-5">
              <h3 className="font-semibold text-ink-900">{t(`category.${c.key}`)}</h3>
              <div className="text-xs text-ink-500 mt-1">{[42, 38, 51, 27, 19, 33, 24][idx] ?? 30} courses</div>
              <div className="mt-4 flex gap-2">
                <button className="btn btn-secondary h-9 text-xs flex-1">{t("action.edit")}</button>
                <button className="btn btn-ghost h-9 text-xs">{t("action.delete")}</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
