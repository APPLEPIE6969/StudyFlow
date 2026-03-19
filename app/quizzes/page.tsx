"use client"

import { Sidebar } from "@/components/Sidebar"
import { EmptyState } from "@/components/EmptyState"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { isOnboardingComplete } from "@/lib/userStore"
import { getUserQuizzes, deleteQuiz, SavedQuiz } from "@/lib/quizStore"
import Link from "next/link"
import { useLanguage } from "@/lib/i18n"

export default function MyQuizzes() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const { t } = useLanguage()
    const [quizzes, setQuizzes] = useState<SavedQuiz[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login")
            return
        }

        if (status === "authenticated" && session?.user?.email) {
            const email = session?.user?.email;
            if (email && !isOnboardingComplete(email)) {
                router.push("/onboarding")
                return
            }

            setQuizzes(getUserQuizzes())
            setIsLoading(false)
        }
    }, [status, session, router])

    const handleDelete = (id: string) => {
        if (confirm(t("quizzes.delete_confirm"))) {
            deleteQuiz(id)
            setQuizzes(getUserQuizzes())
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        })
    }

    if (status === "loading" || isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background-dark">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <p className="text-white/60">{t("common.loading")}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-screen w-full overflow-hidden">
            <Sidebar />
            <main className="flex-1 flex flex-col overflow-y-auto bg-background-light dark:bg-background-dark p-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white animate-fade-in">{t("quizzes.title")}</h1>
                    <Link
                        href="/quiz/generator"
                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary/90 hover:scale-105"
                    >
                        <span className="material-symbols-outlined text-lg">add</span>
                        {t("quizzes.new_quiz")}
                    </Link>
                </div>

                {quizzes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {quizzes.map((quiz, index) => (
                            <div
                                key={quiz.id}
                                className={`group bg-white dark:bg-surface-dark-lighter border border-slate-200 dark:border-surface-dark-lighter/50 rounded-2xl overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02] animate-fade-in-up stagger-${Math.min(index + 1, 5)}`}
                            >
                                {/* Quiz Header */}
                                <div className="p-5 border-b border-slate-100 dark:border-surface-dark-lighter/50">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2">
                                            {quiz.title}
                                        </h3>
                                        <button
                                            onClick={() => handleDelete(quiz.id)}
                                            className="p-1 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <span className="material-symbols-outlined text-lg">delete</span>
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="text-xs px-2 py-1 rounded-lg bg-primary/10 text-primary font-medium">
                                            {quiz.difficulty}
                                        </span>
                                        <span className="text-xs px-2 py-1 rounded-lg bg-slate-100 dark:bg-surface-dark text-slate-600 dark:text-text-secondary font-medium">
                                            {quiz.questionType}
                                        </span>
                                        <span className="text-xs px-2 py-1 rounded-lg bg-slate-100 dark:bg-surface-dark text-slate-600 dark:text-text-secondary font-medium">
                                            {quiz.language}
                                        </span>
                                    </div>
                                </div>

                                {/* Quiz Stats */}
                                <div className="p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-primary text-lg">quiz</span>
                                            <span className="text-sm text-slate-600 dark:text-text-secondary">{t("quizzes.questions_count", quiz.totalQuestions)}</span>
                                        </div>
                                        {quiz.completedAt && quiz.score !== undefined && (
                                            <div className="flex items-center gap-1">
                                                <span className="text-sm font-bold text-green-500">{Math.round((quiz.score / quiz.totalQuestions) * 100)}%</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-slate-400 dark:text-text-secondary/60">
                                            {formatDate(quiz.createdAt)}
                                        </span>
                                        <Link
                                            href={`/quiz/${quiz.id}?feedback=${quiz.instantFeedback}`}
                                            className="inline-flex items-center gap-1 text-primary text-sm font-semibold hover:underline"
                                        >
                                            {quiz.completedAt ? t("quizzes.retake") : t("quizzes.start_quiz")}
                                            <span className="material-symbols-outlined text-lg">arrow_forward</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="rounded-2xl bg-white dark:bg-surface-dark-lighter shadow-sm ring-1 ring-slate-900/5 dark:ring-white/10 max-w-md w-full">
                            <EmptyState
                                icon="quiz"
                                title={t("quizzes.no_quizzes")}
                                description={t("quizzes.no_quizzes_desc")}
                                actionLabel={t("quizzes.new_quiz")}
                                actionHref="/quiz/generator"
                            />
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
