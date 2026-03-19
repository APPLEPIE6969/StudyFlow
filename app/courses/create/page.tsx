"use client"

import { Sidebar } from "@/components/Sidebar"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { isOnboardingComplete } from "@/lib/userStore"
import Link from "next/link"

export default function CreateCourse() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [courseName, setCourseName] = useState("")
    const [subject, setSubject] = useState("")
    const [description, setDescription] = useState("")

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login")
        } else if (status === "authenticated" && session?.user?.email) {
            const email = session?.user?.email;
            if (email && !isOnboardingComplete(email)) {
                router.push("/onboarding")
            } else {
                setIsLoading(false)
            }
        }
    }, [status, session, router])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // In a real app, this would save to a database
        // For now, just redirect back to courses
        router.push("/courses")
    }

    if (status === "loading" || isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background-dark">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <p className="text-white/60">Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-screen w-full overflow-hidden">
            <Sidebar />
            <main className="flex-1 flex flex-col overflow-y-auto bg-background-light dark:bg-background-dark p-8">
                <div className="max-w-2xl mx-auto w-full">
                    <div className="flex items-center gap-4 mb-8">
                        <Link
                            href="/courses"
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-all hover:bg-slate-200 dark:bg-[#2e2839] dark:text-white dark:hover:bg-[#3a3347]"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                        </Link>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white animate-fade-in">Create New Course</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-up">
                        <div className="rounded-2xl bg-white dark:bg-[#2e2839] p-6 shadow-sm ring-1 ring-slate-900/5 dark:ring-white/10">
                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="courseName" className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                                        Course Name
                                    </label>
                                    <input
                                        type="text"
                                        id="courseName"
                                        value={courseName}
                                        onChange={(e) => setCourseName(e.target.value)}
                                        className="w-full rounded-xl border-none bg-slate-100 px-4 py-3 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-primary dark:bg-[#1a1622] dark:text-white dark:placeholder-[#a69db9]"
                                        placeholder="e.g., Linear Algebra Fundamentals"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="subject" className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                                        Subject
                                    </label>
                                    <input
                                        type="text"
                                        id="subject"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        className="w-full rounded-xl border-none bg-slate-100 px-4 py-3 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-primary dark:bg-[#1a1622] dark:text-white dark:placeholder-[#a69db9]"
                                        placeholder="e.g., Mathematics"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="description" className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        id="description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={4}
                                        className="w-full rounded-xl border-none bg-slate-100 px-4 py-3 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-primary dark:bg-[#1a1622] dark:text-white dark:placeholder-[#a69db9] resize-none"
                                        placeholder="What will you learn in this course?"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Link
                                href="/courses"
                                className="flex-1 rounded-xl px-6 py-3 text-center text-sm font-semibold text-slate-600 transition-all hover:bg-slate-100 dark:text-[#a69db9] dark:hover:bg-[#2e2839]"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                className="flex-1 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Create Course
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    )
}
