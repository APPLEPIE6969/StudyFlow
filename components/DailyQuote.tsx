"use client"
import { useState, useEffect } from "react"

const QUOTES = [
  { text: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
  { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
  { text: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi" },
  { text: "The mind is not a vessel to be filled, but a fire to be kindled.", author: "Plutarch" },
  { text: "There is no end to education. It is not that you read a book, pass an examination, and finish with education. The whole of life, from the moment you are born to the moment you die, is a process of learning.", author: "Jiddu Krishnamurti" }
]

export function DailyQuote() {
  const [quote, setQuote] = useState(QUOTES[0])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * QUOTES.length)
    setQuote(QUOTES[randomIndex])
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5 dark:bg-surface-dark-lighter dark:ring-white/10 transition-all hover:shadow-lg mt-6">
      <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">Daily Inspiration</h3>
      <p className="text-slate-600 dark:text-slate-400 italic">"{quote.text}"</p>
      <p className="mt-2 text-sm text-slate-500 dark:text-text-secondary font-medium">- {quote.author}</p>
    </div>
  )
}
