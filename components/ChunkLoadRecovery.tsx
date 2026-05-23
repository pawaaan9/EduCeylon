"use client";

import { useEffect } from "react";

const RELOAD_FLAG = "educeylon:chunk-reload";

function isChunkLoadError(reason: unknown): boolean {
  if (!reason || typeof reason !== "object") return false;
  const err = reason as { name?: string; message?: string };
  if (err.name === "ChunkLoadError") return true;
  const message = err.message ?? "";
  return (
    message.includes("Failed to load chunk") ||
    message.includes("Loading chunk") ||
    message.includes("Importing a module script failed")
  );
}

function recoverFromChunkError() {
  try {
    if (sessionStorage.getItem(RELOAD_FLAG)) {
      sessionStorage.removeItem(RELOAD_FLAG);
      return;
    }
    sessionStorage.setItem(RELOAD_FLAG, "1");
    window.location.reload();
  } catch {
    window.location.reload();
  }
}

/** Reload once when dev HMR leaves the browser on stale JS chunks. */
export function ChunkLoadRecovery() {
  useEffect(() => {
    function onUnhandledRejection(event: PromiseRejectionEvent) {
      if (!isChunkLoadError(event.reason)) return;
      event.preventDefault();
      recoverFromChunkError();
    }

    function onError(event: ErrorEvent) {
      if (!isChunkLoadError(event.error ?? event.message)) return;
      event.preventDefault();
      recoverFromChunkError();
    }

    window.addEventListener("unhandledrejection", onUnhandledRejection);
    window.addEventListener("error", onError);
    return () => {
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
      window.removeEventListener("error", onError);
    };
  }, []);

  return null;
}
