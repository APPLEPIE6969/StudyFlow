import { performance } from 'perf_hooks';
import { calculateQuizStats, SavedQuiz } from './quizStore';

// Generate a large dataset
function generateMockQuizzes(count: number): SavedQuiz[] {
    const quizzes: SavedQuiz[] = [];
    for (let i = 0; i < count; i++) {
        const isCompleted = Math.random() > 0.3; // 70% completed
        const totalQuestions = Math.floor(Math.random() * 20) + 5;
        const score = isCompleted ? Math.floor(Math.random() * (totalQuestions + 1)) : undefined;

        quizzes.push({
            id: `quiz_${i}`,
            title: `Quiz ${i}`,
            topic: 'Benchmark',
            difficulty: 'Medium',
            questionType: 'Multiple Choice',
            language: 'English',
            aiMode: 'balanced',
            instantFeedback: true,
            questions: [], // Empty for memory efficiency in benchmark
            createdAt: new Date().toISOString(),
            completedAt: isCompleted ? new Date().toISOString() : undefined,
            score: score,
            totalQuestions: totalQuestions
        });
    }
    return quizzes;
}

// Original Implementation (re-implemented for baseline comparison)
function calculateStatsOriginal(quizzes: SavedQuiz[]) {
    const completed = quizzes.filter(q => q.completedAt);

    const totalScore = completed.reduce((sum, q) => sum + (q.score || 0), 0);
    const totalQuestions = completed.reduce((sum, q) => sum + q.totalQuestions, 0);

    return {
        totalQuizzes: quizzes.length,
        completedQuizzes: completed.length,
        averageScore: totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0,
    };
}

// Run Benchmark
const DATASET_SIZE = 1_000_000;
console.log(`Generating ${DATASET_SIZE} mock quizzes...`);
const quizzes = generateMockQuizzes(DATASET_SIZE);

// Verify correctness
const originalResult = calculateStatsOriginal(quizzes);
const optimizedResult = calculateQuizStats(quizzes);

if (JSON.stringify(originalResult) !== JSON.stringify(optimizedResult)) {
    console.error("MISMATCH!");
    console.error("Original:", originalResult);
    console.error("Optimized:", optimizedResult);
    process.exit(1);
} else {
    console.log("Correctness check passed.");
}

const ITERATIONS = 50;

console.log(`Running benchmark (${ITERATIONS} iterations)...`);

let originalTotalTime = 0;
for (let i = 0; i < ITERATIONS; i++) {
    const start = performance.now();
    calculateStatsOriginal(quizzes);
    originalTotalTime += (performance.now() - start);
}
const originalAvg = originalTotalTime / ITERATIONS;

let optimizedTotalTime = 0;
for (let i = 0; i < ITERATIONS; i++) {
    const start = performance.now();
    calculateQuizStats(quizzes);
    optimizedTotalTime += (performance.now() - start);
}
const optimizedAvg = optimizedTotalTime / ITERATIONS;

console.log(`\nResults:`);
console.log(`Original Avg Time: ${originalAvg.toFixed(3)} ms`);
console.log(`Optimized Avg Time: ${optimizedAvg.toFixed(3)} ms`);
console.log(`Improvement: ${((originalAvg - optimizedAvg) / originalAvg * 100).toFixed(2)}%`);
