import { test } from 'node:test';
import assert from 'node:assert';
import { calculateQuizStats, type SavedQuiz } from './quizStore.ts';

test('calculateQuizStats', async (t) => {
    await t.test('should return zero stats for empty quizzes', () => {
        const stats = calculateQuizStats([]);
        assert.deepStrictEqual(stats, {
            totalQuizzes: 0,
            completedQuizzes: 0,
            averageScore: 0
        });
    });

    await t.test('should calculate stats correctly for mixed quizzes', () => {
        const quizzes = [
            {
                id: '1',
                completedAt: '2023-01-01',
                score: 8,
                totalQuestions: 10,
                // minimal other fields
                title: 'Q1', topic: 'T', difficulty: 'E', questionType: 'MC', language: 'en',
                aiMode: 'fast', instantFeedback: true, questions: [], createdAt: 'now'
            },
            {
                id: '2', // Not completed
                completedAt: undefined,
                score: 0,
                totalQuestions: 10,
                title: 'Q2', topic: 'T', difficulty: 'E', questionType: 'MC', language: 'en',
                aiMode: 'fast', instantFeedback: true, questions: [], createdAt: 'now'
            },
            {
                id: '3',
                completedAt: '2023-01-02',
                score: 5,
                totalQuestions: 5,
                title: 'Q3', topic: 'T', difficulty: 'E', questionType: 'MC', language: 'en',
                aiMode: 'fast', instantFeedback: true, questions: [], createdAt: 'now'
            }
        ] as SavedQuiz[];

        const stats = calculateQuizStats(quizzes);

        // Total quizzes: 3
        // Completed: 2
        // Total score: 8 + 5 = 13
        // Total questions (of completed): 10 + 5 = 15
        // Avg: 13/15 = 0.8666... -> round(86.66) -> 87

        assert.deepStrictEqual(stats, {
            totalQuizzes: 3,
            completedQuizzes: 2,
            averageScore: 87
        });
    });
});
