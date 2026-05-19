import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/client";
import type { LecturerCourse } from "@/lib/courses/types";

export type CourseAssetKind =
  | "thumbnail"
  | "cover"
  | "lessonVideo"
  | "lessonPdf";

export async function listMyCourses(token: string): Promise<LecturerCourse[]> {
  return apiGet<LecturerCourse[]>("/lecturers/me/courses", { token });
}

export async function getMyCourse(
  token: string,
  id: string,
): Promise<LecturerCourse> {
  return apiGet<LecturerCourse>(`/lecturers/me/courses/${id}`, { token });
}

export async function createMyCourse(
  token: string,
  course: Partial<LecturerCourse>,
): Promise<LecturerCourse> {
  return apiPost<LecturerCourse>("/lecturers/me/courses", {
    token,
    json: { course },
  });
}

export async function updateMyCourse(
  token: string,
  id: string,
  course: Partial<LecturerCourse>,
): Promise<LecturerCourse> {
  return apiPatch<LecturerCourse>(`/lecturers/me/courses/${id}`, {
    token,
    json: { course },
  });
}

export async function deleteMyCourse(token: string, id: string): Promise<void> {
  await apiDelete<{ id: string }>(`/lecturers/me/courses/${id}`, { token });
}

export async function publishMyCourse(
  token: string,
  id: string,
): Promise<LecturerCourse> {
  return apiPost<LecturerCourse>(`/lecturers/me/courses/${id}/publish`, {
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

export async function uploadCourseAsset(
  token: string,
  id: string,
  kind: CourseAssetKind,
  file: File,
): Promise<string> {
  const dataBase64 = await fileToBase64(file);
  const { url } = await apiPost<{ url: string }>(
    `/lecturers/me/courses/${id}/assets`,
    {
      token,
      json: {
        kind,
        fileName: file.name,
        contentType: file.type || "application/octet-stream",
        dataBase64,
      },
    },
  );
  return url;
}
