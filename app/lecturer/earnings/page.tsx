"use client";

import { GradientHeader } from "@/components/GradientHeader";
import { StatCard } from "@/components/StatCard";
import { ChartIcon, MoneyIcon } from "@/components/icons";
import { useT } from "@/lib/i18n/I18nProvider";

const LKR = new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR", maximumFractionDigits: 0 });

const PAYOUTS = [
  { date: "May 01, 2026", amount: 86400, status: "Paid" },
  { date: "Apr 01, 2026", amount: 72100, status: "Paid" },
  { date: "Mar 01, 2026", amount: 65800, status: "Paid" },
  { date: "Feb 01, 2026", amount: 54200, status: "Paid" },
];

export default function EarningsPage() {
  const t = useT();
  return (
    <>
      <GradientHeader title={t("lecturer.nav.earnings")} subtitle="Track your revenue and payout history." />
      <section className="grid sm:grid-cols-3 gap-4">
        <StatCard label="Available balance" value={LKR.format(124500)} icon={<MoneyIcon className="h-5 w-5" />} />
        <StatCard label="This month" value={LKR.format(86400)} icon={<ChartIcon className="h-5 w-5" />} tint="emerald" trend={{ value: "+18%", positive: true }} />
        <StatCard label="Lifetime earnings" value={LKR.format(1240500)} icon={<MoneyIcon className="h-5 w-5" />} tint="amber" />
      </section>
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-ink-200 font-semibold text-ink-900">Payout history</div>
        <table className="min-w-full text-sm">
          <thead className="bg-ink-50 text-xs uppercase tracking-wider text-ink-500">
            <tr>
              <th className="px-5 py-3 text-left font-semibold">Date</th>
              <th className="px-5 py-3 text-left font-semibold">Status</th>
              <th className="px-5 py-3 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {PAYOUTS.map((p) => (
              <tr key={p.date}>
                <td className="px-5 py-3.5 text-ink-700">{p.date}</td>
                <td className="px-5 py-3.5"><span className="badge badge-emerald">{p.status}</span></td>
                <td className="px-5 py-3.5 text-right font-semibold text-ink-900">{LKR.format(p.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
