"use client"
import { useLanguage } from "@/lib/i18n"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { getUserQuizzes, SavedQuiz } from "@/lib/quizStore"
import Link from "next/link"
import { EmptyState } from "@/components/EmptyState"
import { Sidebar } from "@/components/Sidebar"

export default function StudySetsPage() {
    const { t } = useLanguage()
    const [studySets, setStudySets] = useState<SavedQuiz[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Load quizzes/study sets from local storage
        const load = () => {
            const loadedQuizzes = getUserQuizzes()
            setStudySets(loadedQuizzes)
            setIsLoading(false)
        }
        load()
    }, [])

    if (isLoading) {
        return (
            <div className="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark">
                <Sidebar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-screen w-full overflow-hidden">
            <Sidebar />
            <main className="flex-1 flex flex-col overflow-y-auto bg-background-light dark:bg-background-dark p-8">
                <div className="flex items-center justify-between mb-8 animate-fade-in">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                            {t("nav.study_sets") || "Study Sets"}
                        </h1>
                        <p className="text-slate-500 dark:text-text-secondary mt-1">
                            Manage your flashcards and quizzes.
                        </p>
                    </div>
                    <Link
                        href="/create"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
                    >
                        <span className="material-symbols-outlined">add</span>
                        {t("common.create") || "Create New"}
                    </Link>
                </div>

                {studySets.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {studySets.map((set, index) => (
                            <motion.div
                                key={set.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="group flex flex-col bg-white dark:bg-surface-dark-lighter rounded-2xl p-5 border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                        <span className="material-symbols-outlined">library_books</span>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${set.completedAt
                                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                                        }`}>
                                        {set.completedAt ? "Completed" : "New"}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">
                                    {set.title}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-text-secondary mb-4 line-clamp-1">
                                    {set.totalQuestions} questions • {set.topic}
                                </p>

                                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-white/5 flex gap-3">
                                    <Link
                                        href={`/quiz/${set.id}`}
                                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-white font-medium transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">
                                            {set.completedAt ? "replay" : "play_arrow"}
                                        </span>
                                        {set.completedAt ? "Retake" : "Start"}
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center animate-fade-in-up">
                        <div className="rounded-2xl bg-white dark:bg-surface-dark-lighter shadow-sm ring-1 ring-slate-900/5 dark:ring-white/10 max-w-md w-full p-2">
                            <EmptyState
                                icon="library_books"
                                title="No study sets yet"
                                description="Create your first study set to start learning."
                                actionLabel="Create New Set"
                                actionHref="/create"
                            />
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
