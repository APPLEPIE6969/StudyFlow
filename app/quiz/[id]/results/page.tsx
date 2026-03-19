"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect, useState, use } from "react"
import { getQuizById, SavedQuiz } from "@/lib/quizStore"

export default function QuizResults({ params }: { params: Promise<{ id: string }> }) {
    const unwrappedParams = use(params)
    const id = unwrappedParams.id
    const searchParams = useSearchParams()
    const scoreParam = searchParams.get("score")
    const totalParam = searchParams.get("total")
    const xpParam = searchParams.get("xp")

    const [quiz, setQuiz] = useState<SavedQuiz | null>(null)

    const score = parseInt(scoreParam || "0")
    const total = parseInt(totalParam || "1")
    const xp = parseInt(xpParam || "0")
    const percentage = Math.round((score / total) * 100)

    useEffect(() => {
        const loadResult = () => {
            const loadedQuiz = getQuizById(id)
            if (loadedQuiz) {
                setQuiz(loadedQuiz)
            }
        }
        loadResult()
    }, [id])

    const getGrade = () => {
        if (percentage >= 90) return { grade: "A+", color: "text-green-500", message: "Outstanding! 🎉" }
        if (percentage >= 80) return { grade: "A", color: "text-green-500", message: "Excellent work! 🌟" }
        if (percentage >= 70) return { grade: "B", color: "text-blue-500", message: "Good job! 👍" }
        if (percentage >= 60) return { grade: "C", color: "text-yellow-500", message: "Not bad! 📚" }
        return { grade: "D", color: "text-red-500", message: "Keep practicing! 💪" }
    }

    const gradeInfo = getGrade()

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-4">
            <div className="max-w-lg w-full">
                {/* Results Card */}
                <div className="bg-white dark:bg-[#2e2839] rounded-2xl border border-slate-200 dark:border-[#3a3347] shadow-xl p-8 text-center animate-fade-in">
                    {/* Trophy Icon */}
                    <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 animate-scale-in">
                        <span className="material-symbols-outlined text-primary text-4xl">emoji_events</span>
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Quiz Complete!</h1>
                    <p className="text-slate-500 dark:text-[#a69db9] mb-8">{quiz?.title || "Quiz"}</p>

                    {/* Score Circle */}
                    <div className="relative w-40 h-40 mx-auto mb-8">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="80"
                                cy="80"
                                r="70"
                                stroke="currentColor"
                                strokeWidth="10"
                                fill="none"
                                className="text-slate-200 dark:text-white/10"
                            />
                            <circle
                                cx="80"
                                cy="80"
                                r="70"
                                stroke="currentColor"
                                strokeWidth="10"
                                fill="none"
                                strokeDasharray={`${percentage * 4.4} 440`}
                                strokeLinecap="round"
                                className="text-primary transition-all duration-1000"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={`text-4xl font-bold ${gradeInfo.color}`}>{gradeInfo.grade}</span>
                            <span className="text-slate-500 dark:text-[#a69db9] text-sm">{percentage}%</span>
                        </div>
                    </div>

                    {/* Score Details */}
                    <div className="grid grid-cols-3 gap-3 mb-8">
                        <div className="bg-slate-50 dark:bg-[#1a1622] rounded-xl p-4 transition-all hover:scale-105">
                            <p className="text-2xl font-bold text-green-500">{score}</p>
                            <p className="text-[10px] text-slate-500 dark:text-[#a69db9] uppercase font-bold tracking-wider">Correct</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-[#1a1622] rounded-xl p-4 transition-all hover:scale-105">
                            <p className="text-2xl font-bold text-red-500">{total - score}</p>
                            <p className="text-[10px] text-slate-500 dark:text-[#a69db9] uppercase font-bold tracking-wider">Incorrect</p>
                        </div>
                        <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-4 border border-primary/20 transition-all hover:scale-105 shadow-lg shadow-primary/5">
                            <div className="flex items-center justify-center gap-1">
                                <span className="material-symbols-outlined text-primary text-sm">stars</span>
                                <p className="text-2xl font-bold text-primary">{xp}</p>
                            </div>
                            <p className="text-[10px] text-primary dark:text-primary uppercase font-black tracking-wider">XP Earned</p>
                        </div>
                    </div>

                    {/* Message */}
                    <p className="text-lg font-medium text-slate-900 dark:text-white mb-8">{gradeInfo.message}</p>

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                        <Link
                            href="/quiz/generator"
                            className="w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <span className="material-symbols-outlined">add</span>
                            Generate New Quiz
                        </Link>
                        <Link
                            href="/quizzes"
                            className="w-full inline-flex items-center justify-center gap-2 bg-slate-100 dark:bg-[#1a1622] hover:bg-slate-200 dark:hover:bg-[#2e2839] text-slate-700 dark:text-white font-semibold py-3 px-6 rounded-xl transition-all"
                        >
                            <span className="material-symbols-outlined">folder</span>
                            My Quizzes
                        </Link>
                        <Link
                            href="/dashboard"
                            className="w-full inline-flex items-center justify-center gap-2 text-slate-500 dark:text-[#a69db9] hover:text-slate-700 dark:hover:text-white font-medium py-3 transition-colors"
                        >
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
