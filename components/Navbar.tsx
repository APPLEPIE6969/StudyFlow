"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { useTheme } from "./ThemeProvider"

export function Navbar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { theme, toggleTheme, mounted } = useTheme()

  // Hide Navbar on dashboard and quiz routes if they have their own layout/header
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/quiz") || pathname.startsWith("/study") || pathname.startsWith("/profile")) {
    return null
  }

  return (
    <header className="relative z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-[#2e2839] px-6 lg:px-10 py-4 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
      <div className="flex items-center gap-3 text-slate-900 dark:text-white">
        <div className="size-8 flex items-center justify-center text-primary">
          <span className="material-symbols-outlined text-3xl">auto_awesome</span>
        </div>
        <Link href="/" className="text-xl font-bold leading-tight tracking-tight">StudyFlow</Link>
      </div>
      <nav className="hidden md:flex items-center gap-8">
        <Link className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-white text-sm font-medium transition-colors" href="#">Features</Link>
        <Link className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-white text-sm font-medium transition-colors" href="#">Pricing</Link>
        <Link className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-white text-sm font-medium transition-colors" href="#">About</Link>
      </nav>
      <div className="flex gap-3 items-center">
        {mounted && (
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-[#2e2839] text-slate-600 dark:text-slate-300 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">
              {theme === "dark" ? "light_mode" : "dark_mode"}
            </span>
          </button>
        )}
        {session ? (
            <Link href="/dashboard" className="flex cursor-pointer items-center justify-center rounded-lg h-10 px-5 bg-primary hover:bg-primary/90 text-white text-sm font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105">
                Dashboard
            </Link>
        ) : (
            <>
                <Link href="/login" className="hidden sm:flex cursor-pointer items-center justify-center rounded-lg h-10 px-4 hover:bg-slate-200 dark:hover:bg-[#2e2839] text-slate-900 dark:text-white text-sm font-semibold transition-colors">
                    Log In
                </Link>
                <Link href="/signup" className="flex cursor-pointer items-center justify-center rounded-lg h-10 px-5 bg-primary hover:bg-primary/90 text-white text-sm font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105">
                    Sign Up
                </Link>
            </>
        )}
      </div>
    </header>
  )
}
