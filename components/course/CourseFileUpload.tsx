"use client";

import { useRef, useState } from "react";
import { CloseIcon, UploadIcon } from "@/components/icons";
import { uploadCourseAsset, type CourseAssetKind } from "@/lib/api/courses";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { useT } from "@/lib/i18n/I18nProvider";

export function CourseFileUpload({
  courseId,
  kind,
  label,
  accept,
  currentUrl,
  onChange,
  disabled,
  disabledHint,
}: {
  courseId?: string | null;
  kind: CourseAssetKind;
  label: string;
  accept: string;
  currentUrl?: string;
  onChange: (url: string | undefined) => void;
  disabled?: boolean;
  disabledHint?: string;
}) {
  const t = useT();
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleFile(file: File) {
    if (disabled || !courseId) return;
    if (!user) {
      setErr("You must be signed in.");
      return;
    }
    setUploading(true);
    setErr(null);
    try {
      const token = await user.getIdToken();
      const url = await uploadCourseAsset(token, courseId, kind, file);
      onChange(url);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <div className="text-sm font-medium text-ink-700 mb-1.5">{label}</div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleFile(f);
        }}
      />

      {currentUrl ? (
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={currentUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs text-ink-700 hover:border-ink-300 max-w-full"
          >
            <span className="truncate">{decodeFileName(currentUrl)}</span>
          </a>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="btn btn-secondary btn-sm h-9 text-xs"
          >
            <UploadIcon className="h-4 w-4" />
            {uploading
              ? t("onboard.upload.uploading")
              : t("onboard.upload.replace")}
          </button>
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100 hover:text-rose-600"
            aria-label="Remove"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
      ) : disabled ? (
        <p className="text-xs text-ink-500">{disabledHint}</p>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="btn btn-secondary"
        >
          <UploadIcon className="h-4 w-4" />
          {uploading ? t("onboard.upload.uploading") : t("onboard.upload.select")}
        </button>
      )}

      {err && <p className="mt-2 text-xs text-rose-600">{err}</p>}
    </div>
  );
}

function decodeFileName(url: string): string {
  try {
    const u = new URL(url);
    const path = decodeURIComponent(u.pathname);
    return path.split("/").pop() || url;
  } catch {
    return url;
  }
}
