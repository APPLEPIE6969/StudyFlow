import { test, describe } from "node:test";
import assert from "node:assert";
import { saveQuiz } from "./quizStore.ts";

describe("quizStore", () => {
    test("saveQuiz should generate a UUID-based ID", () => {
        const quizData = {
            title: "Test Quiz",
            topic: "Science",
            difficulty: "easy",
            questionType: "multiple-choice",
            language: "en",
            aiMode: "fast" as const,
            instantFeedback: true,
            questions: [],
            totalQuestions: 0,
        };

        const result = saveQuiz(quizData);

        // Check if ID starts with quiz_
        assert.ok(result.id.startsWith("quiz_"), "ID should start with quiz_");

        // Check if the rest is a valid UUID
        const uuidPart = result.id.replace("quiz_", "");
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        assert.ok(uuidRegex.test(uuidPart), `ID part ${uuidPart} should be a valid UUID`);
    });
});
