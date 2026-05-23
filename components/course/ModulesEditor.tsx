"use client";

import { useState } from "react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  GripIcon,
  PlusIcon,
  TrashIcon,
} from "@/components/icons";
import { CourseFileUpload } from "@/components/course/CourseFileUpload";
import { DateChipPicker } from "@/components/DateChipPicker";
import {
  LESSON_TYPE_OPTIONS,
  newClientId,
  type CourseModule,
  type Lesson,
  type LessonType,
} from "@/lib/courses/types";
import { useT } from "@/lib/i18n/I18nProvider";

type DragState = { moduleId: string; lessonId: string } | null;

export function ModulesEditor({
  courseId,
  modules,
  onChange,
}: {
  courseId?: string | null;
  modules: CourseModule[];
  onChange: (next: CourseModule[]) => void;
}) {
  const t = useT();
  const [drag, setDrag] = useState<DragState>(null);

  function addModule() {
    onChange([
      ...modules,
      {
        id: newClientId("mod"),
        title: "",
        lessons: [],
      },
    ]);
  }

  function updateModule(id: string, patch: Partial<CourseModule>) {
    onChange(modules.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }

  function removeModule(id: string) {
    onChange(modules.filter((m) => m.id !== id));
  }

  function moveModule(id: string, dir: -1 | 1) {
    const idx = modules.findIndex((m) => m.id === id);
    const target = idx + dir;
    if (idx < 0 || target < 0 || target >= modules.length) return;
    const next = modules.slice();
    [next[idx], next[target]] = [next[target]!, next[idx]!];
    onChange(next);
  }

  function addLesson(moduleId: string, type: LessonType = "video") {
    onChange(
      modules.map((m) =>
        m.id === moduleId
          ? {
              ...m,
              lessons: [
                ...m.lessons,
                emptyLesson(type),
              ],
            }
          : m,
      ),
    );
  }

  function updateLesson(
    moduleId: string,
    lessonId: string,
    patch: Partial<Lesson>,
  ) {
    onChange(
      modules.map((m) =>
        m.id === moduleId
          ? {
              ...m,
              lessons: m.lessons.map((l) =>
                l.id === lessonId ? { ...l, ...patch } : l,
              ),
            }
          : m,
      ),
    );
  }

  function removeLesson(moduleId: string, lessonId: string) {
    onChange(
      modules.map((m) =>
        m.id === moduleId
          ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) }
          : m,
      ),
    );
  }

  function reorderLessons(moduleId: string, fromId: string, toId: string) {
    if (fromId === toId) return;
    onChange(
      modules.map((m) => {
        if (m.id !== moduleId) return m;
        const fromIdx = m.lessons.findIndex((l) => l.id === fromId);
        const toIdx = m.lessons.findIndex((l) => l.id === toId);
        if (fromIdx < 0 || toIdx < 0) return m;
        const next = m.lessons.slice();
        const [moved] = next.splice(fromIdx, 1);
        next.splice(toIdx, 0, moved!);
        return { ...m, lessons: next };
      }),
    );
  }

  return (
    <div className="grid gap-4">
      {modules.length === 0 ? (
        <div className="rounded-xl border border-dashed border-ink-300 bg-ink-50 p-8 text-center text-sm text-ink-500">
          {t("lecturer.create.module.empty")}
        </div>
      ) : (
        modules.map((mod, mi) => (
          <div
            key={mod.id}
            className="rounded-xl border border-ink-200 bg-white p-4 sm:p-5"
          >
            <div className="flex items-start gap-3">
              <div className="mt-2 flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => moveModule(mod.id, -1)}
                  disabled={mi === 0}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md text-ink-500 hover:bg-ink-100 disabled:opacity-30"
                  aria-label="Move up"
                >
                  <ChevronUpIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveModule(mod.id, 1)}
                  disabled={mi === modules.length - 1}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md text-ink-500 hover:bg-ink-100 disabled:opacity-30"
                  aria-label="Move down"
                >
                  <ChevronDownIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-ink-500">
                    {String(mi + 1).padStart(2, "0")}
                  </span>
                  <input
                    value={mod.title}
                    onChange={(e) => updateModule(mod.id, { title: e.target.value })}
                    placeholder={t("lecturer.create.module.title")}
                    className="input-base flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => removeModule(mod.id)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-ink-500 hover:bg-rose-50 hover:text-rose-600"
                    aria-label={t("lecturer.create.module.remove")}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4 grid gap-3">
                  {mod.lessons.length === 0 ? (
                    <div className="rounded-lg bg-ink-50 px-4 py-3 text-xs text-ink-500">
                      {t("lecturer.create.lesson.empty")}
                    </div>
                  ) : (
                    mod.lessons.map((lesson) => (
                      <LessonRow
                        key={lesson.id}
                        courseId={courseId}
                        moduleId={mod.id}
                        lesson={lesson}
                        onUpdate={(patch) => updateLesson(mod.id, lesson.id, patch)}
                        onRemove={() => removeLesson(mod.id, lesson.id)}
                        onDragStart={() => setDrag({ moduleId: mod.id, lessonId: lesson.id })}
                        onDragOver={(e) => {
                          if (drag?.moduleId === mod.id) e.preventDefault();
                        }}
                        onDrop={() => {
                          if (drag?.moduleId === mod.id) {
                            reorderLessons(mod.id, drag.lessonId, lesson.id);
                          }
                          setDrag(null);
                        }}
                      />
                    ))
                  )}

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => addLesson(mod.id, "video")}
                      className="btn btn-secondary btn-sm h-9 text-xs"
                    >
                      <PlusIcon className="h-4 w-4" />
                      {t("lecturer.create.lesson.add")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))
      )}

      <div>
        <button
          type="button"
          onClick={addModule}
          className="btn btn-secondary"
        >
          <PlusIcon className="h-4 w-4" />
          {t("lecturer.create.module.add")}
        </button>
      </div>
    </div>
  );
}

