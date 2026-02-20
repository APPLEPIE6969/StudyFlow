"use client"

import { Sidebar } from "@/components/Sidebar"
import Link from "next/link"
import { useLanguage } from "@/lib/i18n"

const resources = [
  {
    title: "AI Quiz Generation Guide",
    description: "Learn how to get the most accurate quizzes from the AI by using better document summaries.",
    icon: "psychology",
    type: "Guide",
    color: "text-purple-500",
    bgColor: "bg-purple-100 dark:bg-purple-500/10",
    href: "/quiz/generator"
  },
  {
    title: "Effective Memory Techniques",
    description: "A summary of active recall and spaced repetition methods for students.",
    icon: "psychology",
    type: "Article",
    color: "text-emerald-500",
    bgColor: "bg-emerald-100 dark:bg-emerald-500/10",
    href: "/study/explanation"
  },
  {
    title: "StudyFlow Shortcuts",
    description: "Master the keyboard shortcuts and productivity features within StudyFlow.",
    icon: "bolt",
    type: "Tool",
    color: "text-orange-500",
    bgColor: "bg-orange-100 dark:bg-orange-500/10",
    href: "/profile"
  },
  {
    title: "Focus Music Playlists",
    description: "Curated Lo-Fi and classical music lists to help you stay in the flow.",
    icon: "music_note",
    type: "Media",
    color: "text-blue-500",
    bgColor: "bg-blue-100 dark:bg-blue-500/10",
    href: "#"
  }
]

export default function Resources() {
  const { t } = useLanguage()
  return (
    <div className="flex min-h-screen w-full bg-background-light dark:bg-background-dark">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto w-full">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 animate-fade-in">{t("nav.resources")}</h1>
          <p className="text-slate-500 dark:text-text-secondary mb-8 animate-fade-in stagger-1">Discover guides and articles to help you master your study routine.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resources.map((res, i) => (
              <Link
                key={i}
                href={res.href}
                className={`group flex flex-col p-6 bg-white dark:bg-surface-dark-lighter border border-slate-200 dark:border-surface-dark-lighter/50 rounded-2xl hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer animate-fade-in-up stagger-${(i % 5) + 1}`}
              >
                <div className={`size-12 rounded-xl ${res.bgColor} flex items-center justify-center ${res.color} mb-4 group-hover:scale-110 transition-transform`}>
                  <span className="material-symbols-outlined text-2xl">{res.icon}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${res.bgColor} ${res.color}`}>
                    {res.type}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                  {res.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-text-secondary leading-relaxed">
                  {res.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
