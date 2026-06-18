"use client"

import { Sidebar } from "@/components/Sidebar"
import { EmptyState } from "@/components/EmptyState"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { isOnboardingComplete } from "@/lib/userStore"

export default function Schedule() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [isMounted, setIsMounted] = useState(false)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { setIsMounted(true) }, [])

    const email = session?.user?.email
    const isRedirecting = status === "loading" ||
                          status === "unauthenticated" ||
                          (status === "authenticated" && email && isMounted && !isOnboardingComplete(email))
    const isLoading = !isMounted || isRedirecting

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login")
        } else if (status === "authenticated" && email && isMounted) {
            if (!isOnboardingComplete(email)) {
                router.push("/onboarding")
            }
        }
    }, [status, email, router, isMounted])

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
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6 animate-fade-in">Schedule</h1>

                <div className="flex-1 flex items-center justify-center">
                    <div className="rounded-2xl bg-white dark:bg-[#2e2839] shadow-sm ring-1 ring-slate-900/5 dark:ring-white/10 max-w-md w-full">
                        <EmptyState
                            icon="calendar_month"
                            title="No scheduled events"
                            description="Plan your study sessions, quizzes, and deadlines to stay organized."
                            actionLabel="Add Event"
                            actionHref="/schedule/create"
                        />
                    </div>
                </div>
            </main>
        </div>
    )
}
