"use client"

import type { QuizQuestion } from "./types"

// In-memory cache for quizzes to avoid frequent localStorage access and JSON parsing
let cachedQuizzes: SavedQuiz[] | null = null

// Listen for storage changes in other tabs to invalidate the cache
if (typeof window !== "undefined") {
    window.addEventListener("storage", (event) => {
        if (event.key === "studyflow_quizzes") {
            cachedQuizzes = null
        }
    })
}

// Saved quiz interface
export interface SavedQuiz {
    id: string
    title: string
    topic: string
    difficulty: string
    questionType: string
    language: string
    aiMode: "fast" | "balanced" | "smart"
    instantFeedback: boolean
    questions: QuizQuestion[]
    signature?: string
    createdAt: string
    completedAt?: string
    score?: number
    totalQuestions: number
}

// Quiz generation settings
export interface QuizSettings {
    topic: string
    difficulty: string
    questionType: string
    questionCount: number | "recommended"
    language: string
    aiMode: "fast" | "balanced" | "smart"
    instantFeedback: boolean
    customContent?: string
}

const QUIZZES_KEY = "studyflow_quizzes"

/**
 * Get all saved quizzes for the user
 */
export function getUserQuizzes(): SavedQuiz[] {
    if (typeof window === "undefined") return []

    // Return cached data if available
    if (cachedQuizzes !== null) {
        return [...cachedQuizzes]
    }

    try {
        const data = localStorage.getItem(QUIZZES_KEY)
        if (!data) {
            cachedQuizzes = []
            return []
        }
        cachedQuizzes = JSON.parse(data) as SavedQuiz[]
        return [...cachedQuizzes]
    } catch {
        cachedQuizzes = []
        return []
    }
}

/**
 * Get a specific quiz by ID
 */
export function getQuizById(id: string): SavedQuiz | null {
    const quizzes = getUserQuizzes()
    return quizzes.find(q => q.id === id) || null
}

/**
 * Save a new quiz
 */
export function saveQuiz(quiz: Omit<SavedQuiz, "id" | "createdAt">): SavedQuiz {
    const quizzes = getUserQuizzes()

    const newQuiz: SavedQuiz = {
        ...quiz,
        id: `quiz_${crypto.randomUUID()}`,
        createdAt: new Date().toISOString(),
    }

    const updatedQuizzes = [newQuiz, ...quizzes]
    cachedQuizzes = updatedQuizzes // Update cache

    if (typeof window !== "undefined") {
        localStorage.setItem(QUIZZES_KEY, JSON.stringify(updatedQuizzes))
    }

    return newQuiz
}

/**
 * Update an existing quiz (e.g., mark as completed with score)
 */
export function updateQuiz(id: string, updates: Partial<SavedQuiz>): SavedQuiz | null {
    const quizzes = getUserQuizzes()
    const index = quizzes.findIndex(q => q.id === id)

    if (index === -1) return null

    const updatedQuiz = { ...quizzes[index], ...updates }
    const updatedQuizzes = quizzes.map(q => q.id === id ? updatedQuiz : q)
    cachedQuizzes = updatedQuizzes // Update cache

    if (typeof window !== "undefined") {
        localStorage.setItem(QUIZZES_KEY, JSON.stringify(updatedQuizzes))
    }

    return updatedQuiz
}

/**
 * Delete a quiz by ID
 */
export function deleteQuiz(id: string): boolean {
    const quizzes = getUserQuizzes()
    const filtered = quizzes.filter(q => q.id !== id)

    if (filtered.length === quizzes.length) return false

    cachedQuizzes = filtered // Update cache

    if (typeof window !== "undefined") {
        localStorage.setItem(QUIZZES_KEY, JSON.stringify(filtered))
    }

    return true
}

/**
 * Get quiz statistics
 */
export function getQuizStats() {
    const quizzes = getUserQuizzes()
    const completed = quizzes.filter(q => q.completedAt)

    const totalScore = completed.reduce((sum, q) => sum + (q.score || 0), 0)
    const totalQuestions = completed.reduce((sum, q) => sum + q.totalQuestions, 0)

    return {
        totalQuizzes: quizzes.length,
        completedQuizzes: completed.length,
        averageScore: totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0,
    }
}
