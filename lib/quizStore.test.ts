import "./setupTests.ts";
import { test, describe, beforeEach } from "node:test";
import assert from "node:assert";
import { localStorageMock } from "./setupTests.ts";
import { getUserQuizzes, saveQuiz, getQuizById, updateQuiz, deleteQuiz, getQuizStats } from "./quizStore.ts";

describe("quizStore", () => {
    beforeEach(() => {
        localStorageMock.clear();
        // Trigger storage event to clear internal cache in quizStore
        (global as any).window.dispatchEvent({ type: "storage", key: "studyflow_quizzes" });
    });

    test("getUserQuizzes should return empty array when localStorage is empty", () => {
        const quizzes = getUserQuizzes();
        assert.deepStrictEqual(quizzes, []);
    });

    test("saveQuiz should save a quiz and getUserQuizzes should return it", () => {
        const quizData = {
            title: "Test Quiz",
            topic: "TypeScript",
            difficulty: "Medium",
            questionType: "Multiple Choice",
            language: "English",
            aiMode: "balanced" as const,
            instantFeedback: true,
            questions: [],
            totalQuestions: 0
        };
        const saved = saveQuiz(quizData);
        assert.ok(saved.id, "Saved quiz should have an ID");
        assert.ok(saved.createdAt, "Saved quiz should have a createdAt timestamp");
        assert.strictEqual(saved.title, quizData.title);

        const quizzes = getUserQuizzes();
        assert.strictEqual(quizzes.length, 1);
        assert.strictEqual(quizzes[0].id, saved.id);
    });

    test("getQuizById should return the correct quiz", () => {
        const quiz1 = saveQuiz({ title: "Quiz 1", topic: "T1", difficulty: "D1", questionType: "Q1", language: "L1", aiMode: "fast", instantFeedback: true, questions: [], totalQuestions: 0 });
        const quiz2 = saveQuiz({ title: "Quiz 2", topic: "T2", difficulty: "D2", questionType: "Q2", language: "L2", aiMode: "fast", instantFeedback: true, questions: [], totalQuestions: 0 });

        const found = getQuizById(quiz2.id);
        assert.ok(found);
        assert.strictEqual(found?.id, quiz2.id);
        assert.strictEqual(found?.title, "Quiz 2");
    });

    test("getQuizById should return null for non-existent ID", () => {
        const found = getQuizById("non-existent");
        assert.strictEqual(found, null);
    });

    test("updateQuiz should update quiz data", () => {
        const quiz = saveQuiz({ title: "Old Title", topic: "T1", difficulty: "D1", questionType: "Q1", language: "L1", aiMode: "fast", instantFeedback: true, questions: [], totalQuestions: 0 });
        const updated = updateQuiz(quiz.id, { title: "New Title", score: 80 });

        assert.ok(updated);
        assert.strictEqual(updated?.title, "New Title");
        assert.strictEqual(updated?.score, 80);

        const found = getQuizById(quiz.id);
        assert.strictEqual(found?.title, "New Title");
    });

    test("updateQuiz should return null if quiz not found", () => {
        const result = updateQuiz("non-existent", { title: "New Title" });
        assert.strictEqual(result, null);
    });

    test("deleteQuiz should remove the quiz", () => {
        const quiz = saveQuiz({ title: "To be deleted", topic: "T1", difficulty: "D1", questionType: "Q1", language: "L1", aiMode: "fast", instantFeedback: true, questions: [], totalQuestions: 0 });
        const deleted = deleteQuiz(quiz.id);

        assert.strictEqual(deleted, true);
        assert.strictEqual(getQuizById(quiz.id), null);
        assert.strictEqual(getUserQuizzes().length, 0);
    });

    test("deleteQuiz should return false if quiz not found", () => {
        const result = deleteQuiz("non-existent");
        assert.strictEqual(result, false);
    });

    test("getQuizStats should return correct statistics", () => {
        saveQuiz({ title: "Q1", topic: "T1", difficulty: "D1", questionType: "Q1", language: "L1", aiMode: "fast", instantFeedback: true, questions: [], totalQuestions: 10 });
        const q2 = saveQuiz({ title: "Q2", topic: "T2", difficulty: "D2", questionType: "Q2", language: "L2", aiMode: "fast", instantFeedback: true, questions: [], totalQuestions: 10 });

        updateQuiz(q2.id, { completedAt: new Date().toISOString(), score: 8 });

        const stats = getQuizStats();
        assert.strictEqual(stats.totalQuizzes, 2);
        assert.strictEqual(stats.completedQuizzes, 1);
        assert.strictEqual(stats.averageScore, 80);
    });

    test("getQuizStats should handle zero completed quizzes", () => {
        saveQuiz({ title: "Q1", topic: "T1", difficulty: "D1", questionType: "Q1", language: "L1", aiMode: "fast", instantFeedback: true, questions: [], totalQuestions: 10 });
        const stats = getQuizStats();
        assert.strictEqual(stats.totalQuizzes, 1);
        assert.strictEqual(stats.completedQuizzes, 0);
        assert.strictEqual(stats.averageScore, 0);
    });

    test("getUserQuizzes should handle corrupted JSON in localStorage", () => {
        localStorage.setItem("studyflow_quizzes", "invalid json");
        // Clear cache to force reload from localStorage
        (global as any).window.dispatchEvent({ type: "storage", key: "studyflow_quizzes" });

        const quizzes = getUserQuizzes();
        assert.deepStrictEqual(quizzes, []);
    });

    test("storage event should invalidate cache", () => {
        saveQuiz({ title: "Test", topic: "T", difficulty: "D", questionType: "Q", language: "L", aiMode: "fast", instantFeedback: true, questions: [], totalQuestions: 0 });

        // Manually corrupt localStorage without updating cache
        localStorageMock.setItem("studyflow_quizzes", "[]");

        // Before storage event, still returns cached value
        assert.strictEqual(getUserQuizzes().length, 1);

        // Trigger storage event
        (global as any).window.dispatchEvent({ type: "storage", key: "studyflow_quizzes" });

        // After storage event, cache is cleared and it reloads from localStorage
        assert.strictEqual(getUserQuizzes().length, 0);
    });
});
