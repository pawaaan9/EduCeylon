"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ImageCropModal } from "@/components/ImageCropModal";
import { CloseIcon, UploadIcon } from "@/components/icons";
import { uploadCourseAsset } from "@/lib/api/courses";
import {
  IMAGE_CROP_PRESETS,
  type ImageCropPresetKey,
} from "@/lib/image/crop-presets";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { useT } from "@/lib/i18n/I18nProvider";

type Aspect = "square" | "cover" | "wide";

const ASPECT_CLASS: Record<Aspect, string> = {
  square: "aspect-square",
  cover: "aspect-[16/9]",
  wide: "aspect-[21/9]",
};

const CROP_PRESET_BY_KIND: Record<"thumbnail" | "cover", ImageCropPresetKey> = {
  thumbnail: "courseThumbnail",
  cover: "courseBanner",
};

export function CourseAssetUpload({
  courseId,
  kind,
  label,
  helper,
  currentUrl,
  onChange,
  onPickFile,
  onClearPending,
  aspect = "cover",
}: {
  /** When omitted, files are kept locally until the course is saved. */
  courseId?: string | null;
  kind: "thumbnail" | "cover";
  label: string;
  helper?: string;
  currentUrl?: string;
  onChange: (url: string | undefined) => void | Promise<void>;
  /** Called when picking a file before the course exists in the database. */
  onPickFile?: (file: File) => void;
  onClearPending?: () => void;
  aspect?: Aspect;
}) {
  const t = useT();
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [pendingName, setPendingName] = useState("image.jpg");
  const preset = IMAGE_CROP_PRESETS[CROP_PRESET_BY_KIND[kind]];
  const uploadLabel =
    kind === "cover" ? t("lecturer.create.uploadCover") : t("lecturer.create.upload");

  useEffect(() => {
    return () => {
      if (cropSrc?.startsWith("blob:") && cropSrc !== currentUrl) {
        URL.revokeObjectURL(cropSrc);
      }
    };
  }, [cropSrc, currentUrl]);

  function closeCrop() {
    if (cropSrc?.startsWith("blob:") && cropSrc !== currentUrl) {
      URL.revokeObjectURL(cropSrc);
    }
    setCropSrc(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function onFileChosen(file: File) {
    setErr(null);
    const base = file.name.replace(/\.[^.]+$/, "") || kind;
    setPendingName(`${base}.jpg`);
    setCropSrc(URL.createObjectURL(file));
  }

  function openRecrop() {
    if (!currentUrl) return;
    setErr(null);
    setPendingName(`${kind}.jpg`);
    setCropSrc(currentUrl);
  }

  async function applyFile(file: File) {
    if (!user) {
      setErr("You must be signed in.");
      return;
    }
    setUploading(true);
    setErr(null);
    try {
      if (!courseId) {
        onPickFile?.(file);
        if (currentUrl?.startsWith("blob:")) URL.revokeObjectURL(currentUrl);
        await onChange(URL.createObjectURL(file));
        return;
      }
      const token = await user.getIdToken();
      const url = await uploadCourseAsset(token, courseId, kind, file);
      if (currentUrl?.startsWith("blob:")) URL.revokeObjectURL(currentUrl);
      await onChange(url);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleRemove() {
    if (currentUrl?.startsWith("blob:")) URL.revokeObjectURL(currentUrl);
    onClearPending?.();
    void onChange(undefined);
    setErr(null);
  }

  return (
    <>
      <div>
        <div className="text-sm font-medium text-ink-700 mb-2">{label}</div>
        <div
          className={`relative overflow-hidden rounded-xl border-2 border-dashed border-ink-300 bg-ink-50 ${ASPECT_CLASS[aspect]} ${
            uploading ? "opacity-60" : "hover:border-brand-400"
          }`}
        >
          {currentUrl ? (
            <>
              <Image
                src={currentUrl}
                alt={label}
                fill
                sizes="(max-width: 768px) 100vw, 600px"
                className="object-cover"
                unoptimized
                priority={kind === "thumbnail"}
              />
              <button
                type="button"
                onClick={handleRemove}
                disabled={uploading || Boolean(cropSrc)}
                className="absolute top-2 right-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white shadow-sm hover:bg-black/80 disabled:opacity-50"
                aria-label={t("onboard.upload.remove")}
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading || Boolean(cropSrc)}
              className="absolute inset-0 flex flex-col items-center justify-center text-ink-500 hover:text-brand-700 transition-colors"
            >
              <UploadIcon className="h-8 w-8" />
              <span className="mt-2 text-sm font-medium">
                {uploading ? t("onboard.upload.uploading") : uploadLabel}
              </span>
              {helper && <span className="mt-1 text-xs opacity-70">{helper}</span>}
            </button>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFileChosen(f);
          }}
        />

        {currentUrl && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading || Boolean(cropSrc)}
              className="btn btn-secondary btn-sm h-9 text-xs"
            >
              <UploadIcon className="h-4 w-4" />
              {uploading
                ? t("onboard.upload.uploading")
                : t("onboard.upload.replace")}
            </button>
            <button
              type="button"
              onClick={openRecrop}
              disabled={uploading || Boolean(cropSrc)}
              className="btn btn-secondary btn-sm h-9 text-xs"
            >
              {t("onboard.crop.action")}
            </button>
            {helper && <span className="text-xs text-ink-500">{helper}</span>}
          </div>
        )}

        {err && <p className="mt-2 text-xs text-rose-600">{err}</p>}
      </div>

      {cropSrc && (
        <ImageCropModal
          open
          imageSrc={cropSrc}
          preset={preset}
          fileName={pendingName}
          onClose={closeCrop}
          onConfirm={applyFile}
        />
      )}
    </>
  );
}
