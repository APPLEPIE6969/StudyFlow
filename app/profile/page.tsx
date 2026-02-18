"use client"

import { Sidebar } from "@/components/Sidebar"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { getUserProfile, saveUserProfile } from "@/lib/userStore"
import { EmptyState } from "@/components/EmptyState"
import { Select } from "@/components/ui/Select"
import { useState, useEffect } from "react"
import { LANGUAGES } from "@/lib/constants"
import { useRouter } from "next/navigation"

import { useLanguage } from "@/lib/i18n"

import { useTheme } from "@/components/ThemeProvider"

export default function Profile() {
  const { data: session } = useSession()
  const router = useRouter()
  const userProfile = getUserProfile()
  const { language, setLanguage, t } = useLanguage()
  const { theme, toggleTheme } = useTheme()

  // State for tabs and settings
  const [activeTab, setActiveTab] = useState("overview")
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [showNotifications, setShowNotifications] = useState(false)

  // Update language in user profile when changed
  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage)
    if (session?.user?.email) {
      // Save even if userProfile is null (will create new)
      saveUserProfile({
        email: session.user.email,
        language: newLanguage
      })
    }
  }

  // Combine session and stored profile data
  const displayName = userProfile?.name || session?.user?.name || "Guest User"
  const userImage = session?.user?.image || userProfile?.image
  const userEmail = session?.user?.email || ""
  const joinDate = userProfile?.createdAt
    ? new Date(userProfile.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "New Member"
  const stats = userProfile?.stats

  // Check if user has any learning content (empty for new users)
  const hasLearningContent = false
  const hasBookmarks = false

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-8 animate-fade-in">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1 rounded-2xl p-6 bg-white dark:bg-surface-dark-lighter border border-slate-200 dark:border-surface-dark-lighter/50 relative overflow-hidden group transition-all hover:shadow-lg hover:scale-[1.02] animate-slide-up stagger-1">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-6xl text-primary">quiz</span>
                </div>
                <p className="text-slate-500 dark:text-text-secondary text-sm font-medium uppercase tracking-wider">{t("profile.total_quizzes")}</p>
                <div className="flex items-baseline gap-3 mt-1">
                  <p className="text-slate-900 dark:text-white text-3xl font-bold">{stats?.totalQuizzes || 0}</p>
                </div>
                <p className="text-slate-500 dark:text-text-secondary text-xs mt-2">
                  {t("profile.total_quizzes_desc")}
                </p>
              </div>
              <div className="flex flex-col gap-1 rounded-2xl p-6 bg-white dark:bg-surface-dark-lighter border border-slate-200 dark:border-surface-dark-lighter/50 relative overflow-hidden group transition-all hover:shadow-lg hover:scale-[1.02] animate-slide-up stagger-2">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-6xl text-primary">target</span>
                </div>
                <p className="text-slate-500 dark:text-text-secondary text-sm font-medium uppercase tracking-wider">{t("profile.accuracy_score")}</p>
                <div className="flex items-baseline gap-3 mt-1">
                  <p className="text-slate-900 dark:text-white text-3xl font-bold">{stats?.accuracyScore || 0}%</p>
                </div>
                <p className="text-slate-500 dark:text-text-secondary text-xs mt-2">
                  {t("profile.accuracy_score_desc")}
                </p>
              </div>
              <div className="flex flex-col gap-1 rounded-2xl p-6 bg-white dark:bg-surface-dark-lighter border border-slate-200 dark:border-surface-dark-lighter/50 relative overflow-hidden group transition-all hover:shadow-lg hover:scale-[1.02] animate-slide-up stagger-3">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-6xl text-primary">schedule</span>
                </div>
                <p className="text-slate-500 dark:text-text-secondary text-sm font-medium uppercase tracking-wider">{t("profile.hours_studied")}</p>
                <div className="flex items-baseline gap-3 mt-1">
                  <p className="text-slate-900 dark:text-white text-3xl font-bold">{stats?.hoursStudied || 0}h</p>
                </div>
                <p className="text-slate-500 dark:text-text-secondary text-xs mt-2">
                  {t("dashboard.learned_minutes", Math.round((stats?.hoursStudied || 0) * 60))}
                </p>
              </div>
            </div>

            {/* Recent Activity Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-900 dark:text-white text-xl font-bold">{t("profile.continue_learning")}</h3>
                {hasLearningContent && (
                  <Link className="text-primary text-sm font-medium hover:underline" href="#">{t("profile.view_all")}</Link>
                )}
              </div>

              {hasLearningContent ? (
                <div className="space-y-3">
                  {/* Content would be rendered here when user has data */}
                </div>
              ) : (
                <div className="rounded-2xl bg-white dark:bg-surface-dark-lighter border border-slate-200 dark:border-surface-dark-lighter/50">
                  <EmptyState
                    icon="school"
                    title={t("profile.nothing_to_continue")}
                    description={t("profile.nothing_to_continue_desc")}
                    actionLabel={t("profile.generate_quiz_action")}
                    actionHref="/quiz/generator"
                  />
                </div>
              )}
            </section>
          </div>
        )
      case "settings":
        return (
          <div className="space-y-8 animate-fade-in">
            <section className="bg-white dark:bg-surface-dark-lighter border border-slate-200 dark:border-surface-dark-lighter/50 rounded-2xl p-6">
              <h3 className="text-slate-900 dark:text-white text-xl font-bold mb-6">{t("profile.preferences")}</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-surface-dark text-slate-500 dark:text-text-secondary">
                      <span className="material-symbols-outlined">dark_mode</span>
                    </div>
                    <div>
                      <p className="text-slate-900 dark:text-white font-medium">{t("profile.theme")}</p>
                      <p className="text-slate-500 dark:text-text-secondary text-sm">Adjust the appearance of the app</p>
                    </div>
                  </div>
                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={theme === "dark"}
                      onChange={toggleTheme}
                      aria-label={t("profile.theme") || "Toggle theme"}
                    />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-surface-dark peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-surface-dark-lighter/50 peer-checked:bg-primary"></div>
                  </label>
                </div>
                <div className="h-px bg-slate-200 dark:bg-surface-dark-lighter/50 w-full"></div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-surface-dark text-slate-500 dark:text-text-secondary">
                      <span className="material-symbols-outlined">notifications</span>
                    </div>
                    <div>
                      <p className="text-slate-900 dark:text-white font-medium">{t("profile.notifications")}</p>
                      <p className="text-slate-500 dark:text-text-secondary text-sm">Receive daily summary and study reminders</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={emailNotifications}
                      onChange={() => setEmailNotifications(!emailNotifications)}
                    />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-surface-dark peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-surface-dark-lighter/50 peer-checked:bg-primary"></div>
                  </label>
                </div>
                <div className="h-px bg-slate-200 dark:bg-surface-dark-lighter/50 w-full"></div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-surface-dark text-slate-500 dark:text-text-secondary">
                      <span className="material-symbols-outlined">language</span>
                    </div>
                    <div>
                      <p className="text-slate-900 dark:text-white font-medium">{t("profile.language")}</p>
                      <p className="text-slate-500 dark:text-text-secondary text-sm">Select your preferred language</p>
                    </div>
                  </div>
                  <div className="w-40">
                    <Select
                      options={LANGUAGES as any}
                      value={language}
                      onChange={handleLanguageChange}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Danger Zone */}
            <section className="opacity-80">
              <h3 className="text-red-500 dark:text-red-400 text-sm font-bold uppercase tracking-wider mb-3">Danger Zone</h3>
              <div className="border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-slate-900 dark:text-white font-medium">{t("profile.delete")}</p>
                  <p className="text-slate-500 dark:text-text-secondary text-sm">Permanently delete your account and all data.</p>
                </div>
                <button
                  onClick={() => confirm("Are you sure? This action cannot be undone.")}
                  className="text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 px-4 py-2 rounded-xl font-medium transition-colors text-sm"
                >
                  {t("profile.delete")}
                </button>
              </div>
            </section>
          </div>
        )
      default:
        return (
          <div className="flex items-center justify-center py-20">
            <EmptyState
              icon="construction"
              title={t("profile.coming_soon")}
              description={t("profile.coming_soon_desc")}
              actionLabel={t("profile.go_back")}
              onAction={() => setActiveTab("overview")}
            />
          </div>
        )
    }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex flex-1 flex-col overflow-y-auto bg-background-light dark:bg-background-dark">
        {/* Header (Dashboard Style for consistency) */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white/80 px-6 backdrop-blur-md dark:border-surface-dark-lighter dark:bg-surface-dark/80">
          <div className="flex items-center gap-4 md:hidden">
            <button className="text-slate-500 hover:text-slate-900 dark:text-white">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <span className="text-lg font-bold text-slate-900 dark:text-white">LearnAI</span>
          </div>
          <div className="hidden flex-1 md:flex max-w-md">
            {/* Empty spacer or search */}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-all hover:bg-slate-200 hover:scale-105 dark:bg-surface-dark-lighter dark:text-white dark:hover:bg-surface-dark-lighter/80"
              >
                <span className="material-symbols-outlined">notifications</span>
                {/* Notification Badge */}
                <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-surface-dark"></span>
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-surface-dark-lighter/50 dark:bg-surface-dark-lighter animate-fade-in-up">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-slate-900 dark:text-white">{t("profile.notifications_title")}</h4>
                    <button className="text-xs text-primary hover:underline">{t("profile.mark_all_read")}</button>
                  </div>
                  <div className="space-y-3">
                    <div className="flex gap-3 items-start">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                        <span className="material-symbols-outlined text-sm">rocket_launch</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{t("profile.welcome_message")}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t("profile.welcome_desc")}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{t("profile.just_now")}</p>
                      </div>
                    </div>
                    <div className="flex gap-3 items-start opacity-60">
                      <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center shrink-0 text-green-500">
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">Profile completed</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">You're all set up.</p>
                        <p className="text-[10px] text-slate-400 mt-1">1h ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-all hover:bg-slate-200 hover:scale-105 dark:bg-surface-dark-lighter dark:text-white dark:hover:bg-surface-dark-lighter/80"
              aria-label={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              <span className="material-symbols-outlined">{theme === "dark" ? "light_mode" : "dark_mode"}</span>
            </button>
            <div className="h-8 w-8 overflow-hidden rounded-full md:hidden">
              <div className="h-full w-full bg-linear-to-br from-primary to-purple-400"></div>
            </div>
          </div>
        </header>

        <div className="flex-1 flex justify-center py-8 px-4 md:px-10">
          <div className="w-full max-w-[1200px] flex flex-col gap-8 animate-fade-in">
            {/* Profile Header Section */}
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between p-6 rounded-2xl bg-white dark:bg-surface-dark-lighter border border-slate-200 dark:border-surface-dark-lighter/50 shadow-lg transition-all hover:shadow-xl">
              <div className="flex gap-6 items-center">
                <div className="relative group cursor-pointer">
                  <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-24 w-24 md:h-32 md:w-32 ring-4 ring-slate-100 dark:ring-surface-dark-lighter/50 overflow-hidden"
                  >
                    {userImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={userImage} alt={displayName} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-linear-to-br from-primary to-purple-400" />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-white">edit</span>
                  </div>
                  <div className="absolute bottom-1 right-1 bg-primary text-white p-1 rounded-full border-2 border-white dark:border-surface-dark-lighter">
                    <span className="material-symbols-outlined text-sm">verified</span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <h1 className="text-slate-900 dark:text-white text-3xl font-bold leading-tight">{displayName}</h1>
                  <p className="text-slate-500 dark:text-text-secondary text-base mt-1">{userEmail}</p>
                  <div className="flex items-center gap-2 mt-2 text-sm text-slate-500 dark:text-text-secondary">
                    <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                    <span>Joined {joinDate}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3 w-full md:w-auto">
                <button className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98]">
                  <span className="material-symbols-outlined text-[20px]">workspace_premium</span>
                  {t("profile.manage_subscription")}
                </button>
                <button className="flex items-center justify-center gap-2 bg-slate-100 dark:bg-surface-dark hover:bg-slate-200 dark:hover:bg-surface-dark-lighter text-slate-700 dark:text-white px-6 py-2.5 rounded-xl font-medium transition-all border border-slate-200 dark:border-surface-dark-lighter/50">
                  <span className="material-symbols-outlined text-[20px]">share</span>
                  {t("profile.share_profile")}
                </button>
              </div>
            </div>

            {/* Main Content Split Layout */}
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar Tabs */}
              <aside className="w-full lg:w-64 shrink-0">
                <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap text-left ${activeTab === "overview" ? "bg-primary/10 text-primary font-medium border-l-4 border-primary" : "text-slate-500 dark:text-text-secondary hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-surface-dark-lighter"}`}
                  >
                    <span className="material-symbols-outlined">dashboard</span>
                    {t("nav.dashboard")}
                  </button>
                  <button
                    onClick={() => setActiveTab("history")}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap text-left ${activeTab === "history" ? "bg-primary/10 text-primary font-medium border-l-4 border-primary" : "text-slate-500 dark:text-text-secondary hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-surface-dark-lighter"}`}
                  >
                    <span className="material-symbols-outlined">history</span>
                    {t("profile.history")}
                  </button>
                  <button
                    onClick={() => setActiveTab("bookmarks")}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap text-left ${activeTab === "bookmarks" ? "bg-primary/10 text-primary font-medium border-l-4 border-primary" : "text-slate-500 dark:text-text-secondary hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-surface-dark-lighter"}`}
                  >
                    <span className="material-symbols-outlined">bookmark</span>
                    {t("profile.bookmarks")}
                    {hasBookmarks && (
                      <span className="ml-auto bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">3</span>
                    )}
                  </button>
                  <Link
                    href="/quizzes"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 dark:text-text-secondary hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-surface-dark-lighter transition-all whitespace-nowrap"
                  >
                    <span className="material-symbols-outlined">folder_special</span>
                    {t("nav.quizzes")}
                  </Link>
                  <div className="h-px bg-slate-200 dark:bg-surface-dark-lighter/50 my-2 hidden lg:block"></div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-text-secondary uppercase tracking-wider px-4 py-2 hidden lg:block">{t("nav.settings")}</p>
                  <button
                    onClick={() => setActiveTab("settings")}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap text-left ${activeTab === "settings" ? "bg-primary/10 text-primary font-medium border-l-4 border-primary" : "text-slate-500 dark:text-text-secondary hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-surface-dark-lighter"}`}
                  >
                    <span className="material-symbols-outlined">settings</span>
                    {t("nav.settings")}
                  </button>
                  <button
                    onClick={() => setActiveTab("subscription")}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap text-left ${activeTab === "subscription" ? "bg-primary/10 text-primary font-medium border-l-4 border-primary" : "text-slate-500 dark:text-text-secondary hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-surface-dark-lighter"}`}
                  >
                    <span className="material-symbols-outlined">credit_card</span>
                    {t("profile.subscription")}
                  </button>
                </nav>
              </aside>

              {/* Tab Content Area */}
              <div className="flex-1">
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
