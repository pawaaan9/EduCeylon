"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { CourseProgressBar } from "@/components/CourseProgressBar";
import {
  BookIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  CloseIcon,
  MenuIcon,
  PlayCircleIcon,
} from "@/components/icons";
import {
  fetchStudyCourse,
  updateStudyProgress,
} from "@/lib/api/enrollments";
import type {
  CourseStudyProgress,
  StudyCourseWithProgress,
  StudyLesson,
} from "@/lib/data/types";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { useI18n } from "@/lib/i18n/I18nProvider";

type FlatLesson = {
  lesson: StudyLesson;
  moduleId: string;
  moduleTitle: string;
};

const EMPTY_PROGRESS: CourseStudyProgress = {
  completedLessonIds: [],
  completedModuleIds: [],
};

function firstPlayableLesson(course: StudyCourseWithProgress): StudyLesson | null {
  for (const mod of course.modules) {
    for (const lesson of mod.lessons) {
      if (lesson.videoURL || lesson.pdfURL || lesson.externalURL) {
        return lesson;
      }
    }
  }
  return course.modules[0]?.lessons[0] ?? null;
}

export function CourseStudyClient({ slug }: { slug: string }) {
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const [course, setCourse] = useState<StudyCourseWithProgress | null>(null);
  const [progress, setProgress] = useState<CourseStudyProgress>(EMPTY_PROGRESS);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [mobileLessonsOpen, setMobileLessonsOpen] = useState(false);

  const completedLessons = useMemo(
    () => new Set(progress.completedLessonIds),
    [progress.completedLessonIds],
  );
  const completedModules = useMemo(
    () => new Set(progress.completedModuleIds),
    [progress.completedModuleIds],
  );

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const token = await user.getIdToken();
        const data = await fetchStudyCourse(token, slug);
        if (!cancelled) {
          setCourse(data);
          setProgress(data.progress ?? EMPTY_PROGRESS);
          setActiveLessonId(firstPlayableLesson(data)?.id ?? null);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not load course");
          setCourse(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, slug]);

  useEffect(() => {
    if (!mobileLessonsOpen) return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = prev;
    };
  }, [mobileLessonsOpen]);

  const persistProgress = useCallback(
    async (
      payload:
        | { lessonId: string; completed: boolean }
        | { moduleId: string; completed: boolean },
    ) => {
      if (!user) return;
      setSaving(true);
      try {
        const token = await user.getIdToken();
        const next = await updateStudyProgress(token, slug, payload);
        setProgress(next);
      } finally {
        setSaving(false);
      }
    },
    [user, slug],
  );

  const flatLessons = useMemo((): FlatLesson[] => {
    if (!course) return [];
    const items: FlatLesson[] = [];
    course.modules.forEach((mod) => {
      const moduleTitle = mod.title[locale] ?? mod.title.en;
      mod.lessons.forEach((lesson) => {
        items.push({ lesson, moduleId: mod.id, moduleTitle });
      });
    });
    return items;
  }, [course, locale]);

  const activeEntry = useMemo(
    () => flatLessons.find((e) => e.lesson.id === activeLessonId) ?? null,
    [flatLessons, activeLessonId],
  );

  const activeIndex = activeEntry
    ? flatLessons.findIndex((e) => e.lesson.id === activeEntry.lesson.id)
    : -1;

  const prevEntry = activeIndex > 0 ? flatLessons[activeIndex - 1] : null;
  const nextEntry =
    activeIndex >= 0 && activeIndex < flatLessons.length - 1
      ? flatLessons[activeIndex + 1]
      : null;

  if (loading) {
    return (
      <div className="study-shell flex min-h-[320px] items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="study-shell p-8 text-center">
        <p className="text-sm text-rose-600" role="alert">
          {error ?? t("student.study.notFound")}
        </p>
        <Link href="/student/courses" className="btn btn-primary mt-4 inline-flex">
          {t("student.study.backToCourses")}
        </Link>
      </div>
    );
  }

  const title = course.title[locale] ?? course.title.en;
  const activeLesson = activeEntry?.lesson ?? null;
  const activeTitle = activeLesson
    ? activeLesson.title[locale] ?? activeLesson.title.en
    : null;
  const activeLessonDone = activeLesson
    ? completedLessons.has(activeLesson.id)
    : false;

  const progressPercent = progress.percent ?? 0;
  const totalLessons =
    progress.totalLessons ??
    course.modules.reduce((n, m) => n + m.lessons.length, 0);
  const completedLessonCount =
    progress.completedLessons ?? completedLessons.size;

  function selectLesson(id: string, closeMobile = false) {
    setActiveLessonId(id);
    if (closeMobile) setMobileLessonsOpen(false);
  }

  const renderSidebar = (closeOnSelect: boolean) => (
    <div className="flex flex-col gap-6">
      {course.modules.map((mod, modIdx) => {
        const modTitle = mod.title[locale] ?? mod.title.en;
        const modDone = completedModules.has(mod.id);
        const modDoneCount = mod.lessons.filter((l) =>
          completedLessons.has(l.id),
        ).length;

        return (
          <section key={mod.id}>
            <div className="mb-2 flex items-center justify-between gap-2 px-1">
              <div>
                <h3 className="text-sm font-semibold text-ink-900">
                  {modIdx + 1}. {modTitle}
                </h3>
                <p className="text-xs text-ink-500">
                  {modDoneCount}/{mod.lessons.length} {t("course.lessons")}
                </p>
              </div>
              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  void persistProgress({ moduleId: mod.id, completed: !modDone })
                }
                className="text-xs font-medium text-brand-700 hover:text-brand-900 disabled:opacity-50"
              >
                {modDone ? t("student.study.moduleDone") : t("student.study.markModuleDone")}
              </button>
            </div>
            <ul className="flex flex-col gap-0.5">
              {mod.lessons.map((lesson) => {
                const isActive = lesson.id === activeLessonId;
                const isDone = completedLessons.has(lesson.id);
                const label = lesson.title[locale] ?? lesson.title.en;

                return (
                  <li key={lesson.id}>
                    <button
                      type="button"
                      onClick={() => selectLesson(lesson.id, closeOnSelect)}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                        isActive
                          ? "border-l-[3px] border-brand-600 bg-brand-50 font-medium text-brand-900"
                          : isDone
                            ? "text-ink-600 hover:bg-ink-50"
                            : "text-ink-700 hover:bg-ink-50"
                      }`}
                    >
                      {isDone ? (
                        <CheckCircleIcon className="h-4 w-4 shrink-0 text-emerald-500" />
                      ) : lesson.videoURL ? (
                        <PlayCircleIcon
                          className={`h-4 w-4 shrink-0 ${isActive ? "text-brand-600" : "text-ink-400"}`}
                        />
                      ) : (
                        <BookIcon
                          className={`h-4 w-4 shrink-0 ${isActive ? "text-brand-600" : "text-ink-400"}`}
                        />
                      )}
                      <span className="min-w-0 flex-1 truncate">{label}</span>
                      {lesson.durationMin > 0 && (
                        <span className="shrink-0 text-xs text-ink-400">
                          {lesson.durationMin}m
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );

  return (
    <div className="study-shell flex flex-col overflow-hidden">
      {/* Compact header */}
      <header className="border-b border-ink-200 bg-white px-4 py-4 sm:px-5">
        <div className="flex items-start gap-3">
          <Link
            href="/student/courses"
            className="mt-0.5 inline-flex shrink-0 items-center gap-1 text-sm text-ink-500 hover:text-ink-900"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            <span className="hidden sm:inline">{t("student.study.backToCourses")}</span>
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-semibold text-ink-900">{title}</h1>
            <div className="mt-1 flex items-center gap-2 text-xs text-ink-500">
              <Avatar
                name={course.lecturer.name}
                src={course.lecturer.photoURL}
                size={20}
              />
              <span>{course.lecturer.name}</span>
              <span>·</span>
              <span>
                {completedLessonCount}/{totalLessons} {t("course.lessons")}
              </span>
            </div>
            <div className="mt-3 max-w-sm">
              <CourseProgressBar percent={progressPercent} size="sm" />
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileLessonsOpen(true)}
            className="lg:hidden inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-2 text-xs font-semibold text-ink-700 shadow-sm hover:bg-ink-50"
            aria-label={t("student.study.curriculum")}
          >
            <MenuIcon className="h-4 w-4" />
            {t("student.study.curriculum")}
          </button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row">
        {/* Sidebar */}
        <aside className="hidden w-72 shrink-0 border-r border-ink-200 bg-ink-50/50 p-4 lg:block xl:w-80">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-400">
            {t("student.study.curriculum")}
          </p>
          {renderSidebar(false)}
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1 bg-white pb-16 lg:pb-0">
          {!activeLesson ? (
            <div className="flex min-h-[280px] items-center justify-center p-8 text-sm text-ink-500">
              {t("student.study.selectLesson")}
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="border-b border-ink-100 px-4 py-4 sm:px-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-brand-600">
                      {activeEntry?.moduleTitle}
                    </p>
                    <h2 className="mt-1 text-xl font-semibold text-ink-900">{activeTitle}</h2>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      {activeLesson.durationMin > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs text-ink-500">
                          <ClockIcon className="h-3.5 w-3.5" />
                          {activeLesson.durationMin} min
                        </span>
                      )}
                      <span className="text-xs text-ink-400">
                        {t("student.study.lesson")} {activeIndex + 1}/{totalLessons}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() =>
                      void persistProgress({
                        lessonId: activeLesson.id,
                        completed: !activeLessonDone,
                      })
                    }
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60 ${
                      activeLessonDone
                        ? "border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                        : "border border-brand-200 bg-brand-50 text-brand-800 hover:bg-brand-100"
                    }`}
                  >
                    <CheckCircleIcon className="h-4 w-4" />
                    {activeLessonDone
                      ? t("student.study.lessonDone")
                      : t("student.study.markLessonDone")}
                  </button>
                </div>
              </div>

              <div className="px-4 py-4 sm:px-6">
                {activeLesson.videoURL ? (
                  <video
                    key={activeLesson.id}
                    controls
                    className="aspect-video w-full rounded-xl border border-ink-200 bg-white object-contain"
                    src={activeLesson.videoURL}
                    playsInline
                  />
                ) : activeLesson.pdfURL ? (
                  <div className="flex aspect-video flex-col items-center justify-center gap-3 rounded-xl border border-ink-200 bg-ink-50 p-6 text-center">
                    <BookIcon className="h-10 w-10 text-brand-600" />
                    <a
                      href={activeLesson.pdfURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-sm"
                    >
                      {t("student.study.openPdf")}
                    </a>
                  </div>
                ) : activeLesson.externalURL ? (
                  <div className="flex aspect-video items-center justify-center rounded-xl border border-ink-200 bg-ink-50 p-6">
                    <a
                      href={activeLesson.externalURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-sm"
                    >
                      {t("student.study.openLink")}
                    </a>
                  </div>
                ) : (
                  <div className="flex aspect-video items-center justify-center rounded-xl border border-dashed border-ink-200 bg-ink-50 text-sm text-ink-500">
                    {t("student.study.noContent")}
                  </div>
                )}
              </div>

              {(prevEntry || nextEntry) && (
                <div className="flex gap-2 border-t border-ink-100 px-4 py-3 sm:px-6">
                  {prevEntry ? (
                    <button
                      type="button"
                      onClick={() => selectLesson(prevEntry.lesson.id)}
                      className="inline-flex items-center gap-1.5 text-sm text-ink-600 hover:text-brand-700"
                    >
                      <ChevronLeftIcon className="h-4 w-4" />
                      <span className="truncate max-w-[160px]">
                        {prevEntry.lesson.title[locale] ?? prevEntry.lesson.title.en}
                      </span>
                    </button>
                  ) : (
                    <span />
                  )}
                  {nextEntry && (
                    <button
                      type="button"
                      onClick={() => selectLesson(nextEntry.lesson.id)}
                      className="ml-auto inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-900"
                    >
                      <span className="truncate max-w-[160px]">
                        {nextEntry.lesson.title[locale] ?? nextEntry.lesson.title.en}
                      </span>
                      <ChevronRightIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Mobile: sticky lesson list trigger */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink-200 bg-white/95 px-4 py-2.5 backdrop-blur-sm lg:hidden">
        <button
          type="button"
          onClick={() => setMobileLessonsOpen(true)}
          className="flex w-full items-center justify-between gap-3 rounded-xl bg-brand-50 px-4 py-3 text-left"
        >
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-brand-800">
            <MenuIcon className="h-4 w-4" />
            {t("student.study.curriculum")}
          </span>
          <span className="text-xs font-medium text-brand-600">
            {activeIndex >= 0 ? activeIndex + 1 : 0}/{totalLessons}
          </span>
        </button>
      </div>

      {/* Mobile: lesson drawer */}
      {mobileLessonsOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/40"
            aria-hidden
            onClick={() => setMobileLessonsOpen(false)}
          />
          <aside className="absolute right-0 top-0 flex h-full w-[min(20rem,88vw)] flex-col bg-white shadow-xl">
            <div className="flex shrink-0 items-center justify-between border-b border-ink-200 px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold text-ink-900">
                  {t("student.study.curriculum")}
                </h2>
                <p className="text-xs text-ink-500">
                  {completedLessonCount}/{totalLessons} · {progressPercent}%
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMobileLessonsOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-ink-100"
                aria-label={t("action.cancel")}
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4 scrollbar-thin">
              {renderSidebar(true)}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
