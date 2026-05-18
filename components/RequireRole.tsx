"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { dashboardPathForRole, type AppRole } from "@/lib/firebase/auth";
import { Logo } from "./Logo";

/** Client-side route guard for /admin, /lecturer, /student. */
export function RequireRole({
  role,
  children,
}: {
  role: AppRole;
  children: React.ReactNode;
}) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user || !profile) {
      router.replace(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (profile.role !== role) {
      router.replace(dashboardPathForRole(profile.role));
    }
  }, [loading, user, profile, role, router]);

  if (loading || !profile || profile.role !== role) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-ink-50 text-ink-500">
        <Logo size="sm" />
        <div
          className="h-1 w-40 overflow-hidden rounded-full bg-ink-200"
          aria-label="Loading"
        >
          <div
            className="h-full w-1/3 brand-gradient animate-pulse"
            style={{ animationDuration: "1.2s" }}
          />
        </div>
        <p className="text-xs">Checking your access…</p>
      </div>
    );
  }

  return <>{children}</>;
}
