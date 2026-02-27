"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/lib/i18n"

const insights = [
  {
    text: "Spaced repetition is one of the most effective ways to learn. Review material at increasing intervals to move it to long-term memory.",
    author: "Learning Science"
  },
  {
    text: "The Pomodoro Technique (25 min work, 5 min break) helps maintain focus and prevents mental fatigue.",
    author: "Francesco Cirillo"
  },
  {
    text: "Teaching someone else is the best way to learn. Try explaining a concept you just studied to an imaginary student.",
    author: "The Feynman Technique"
  },
  {
    text: "Sleep is crucial for memory consolidation. Pulling an all-nighter is often less effective than getting a good night's rest.",
    author: "Sleep Science"
  },
  {
    text: "Active recall (testing yourself) is far more effective than passive re-reading. Quiz yourself often!",
    author: "Study Tips"
  },
  {
    text: "Interleaving different subjects improves problem-solving skills better than blocking one subject at a time.",
    author: "Learning Strategy"
  },
  {
    text: "Visualizing concepts can help you understand and remember complex information better.",
    author: "Visualization Technique"
  },
  {
    text: "Setting specific, achievable goals for each study session keeps you motivated and on track.",
    author: "Goal Setting"
  }
]

export function DailyInsight() {
  const { t } = useLanguage()
  const [insight, setInsight] = useState(insights[0])
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Pick a random insight based on the day of the year to keep it consistent for the day
    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24)
    const index = dayOfYear % insights.length
    setInsight(insights[index])
  }, [])

  if (!isVisible) return null

  return (
    <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 p-6 text-white shadow-lg transition-all hover:shadow-xl dark:from-indigo-600 dark:to-purple-800 animate-fade-in-up">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
      <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-black/10 blur-3xl"></div>

      <div className="relative z-10 flex items-start gap-4">
        <div className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
          <span className="material-symbols-outlined text-2xl">lightbulb</span>
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white/90">Daily Insight</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="rounded-full p-1 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
              aria-label="Dismiss"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>

          <p className="mt-2 text-lg font-medium leading-relaxed text-white">
            "{insight.text}"
          </p>

          <p className="mt-2 text-sm font-medium text-white/60">
            — {insight.author}
          </p>
        </div>
      </div>
    </div>
  )
}
