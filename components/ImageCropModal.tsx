"use client";

import { useCallback, useEffect, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { CloseIcon } from "@/components/icons";
import { useT } from "@/lib/i18n/I18nProvider";
import type { ImageCropPreset } from "@/lib/image/crop-presets";
import { cropImageToFile } from "@/lib/image/crop-to-file";

export function ImageCropModal({
  open,
  imageSrc,
  preset,
  fileName,
  onClose,
  onConfirm,
}: {
  open: boolean;
  imageSrc: string;
  preset: ImageCropPreset;
  fileName: string;
  onClose: () => void;
  onConfirm: (file: File) => void | Promise<void>;
}) {
  const t = useT();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedArea(null);
    setError(null);
  }, [open, imageSrc]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !applying) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, applying, onClose]);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedArea(pixels);
  }, []);

  async function handleApply() {
    if (!croppedArea) return;
    setApplying(true);
    setError(null);
    try {
      const file = await cropImageToFile(
        imageSrc,
        croppedArea,
        preset.outputWidth,
        preset.outputHeight,
        fileName,
      );
      await onConfirm(file);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not crop image");
    } finally {
      setApplying(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" aria-hidden onClick={() => !applying && onClose()} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="image-crop-title"
        className="relative flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-ink-200 px-5 py-4">
          <div>
            <h2 id="image-crop-title" className="text-lg font-semibold text-ink-900">
              {t(preset.titleKey)}
            </h2>
            <p className="mt-0.5 text-xs text-ink-500">{t(preset.hintKey)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={applying}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100 disabled:opacity-50"
            aria-label={t("onboard.crop.cancel")}
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="relative h-[min(52vh,360px)] bg-ink-900">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={preset.aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            objectFit="contain"
          />
        </div>

        <div className="space-y-3 border-t border-ink-200 px-5 py-4">
          <label className="flex items-center gap-3 text-sm text-ink-700">
            <span className="w-12 shrink-0 font-medium">{t("onboard.crop.zoom")}</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="h-2 flex-1 cursor-pointer accent-brand-600"
            />
          </label>
          {error && (
            <p role="alert" className="text-sm text-rose-600">
              {error}
            </p>
          )}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="btn btn-secondary w-full sm:w-auto"
              onClick={onClose}
              disabled={applying}
            >
              {t("onboard.crop.cancel")}
            </button>
            <button
              type="button"
              className="btn btn-primary w-full sm:w-auto"
              onClick={() => void handleApply()}
              disabled={applying || !croppedArea}
            >
              {applying ? t("onboard.upload.uploading") : t("onboard.crop.apply")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