function emptyLesson(type: LessonType): Lesson {
  return {
    id: newClientId("les"),
    type,
    title: "",
  };
}

function LessonRow({
  courseId,
  moduleId,
  lesson,
  onUpdate,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
}: {
  courseId?: string | null;
  moduleId: string;
  lesson: Lesson;
  onUpdate: (patch: Partial<Lesson>) => void;
  onRemove: () => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
}) {
  const t = useT();
  void moduleId;
  const uploadsDisabled = !courseId;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="rounded-lg border border-ink-200 bg-white p-3"
    >
      <div className="flex items-start gap-2">
        <span className="mt-2 cursor-grab text-ink-400" aria-hidden>
          <GripIcon className="h-4 w-4" />
        </span>

        <div className="flex-1 grid gap-3">
          <div className="grid gap-3 sm:grid-cols-[1fr_180px_auto] items-center">
            <input
              value={lesson.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder={t("lecturer.create.lesson.title")}
              className="input-base"
            />
            <select
              value={lesson.type}
              onChange={(e) => onUpdate({ type: e.target.value as LessonType })}
              className="input-base select-base"
              aria-label={t("lecturer.create.lesson.type")}
            >
              {LESSON_TYPE_OPTIONS.map((tp) => (
                <option key={tp} value={tp}>
                  {t(`lecturer.create.lessonType.${tp}`)}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={onRemove}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-ink-500 hover:bg-rose-50 hover:text-rose-600"
              aria-label={t("lecturer.create.lesson.remove")}
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>

          <textarea
            value={lesson.description ?? ""}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder={t("lecturer.create.lesson.description")}
            rows={2}
            className="textarea-base min-h-[72px]"
          />

          {(lesson.type === "video" || lesson.type === "pdf") && (
            <div className="grid gap-3 sm:grid-cols-[1fr_180px_auto] items-end">
              {lesson.type === "video" ? (
                <CourseFileUpload
                  courseId={courseId}
                  kind="lessonVideo"
                  label={t("lecturer.create.lesson.video")}
                  accept="video/*"
                  currentUrl={lesson.videoURL}
                  onChange={(url) => onUpdate({ videoURL: url })}
                  disabled={uploadsDisabled}
                  disabledHint={t("lecturer.create.saveBeforeUpload")}
                />
              ) : (
                <CourseFileUpload
                  courseId={courseId}
                  kind="lessonPdf"
                  label={t("lecturer.create.lesson.pdf")}
                  accept="application/pdf,.pdf"
                  currentUrl={lesson.pdfURL}
                  onChange={(url) => onUpdate({ pdfURL: url })}
                  disabled={uploadsDisabled}
                  disabledHint={t("lecturer.create.saveBeforeUpload")}
                />
              )}
              <NumberField
                label={t("lecturer.create.lesson.duration")}
                value={lesson.durationMinutes ?? ""}
                onChange={(v) => onUpdate({ durationMinutes: v })}
              />
              <FreePreviewToggle
                value={!!lesson.freePreview}
                onChange={(v) => onUpdate({ freePreview: v })}
              />
            </div>
          )}

          {lesson.type === "external" && (
            <input
              type="url"
              value={lesson.externalURL ?? ""}
              onChange={(e) => onUpdate({ externalURL: e.target.value })}
              placeholder="https://…"
              className="input-base"
              aria-label={t("lecturer.create.lesson.externalURL")}
            />
          )}

          {lesson.type === "live" && (
            <LiveSessionFields
              value={lesson.liveSession ?? {}}
              onChange={(liveSession) => onUpdate({ liveSession })}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | "";
  onChange: (v: number | undefined) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink-700 mb-1.5 block">{label}</span>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          if (!v) {
            onChange(undefined);
          } else {
            const n = Number(v);
            onChange(Number.isFinite(n) ? n : undefined);
          }
        }}
        className="input-base"
      />
    </label>
  );
}

function FreePreviewToggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  const t = useT();
  return (
    <label className="inline-flex items-center gap-2 h-11 px-3 rounded-xl border border-ink-200 bg-white cursor-pointer select-none">
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-brand-600"
      />
      <span className="text-sm text-ink-700">
        {t("lecturer.create.lesson.freePreview")}
      </span>
    </label>
  );
}

function LiveSessionFields({
  value,
  onChange,
}: {
  value: NonNullable<Lesson["liveSession"]>;
  onChange: (v: NonNullable<Lesson["liveSession"]>) => void;
}) {
  const t = useT();
  function patch(p: Partial<NonNullable<Lesson["liveSession"]>>) {
    onChange({ ...value, ...p });
  }
  return (
    <div className="rounded-lg border border-ink-200 bg-ink-50/40 p-3 grid gap-3 sm:grid-cols-2">
      <Labeled label={t("lecturer.create.live.sessionTitle")}>
        <input
          className="input-base"
          value={value.title ?? ""}
          onChange={(e) => patch({ title: e.target.value })}
        />
      </Labeled>
      <Labeled label={t("lecturer.create.live.meetingURL")}>
        <input
          type="url"
          className="input-base"
          placeholder="https://meet.…"
          value={value.meetingURL ?? ""}
          onChange={(e) => patch({ meetingURL: e.target.value })}
        />
      </Labeled>
      <Labeled label={t("lecturer.create.live.date")}>
        <DateChipPicker
          label={t("lecturer.create.live.date")}
          value={value.date}
          onChange={(date) => patch({ date })}
        />
      </Labeled>
      <Labeled label={t("lecturer.create.live.time")}>
        <input
          type="time"
          className="input-base"
          value={value.time ?? ""}
          onChange={(e) => patch({ time: e.target.value })}
        />
      </Labeled>
      <Labeled label={t("lecturer.create.live.duration")}>
        <input
          type="number"
          min={0}
          className="input-base"
          value={value.durationMinutes ?? ""}
          onChange={(e) => {
            const v = e.target.value;
            patch({ durationMinutes: v ? Number(v) : undefined });
          }}
        />
      </Labeled>
      <Labeled label={t("lecturer.create.live.description")}>
        <input
          className="input-base"
          value={value.description ?? ""}
          onChange={(e) => patch({ description: e.target.value })}
        />
      </Labeled>
    </div>
  );
}

function Labeled({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink-700 mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}
