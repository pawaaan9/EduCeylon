import { apiGet, apiPost } from "@/lib/api/client";
import type { LecturerApprovalStatus, LecturerProfile } from "@/lib/api/types";

export async function fetchPendingLecturerProfiles(
  token: string,
): Promise<LecturerProfile[]> {
  return apiGet<LecturerProfile[]>("/admin/lecturers/pending", { token });
}

export async function fetchAllLecturerProfiles(
  token: string,
): Promise<LecturerProfile[]> {
  return apiGet<LecturerProfile[]>("/admin/lecturers", { token });
}

export async function reviewLecturerProfile(
  token: string,
  uid: string,
  status: Extract<LecturerApprovalStatus, "approved" | "rejected">,
  reason?: string,
): Promise<void> {
  await apiPost(`/lecturers/profiles/${uid}/review`, {
    token,
    json: { status, reason },
  });
}
