"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { GradientHeader } from "@/components/GradientHeader";
import { Avatar } from "@/components/Avatar";
import { LecturerApprovalReview } from "@/components/admin/LecturerApprovalReview";
import {
  fetchAllLecturerProfiles,
  fetchPendingLecturerProfiles,
  reviewLecturerProfile,
} from "@/lib/api/admin-lecturers";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { useT } from "@/lib/i18n/I18nProvider";
import type { LecturerApprovalStatus, LecturerProfile } from "@/lib/api/types";

function statusBadgeClass(status: LecturerApprovalStatus): string {
  switch (status) {
    case "approved":
      return "badge-emerald";
    case "pending":
      return "badge-amber";
    case "rejected":
      return "badge-rose";
    default:
      return "badge-slate";
  }
}

function LecturerRow({
  profile,
  active,
  statusLabel,
  actionLabel,
  onClick,
}: {
  profile: LecturerProfile;
  active?: boolean;
  statusLabel: string;
  actionLabel: string;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={`flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-brand-50/50 ${
          active ? "bg-brand-50" : ""
        }`}
      >
        {profile.photoURL ? (
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-ink-200 bg-ink-100">
            <Image
              src={profile.photoURL}
              alt=""
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        ) : (
          <Avatar name={profile.displayName ?? "?"} size={48} />
        )}
        <div className="min-w-0 flex-1">
          <div className="font-medium text-ink-900 truncate">
            {profile.displayName ?? profile.email ?? profile.uid}
          </div>
          <div className="text-sm text-ink-500 truncate">
            {profile.mainSubject}
            {profile.district ? ` · ${profile.district}` : ""}
          </div>
          {profile.email && (
            <p className="text-xs text-ink-400 mt-0.5 truncate">{profile.email}</p>
          )}
        </div>
        <span className={`badge shrink-0 ${statusBadgeClass(profile.approvalStatus)}`}>
          {statusLabel}
        </span>
        <span className="text-xs font-semibold text-brand-700 shrink-0">
          {actionLabel} →
        </span>
      </button>
    </li>
  );
}

export default function AdminLecturersPage() {
  const t = useT();
  const { user } = useAuth();
  const [pending, setPending] = useState<LecturerProfile[]>([]);
  const [all, setAll] = useState<LecturerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<LecturerProfile | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      const [pendingList, allList] = await Promise.all([
        fetchPendingLecturerProfiles(token),
        fetchAllLecturerProfiles(token),
      ]);
      setPending(pendingList);
      setAll(allList);
      setSelected((cur) =>
        cur ? allList.find((p) => p.uid === cur.uid) ?? null : null,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleReview(
    uid: string,
    status: "approved" | "rejected",
    reason?: string,
  ) {
    if (!user) return;
    setBusy(true);
    try {
      const token = await user.getIdToken();
      await reviewLecturerProfile(token, uid, status, reason);
      setSelected(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBusy(false);
    }
  }

  function statusLabel(status: LecturerApprovalStatus): string {
    return t(`admin.lecturers.status.${status}`);
  }

  return (
    <>
      <GradientHeader
        title={t("admin.nav.lecturers")}
        subtitle={t("admin.lecturers.subtitle")}
      />

      {error && (
        <p className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </p>
      )}

      {pending.length > 0 && (
        <section className="card overflow-hidden mb-6">
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <div>
            <h2 className="font-semibold text-ink-900">
              {t("admin.lecturers.pendingTitle")}
            </h2>
            <p className="text-sm text-ink-500">{t("admin.lecturers.pendingHint")}</p>
          </div>
          <span className="badge badge-amber tabular-nums">{pending.length}</span>
        </div>

          <ul className="divide-y divide-ink-100">
            {pending.map((p) => (
              <LecturerRow
                key={p.uid}
                profile={p}
                active={selected?.uid === p.uid}
                statusLabel={statusLabel("pending")}
                actionLabel={t("admin.action.review")}
                onClick={() => setSelected(p)}
              />
            ))}
          </ul>
        </section>
      )}

      <section className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <div>
            <h2 className="font-semibold text-ink-900">
              {t("admin.lecturers.allTitle")}
            </h2>
            <p className="text-sm text-ink-500">{t("admin.lecturers.allHint")}</p>
          </div>
          <span className="badge badge-slate tabular-nums">{all.length}</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-ink-500">
            {t("admin.lecturers.loading")}
          </div>
        ) : all.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink-500">
            {t("admin.lecturers.allEmpty")}
          </div>
        ) : (
          <ul className="divide-y divide-ink-100">
            {all.map((p) => (
              <LecturerRow
                key={p.uid}
                profile={p}
                active={selected?.uid === p.uid}
                statusLabel={statusLabel(p.approvalStatus)}
                actionLabel={
                  p.approvalStatus === "pending"
                    ? t("admin.action.review")
                    : t("admin.action.view")
                }
                onClick={() => setSelected(p)}
              />
            ))}
          </ul>
        )}
      </section>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/40 p-4 sm:items-center">
          <div
            className="w-full max-w-3xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="lecturer-review-title"
          >
            <LecturerApprovalReview
              profile={selected}
              busy={busy}
              readOnly={selected.approvalStatus !== "pending"}
              onClose={() => setSelected(null)}
              onApprove={() => void handleReview(selected.uid, "approved")}
              onReject={(reason) =>
                void handleReview(selected.uid, "rejected", reason)
              }
            />
          </div>
        </div>
      )}
    </>
  );
}
