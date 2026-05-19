import type { User } from "firebase/auth";

import { apiGet, apiPatch, apiPost } from "@/lib/api/client";
import type {
  LecturerProfile,
  LecturerProfileResponse,
  OnboardingMeta,
  UploadKey,
} from "@/lib/api/types";

export type QualificationSuggestions = {
  titles: string[];
  institutes: string[];
};

export async function fetchQualificationSuggestions(): Promise<QualificationSuggestions> {
  return apiGet<QualificationSuggestions>(
    "/lecturers/qualification-suggestions",
  );
}

export async function fetchSubCategorySuggestions(): Promise<string[]> {
  return apiGet<string[]>("/lecturers/sub-category-suggestions");
}

export async function fetchMyLecturerProfile(
  token: string,
): Promise<LecturerProfileResponse | null> {
  return apiGet<LecturerProfileResponse | null>("/lecturers/me", { token });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Load lecturer profile with retries. Right after sign-in the ID token can lag;
 * forcing refresh on retries clears intermittent 401s and avoids long waits on failure.
 */
export async function fetchMyLecturerProfileForUser(
  user: User,
  opts?: { attempts?: number },
): Promise<LecturerProfileResponse | null> {
  const attempts = opts?.attempts ?? 2;
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const forceRefresh = attempt > 0;
      const token = await user.getIdToken(forceRefresh);
      return await fetchMyLecturerProfile(token);
    } catch (e) {
      lastError = e;
      if (attempt < attempts - 1) {
        await delay(250 * (attempt + 1));
      }
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error("Could not load lecturer profile");
}

export async function saveMyLecturerProfile(
  token: string,
  patch: Partial<LecturerProfile>,
): Promise<LecturerProfileResponse> {
  return apiPatch<LecturerProfileResponse>("/lecturers/me/profile", {
    token,
    json: { profile: patch },
  });
}

export async function evaluateMyLecturerProfile(
  token: string,
  profile: Partial<LecturerProfile>,
): Promise<LecturerProfileResponse> {
  return apiPost<LecturerProfileResponse>("/lecturers/me/profile/evaluate", {
    token,
    json: { profile },
  });
}

export async function submitMyLecturerProfile(
  token: string,
): Promise<LecturerProfileResponse> {
  return apiPost<LecturerProfileResponse>("/lecturers/me/profile/submit", {
    token,
  });
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Could not read file"));
        return;
      }
      const base64 = result.split(",")[1];
      if (!base64) {
        reject(new Error("Could not encode file"));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error ?? new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

export async function uploadLecturerAsset(
  token: string,
  key: UploadKey,
  file: File,
): Promise<string> {
  const dataBase64 = await fileToBase64(file);
  const { url } = await apiPost<{ url: string }>("/lecturers/me/assets", {
    token,
    json: {
      key,
      fileName: file.name,
      contentType: file.type || "application/octet-stream",
      dataBase64,
    },
  });
  return url;
}

export type { LecturerProfile, OnboardingMeta, UploadKey };
