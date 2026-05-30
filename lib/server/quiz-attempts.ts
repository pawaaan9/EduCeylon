import "server-only";

import { FieldValue } from "firebase-admin/firestore";
import type { CourseQuiz, LecturerCourse } from "@/lib/courses/types";
import {
  gradeQuizSubmission,
  type QuizAnswerMap,
  type QuizGradeResult,
} from "@/lib/courses/quiz-student";
import { ensureQuiz } from "@/lib/courses/quiz";
import { getAdmin } from "./firebase-admin";

export const QUIZ_ATTEMPTS_COLLECTION = "quizAttempts";

export type QuizScope = "lesson" | "module" | "course";

export type QuizAttemptSummary = {
  quizId: string;
  scorePercent: number;
  passed: boolean;
  submittedAt: string;
};

export type StoredQuizAttempt = QuizGradeResult & {
  id: string;
  studentId: string;
  courseId: string;
  scope: QuizScope;
  scopeId: string;
  submittedAt: string;
};

function timestampToIso(value: unknown): string | undefined {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null) {
    const ts = value as { toDate?: () => Date; seconds?: number };
    if (typeof ts.toDate === "function") return ts.toDate().toISOString();
    if (typeof ts.seconds === "number") {
      return new Date(ts.seconds * 1000).toISOString();
    }
  }
  return undefined;
}

export function resolveGradableQuiz(
  course: LecturerCourse,
  quizId: string,
  scope: QuizScope,
  scopeId: string,
): CourseQuiz | null {
  if (scope === "course") {
    if (course.finalQuiz?.id === quizId && course.finalQuiz.questions.length) {
      return ensureQuiz(course.finalQuiz);
    }
    return null;
  }

  if (scope === "module") {
    const mod = course.modules.find((m) => m.id === scopeId);
    if (mod?.quiz?.id === quizId && mod.quiz.questions.length) {
      return ensureQuiz(mod.quiz);
    }
    return null;
  }

  for (const mod of course.modules) {
    for (const lesson of mod.lessons) {
      if (lesson.id !== scopeId) continue;
      if (lesson.type === "quiz" && lesson.quiz?.id === quizId) {
        return ensureQuiz(lesson.quiz);
      }
      if (lesson.quiz?.id === quizId && lesson.quiz.questions.length) {
        return ensureQuiz(lesson.quiz);
      }
    }
  }

  return null;
}

export async function submitQuizAttempt(
  studentId: string,
  courseId: string,
  course: LecturerCourse,
  quizId: string,
  scope: QuizScope,
  scopeId: string,
  answers: QuizAnswerMap,
): Promise<StoredQuizAttempt> {
  const quiz = resolveGradableQuiz(course, quizId, scope, scopeId);
  if (!quiz) {
    throw new Error("Quiz not found");
  }

  if (quiz.questions.length === 0) {
    throw new Error("This quiz has no questions");
  }

  for (const question of quiz.questions) {
    if (!question.prompt.trim()) continue;
    const selected = answers[question.id];
    if (!selected?.trim()) {
      throw new Error("Please answer all questions before submitting");
    }
    if (!question.options.some((o) => o.id === selected)) {
      throw new Error("Invalid answer selection");
    }
  }

  const graded = gradeQuizSubmission(quiz, answers);
  const { db } = getAdmin();
  const ref = db.collection(QUIZ_ATTEMPTS_COLLECTION).doc();

  const payload = {
    studentId,
    courseId,
    quizId,
    scope,
    scopeId,
    scorePercent: graded.scorePercent,
    passed: graded.passed,
    correctCount: graded.correctCount,
    totalQuestions: graded.totalQuestions,
    passingScorePercent: graded.passingScorePercent,
    questions: graded.questions,
    submittedAt: FieldValue.serverTimestamp(),
  };

  await ref.set(payload);

  const saved = await ref.get();
  const data = saved.data() as Record<string, unknown>;

  return {
    id: saved.id,
    studentId,
    courseId,
    scope,
    scopeId,
    ...graded,
    submittedAt: timestampToIso(data.submittedAt) ?? new Date().toISOString(),
  };
}

export async function listLatestQuizAttempts(
  studentId: string,
  courseId: string,
): Promise<Record<string, QuizAttemptSummary>> {
  const { db } = getAdmin();
  const snap = await db
    .collection(QUIZ_ATTEMPTS_COLLECTION)
    .where("studentId", "==", studentId)
    .where("courseId", "==", courseId)
    .get();

  const map: Record<string, QuizAttemptSummary> = {};

  for (const doc of snap.docs) {
    const data = doc.data() as Record<string, unknown>;
    const quizId = data.quizId as string;
    const submittedAt =
      timestampToIso(data.submittedAt) ?? new Date(0).toISOString();
    const existing = map[quizId];
    if (existing && existing.submittedAt >= submittedAt) continue;

    map[quizId] = {
      quizId,
      scorePercent: Number(data.scorePercent) || 0,
      passed: data.passed === true,
      submittedAt,
    };
  }

  return map;
}
