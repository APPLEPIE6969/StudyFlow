"use client"

import { Sidebar } from "@/components/Sidebar"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  isOnboardingComplete,
  getUserProfile,
  isTutorialComplete,
  recordActivity,
  type UserStats
} from "@/lib/userStore"

import { useLanguage } from "@/lib/i18n"
import { EmptyState } from "@/components/EmptyState"
import { TutorialOverlay } from "@/components/TutorialOverlay"
import { AnimatedDropdown } from "@/components/AnimatedDropdown"
import { useTheme } from "@/components/ThemeProvider"

const defaultStats: UserStats = {
  totalQuizzes: 0,
  accuracyScore: 0,
  hoursStudied: 0,
  dailyStreak: 0,
  currentLevel: 1,
  xpEarned: 0,
  xpToNextLevel: 100,
}

// User's actual data (empty for new users)
interface UserData {
  courses: Array<{
    id: string
    title: string
    subject: string
    progress: number
    image: string
    status: "continue" | "suggested" | "almost-done"
  }>
  upcomingEvents: Array<{
    id: string
    title: string
    date: string
    type: "quiz" | "group" | "deadline"
  }>
  weeklyActivity: number[] // 7 days of activity data
}

const emptyUserData: UserData = {
  courses: [],
  upcomingEvents: [],
  weeklyActivity: [0, 0, 0, 0, 0, 0, 0],
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t } = useLanguage()
  const [userStats, setUserStats] = useState<UserStats>(defaultStats)
  const [userData, setUserData] = useState<UserData>(emptyUserData)
  const [isLoading, setIsLoading] = useState(true)
  const [showTutorial, setShowTutorial] = useState(false)
  const [activityPeriod, setActivityPeriod] = useState("week")
  const { theme, toggleTheme, mounted } = useTheme()

  // Check authentication and onboarding
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (status === "authenticated" && session?.user?.email) {
      // Check if user has completed onboarding
      if (!isOnboardingComplete(session.user.email)) {
        router.push("/onboarding")
        return
      }

      // Record today's activity
      recordActivity()

      // Load user stats
      const profile = getUserProfile()
      if (profile?.stats) {
        setUserStats(profile.stats)
      }


      // Check if tutorial should be shown
      if (!isTutorialComplete(session.user.email)) {
        setShowTutorial(true)
      }

      // Load user data (empty for new users)
      setUserData(emptyUserData)
      setIsLoading(false)
    }
  }, [status, session, router])

  // Get display name from session or profile
  const displayName = session?.user?.name?.split(" ")[0] || "Learner"

  // Check if user has any data
  const hasCourses = userData.courses.length > 0
  const hasActivity = userData.weeklyActivity.some(v => v > 0)
  const hasEvents = userData.upcomingEvents.length > 0

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
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-background-dark">
      {/* Tutorial Overlay */}
      {showTutorial && session?.user?.email && (
        <TutorialOverlay
          userEmail={session.user.email}
          onComplete={() => setShowTutorial(false)}
        />
      )}

      <Sidebar />


      {/* Main Content */}
      <main className="flex flex-1 flex-col overflow-y-auto bg-slate-50 dark:bg-background-dark">
        {/* Floating Header */}
        <header className="sticky top-4 z-20 mx-4 mb-4 flex h-16 items-center justify-between rounded-2xl border border-slate-200 bg-white/80 px-6 backdrop-blur-md shadow-sm dark:border-white/5 dark:bg-[#131118]/80 transition-all">
          <div className="flex items-center gap-4 md:hidden">
            <button className="text-slate-500 hover:text-slate-900 dark:text-white">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <span className="text-lg font-bold text-slate-900 dark:text-white">StudyFlow</span>
          </div>

          {/* Search */}
          <div className="hidden flex-1 md:flex max-w-md">
            <div className="relative w-full group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
              <input
                className="h-10 w-full rounded-xl border-none bg-slate-100 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-primary/50 dark:bg-surface-dark-lighter dark:text-white dark:placeholder-text-secondary transition-all"
                placeholder={t("dashboard.search_placeholder")}
                type="text"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-all hover:bg-slate-200 hover:scale-105 dark:bg-surface-dark-lighter dark:text-white dark:hover:bg-white/10 relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#131118]"></span>
            </button>
            <button
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-all hover:bg-slate-200 hover:scale-105 dark:bg-surface-dark-lighter dark:text-white dark:hover:bg-white/10"
              title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              <span className={`material-symbols-outlined ${!mounted ? 'invisible' : ''}`}>
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
            <div className="h-9 w-9 overflow-hidden rounded-full ring-2 ring-white dark:ring-white/10 md:hidden shadow-md">
              <div className="h-full w-full bg-linear-to-br from-primary to-purple-400"></div>
            </div>
          </div>
        </header>

        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-6 lg:p-10">
          {/* Welcome Section + Stats */}
          <section className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between animate-fade-in" data-tutorial="welcome">
            <div className="flex flex-col gap-2">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white lg:text-4xl">
                {t("dashboard.welcome", displayName)} 👋
              </h2>
              <p className="text-slate-500 dark:text-text-secondary">
                {userStats.hoursStudied > 0
                  ? <span dangerouslySetInnerHTML={{ __html: t("dashboard.learned_minutes", Math.round(userStats.hoursStudied * 60)) }} />
                  : t("dashboard.start_learning")
                }
              </p>
            </div>

            {/* Quick Stats Cards */}
            <div className="flex flex-wrap gap-4">
              {/* Streak */}
              <div className="flex min-w-[140px] flex-col gap-1 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5 dark:bg-surface-dark-lighter dark:ring-white/10 animate-slide-up stagger-1 transition-all hover:scale-105 hover:shadow-lg">
                <div className="flex items-center gap-2 text-slate-500 dark:text-text-secondary">
                  <span className="material-symbols-outlined text-orange-500 fill">local_fire_department</span>
                  <span className="text-xs font-semibold uppercase tracking-wider">{t("stats.streak")}</span>
                </div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">{userStats.dailyStreak}</span>
                  <span className="text-sm font-medium text-slate-500 dark:text-text-secondary">{t("stats.days")}</span>
                </div>
              </div>

              {/* Level */}
              <div className="flex min-w-[200px] flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5 dark:bg-surface-dark-lighter dark:ring-white/10 animate-slide-up stagger-2 transition-all hover:scale-105 hover:shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-text-secondary">
                    <span className="material-symbols-outlined text-primary">military_tech</span>
                    <span className="text-xs font-semibold uppercase tracking-wider">{t("stats.level")}</span>
                  </div>
                  <span className="text-xs font-bold text-primary">{t("sidebar.level", userStats.currentLevel)}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-text-secondary">
                    <span>{t("stats.xp")}</span>
                    <span>{userStats.xpEarned} / {userStats.xpToNextLevel}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-background-dark">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-primary to-purple-400 transition-all duration-500"
                      style={{ width: `${(userStats.xpEarned / userStats.xpToNextLevel) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <section data-tutorial="quick-actions" className="animate-fade-in-up stagger-1">
            <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">{t("dashboard.quick_actions")}</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Link href="/create" className="group relative flex flex-col items-start gap-4 overflow-hidden rounded-2xl bg-primary p-6 text-white transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] animate-scale-in stagger-1">
                <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm transition-transform group-hover:scale-110">
                  <span className="material-symbols-outlined text-3xl">auto_awesome</span>
                </div>
                <div className="relative z-10 text-left">
                  <span className="block text-lg font-bold">{t("actions.generate_quiz")}</span>
                  <span className="text-sm text-purple-100 opacity-90">{t("actions.generate_quiz_desc")}</span>
                </div>
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10 blur-2xl"></div>
              </Link>

              <Link href="/study/explanation" className="group relative flex flex-col items-start gap-4 overflow-hidden rounded-2xl bg-surface-dark-lighter p-6 text-white ring-1 ring-white/10 transition-all hover:bg-surface-dark-lighter/80 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] animate-scale-in stagger-2">
                <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 text-primary transition-transform group-hover:scale-110">
                  <span className="material-symbols-outlined text-3xl">lightbulb</span>
                </div>
                <div className="relative z-10 text-left">
                  <span className="block text-lg font-bold">{t("actions.explain")}</span>
                  <span className="text-sm text-text-secondary">{t("actions.explain_desc")}</span>
                </div>
              </Link>

              <Link href="/create" className="group relative flex flex-col items-start gap-4 overflow-hidden rounded-2xl bg-surface-dark-lighter p-6 text-white ring-1 ring-white/10 transition-all hover:bg-surface-dark-lighter/80 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] animate-scale-in stagger-3">
                <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 transition-transform group-hover:scale-110">
                  <span className="material-symbols-outlined text-3xl">add_notes</span>
                </div>
                <div className="relative z-10 text-left">
                  <span className="block text-lg font-bold">{t("actions.new_note")}</span>
                  <span className="text-sm text-text-secondary">{t("actions.new_note_desc")}</span>
                </div>
              </Link>

              <Link href="/profile" className="group relative flex flex-col items-start gap-4 overflow-hidden rounded-2xl bg-surface-dark-lighter p-6 text-white ring-1 ring-white/10 transition-all hover:bg-surface-dark-lighter/80 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] animate-scale-in stagger-4">
                <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 transition-transform group-hover:scale-110">
                  <span className="material-symbols-outlined text-3xl">history</span>
                </div>
                <div className="relative z-10 text-left">
                  <span className="block text-lg font-bold">{t("actions.review")}</span>
                  <span className="text-sm text-text-secondary">{t("actions.review_desc")}</span>
                </div>
              </Link>
            </div>
          </section>

          {/* Recommendations Grid */}
          <section data-tutorial="courses" className="animate-fade-in-up stagger-2">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t("dashboard.courses")}</h3>
              {hasCourses && (
                <Link className="text-sm font-medium text-primary hover:text-primary/80 transition-colors" href="/courses">
                  {t("common.view_all")}
                </Link>
              )}
            </div>

            {hasCourses ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {userData.courses.map((course, index) => (
                  <div key={course.id} className={`group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5 transition-all hover:shadow-md hover:scale-[1.02] dark:bg-surface-dark-lighter dark:ring-white/10 animate-fade-in-up stagger-${index + 1}`}>
                    <div
                      className="h-32 w-full bg-cover bg-center"
                      style={{ backgroundImage: `url("${course.image}")` }}
                    >
                      <div className="flex h-full w-full items-start justify-between bg-black/40 p-4 backdrop-blur-[2px]">
                        <span className="rounded-lg bg-black/60 px-2 py-1 text-xs font-bold text-white backdrop-blur-md">{course.subject}</span>
                        <button className="rounded-full bg-white/20 p-1.5 text-white hover:bg-white/40 transition-colors">
                          <span className="material-symbols-outlined text-sm">bookmark</span>
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h4 className="mb-1 text-lg font-bold text-slate-900 group-hover:text-primary dark:text-white transition-colors">{course.title}</h4>
                      <div className="mt-auto flex flex-col gap-2">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-400">
                          <span>{t("common.progress")}</span>
                          <span>{course.progress}%</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-background-dark">
                          <div className="h-full bg-primary transition-all duration-500" style={{ width: `${course.progress}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5 dark:bg-surface-dark-lighter dark:ring-white/10 overflow-hidden">
                <EmptyState
                  icon="menu_book"
                  title={t("dashboard.no_courses")}
                  description={t("dashboard.no_courses_desc")}
                  actionLabel={t("dashboard.browse_courses")}
                  actionHref="/courses"
                />
              </div>
            )}
          </section>

          {/* Recent Activity / Timeline */}
          <section className="grid gap-6 lg:grid-cols-3 animate-fade-in-up stagger-3" data-tutorial="activity">
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5 dark:bg-surface-dark-lighter dark:ring-white/10 lg:col-span-2 transition-all hover:shadow-lg">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t("dashboard.activity")}</h3>
                <AnimatedDropdown
                  options={[
                    { value: "week", label: t("common.this_week") },
                    { value: "month", label: t("common.this_month") },
                  ]}
                  value={activityPeriod}
                  onChange={setActivityPeriod}
                />
              </div>

              {hasActivity ? (
                <div className="flex h-48 items-end gap-2 sm:gap-4">
                  <div className="flex w-full flex-col gap-2">
                    <div className="flex h-full items-end justify-between gap-1">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => (
                        <div key={day} className="group relative flex h-full w-full flex-col justify-end">
                          <div
                            className="w-full rounded-t bg-primary transition-all duration-500 hover:shadow-[0_0_15px_rgba(108,43,238,0.3)]"
                            style={{
                              height: `${userData.weeklyActivity[index]}%`,
                              animationDelay: `${index * 100}ms`
                            }}
                          ></div>
                          <span className="mt-2 text-center text-[10px] text-slate-400">{day}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyState
                  icon="bar_chart"
                  title={t("dashboard.no_activity")}
                  description={t("dashboard.no_activity_desc")}
                  actionLabel={t("common.start_learning")}
                  actionHref="/courses"
                  className="py-8"
                />
              )}
            </div>

            {/* Upcoming */}
            <div className="flex flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5 dark:bg-surface-dark-lighter dark:ring-white/10 lg:col-span-1 transition-all hover:shadow-lg">
              <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">{t("dashboard.up_next")}</h3>

              {hasEvents ? (
                <div className="flex flex-col gap-4">
                  {userData.upcomingEvents.map((event, index) => (
                    <div key={event.id} className={`flex items-center gap-3 animate-slide-up stagger-${index + 1}`}>
                      <div className={`flex h-12 w-12 flex-none items-center justify-center rounded-xl transition-all hover:scale-110 ${event.type === "quiz" ? "bg-orange-500/10 text-orange-500" :
                        event.type === "group" ? "bg-blue-500/10 text-blue-500" :
                          "bg-red-500/10 text-red-500"
                        }`}>
                        <span className="material-symbols-outlined">
                          {event.type === "quiz" ? "event_note" : event.type === "group" ? "group" : "schedule"}
                        </span>
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-slate-900 dark:text-white">{event.title}</h5>
                        <p className="text-xs text-slate-500 dark:text-text-secondary">{event.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon="event"
                  title={t("dashboard.no_events")}
                  description={t("dashboard.no_events_desc")}
                  actionLabel={t("dashboard.schedule_event")}
                  actionHref="/schedule"
                  className="py-6"
                />
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Mobile Navigation Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-slate-200 bg-white dark:border-white/5 dark:bg-background-dark md:hidden">
        <Link className="flex flex-col items-center gap-1 text-primary transition-transform hover:scale-110" href="/dashboard">
          <span className="material-symbols-outlined fill text-xl">dashboard</span>
          <span className="text-[10px] font-medium">{t("nav.dashboard")}</span>
        </Link>
        <Link className="flex flex-col items-center gap-1 text-slate-500 dark:text-text-secondary transition-transform hover:scale-110" href="/courses">
          <span className="material-symbols-outlined text-xl">menu_book</span>
          <span className="text-[10px] font-medium">{t("nav.courses")}</span>
        </Link>
        <Link className="flex flex-col items-center gap-1 text-slate-500 dark:text-text-secondary transition-transform hover:scale-110" href="/study/explanation">
          <span className="material-symbols-outlined text-xl">psychology</span>
          <span className="text-[10px] font-medium">{t("nav.tutor")}</span>
        </Link>
        <Link className="flex flex-col items-center gap-1 text-slate-500 dark:text-text-secondary transition-transform hover:scale-110" href="/profile">
          <span className="material-symbols-outlined text-xl">person</span>
          <span className="text-[10px] font-medium">{t("profile.title")}</span>
        </Link>
      </div>
    </div>
  )
}
