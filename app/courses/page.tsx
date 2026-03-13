"use client"

import { Sidebar } from "@/components/Sidebar"
import { EmptyState } from "@/components/EmptyState"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { isOnboardingComplete } from "@/lib/userStore"
import Link from "next/link"
import { useLanguage } from "@/lib/i18n"

// Course data structure
interface Course {
  id: string
  title: string
  subject: string
  description: string
  progress: number
  image: string
  lessonsCompleted: number
  totalLessons: number
}

export default function Courses() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t } = useLanguage()
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (status === "authenticated" && session?.user?.email) {
      if (!isOnboardingComplete(session.user.email)) {
        router.push("/onboarding")
        return
      }

      // Load user's courses (empty for new users)
      // In a real app, this would fetch from an API
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCourses([])
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoading(false)
    }
  }, [status, session, router])

  if (status === "loading" || isLoading) {
    return (
      <div className="flex h-screen w-full overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-y-auto bg-background-light dark:bg-background-dark p-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-tight">{t("nav.courses")}</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-surface-dark-lighter border border-slate-200 dark:border-surface-dark-lighter/50 rounded-xl overflow-hidden">
                <div className="h-40 bg-slate-100 dark:bg-surface-dark animate-pulse" />
                <div className="p-4">
                  <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-800 rounded mb-2 animate-pulse" />
                  <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-y-auto bg-background-light dark:bg-background-dark p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white animate-fade-in">{t("nav.courses")}</h1>
          {courses.length > 0 && (
            <Link
              href="/courses/create"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary/90 hover:scale-105 animate-fade-in stagger-1"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              {t("common.create")}
            </Link>
          )}
        </div>

        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, index) => (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className={`group bg-white dark:bg-surface-dark-lighter border border-slate-200 dark:border-surface-dark-lighter/50 rounded-2xl overflow-hidden hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer animate-fade-in-up stagger-${(index % 5) + 1}`}
              >
                <div
                  className="h-40 bg-cover bg-center"
                  style={{ backgroundImage: `url("${course.image}")` }}
                >
                  <div className="flex h-full w-full items-start justify-between bg-black/40 p-4 backdrop-blur-[2px]">
                    <span className="rounded-lg bg-black/60 px-2 py-1 text-xs font-bold text-white backdrop-blur-md">
                      {course.subject}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors mb-2">
                    {course.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-text-secondary line-clamp-2 mb-4">
                    {course.description}
                  </p>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs font-medium text-slate-400">
                      <span>{course.lessonsCompleted} / {course.totalLessons} {t("dashboard.courses").toLowerCase()}</span>
                      <span>{course.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-surface-dark">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center animate-fade-in-up stagger-1">
            <div className="rounded-2xl bg-white dark:bg-surface-dark-lighter shadow-sm ring-1 ring-slate-900/5 dark:ring-white/10 max-w-md w-full hover:shadow-md transition-shadow">
              <EmptyState
                icon="school"
                title={t("dashboard.no_courses")}
                description={t("dashboard.no_courses_desc")}
                actionLabel={t("common.create")}
                actionHref="/courses/create"
              />
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
