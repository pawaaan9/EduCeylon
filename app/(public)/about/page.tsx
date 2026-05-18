"use client";

import { useT } from "@/lib/i18n/I18nProvider";
import { BoltIcon, GlobeIcon, ShieldIcon, UsersIcon } from "@/components/icons";

export default function AboutPage() {
  const t = useT();
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold tracking-tight text-ink-900">
        About EduCeylon
      </h1>
      <p className="mt-4 text-lg text-ink-600 leading-relaxed">
        {t("brand.tagline")}. EduCeylon connects Sri Lankan students with the
        best lecturers in the country — across O/L, A/L, language and
        professional courses — in their preferred language.
      </p>

      <div className="mt-12 grid sm:grid-cols-2 gap-6">
        <Pillar
          icon={<UsersIcon className="h-6 w-6" />}
          title="Multi-lecturer marketplace"
          desc="A single platform where 150+ verified lecturers publish their courses, schedule live classes and grow their student base."
        />
        <Pillar
          icon={<GlobeIcon className="h-6 w-6" />}
          title="Trilingual by design"
          desc="Every page, button and notification works in Sinhala, Tamil and English. Switch any time."
        />
        <Pillar
          icon={<ShieldIcon className="h-6 w-6" />}
          title="Verified & trusted"
          desc="Every lecturer is reviewed by our admin team before going live. Quality you can trust."
        />
        <Pillar
          icon={<BoltIcon className="h-6 w-6" />}
          title="Pay-as-you-grow"
          desc="Pick individual lecture series or full bundles. Lifetime access on every purchase."
        />
      </div>
    </div>
  );
}

function Pillar({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="card p-6">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
        {icon}
      </div>
      <h3 className="mt-4 font-semibold text-ink-900 text-lg">{title}</h3>
      <p className="mt-2 text-ink-600 leading-relaxed">{desc}</p>
    </div>
  );
}
