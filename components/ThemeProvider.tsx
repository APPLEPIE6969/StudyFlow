"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light"

interface ThemeContextType {
    theme: Theme
    toggleTheme: () => void
    setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>("dark")
    const [mounted, setMounted] = useState(false)

    // Initialize theme from localStorage or system preference
    useEffect(() => {
        setMounted(true)
        const savedTheme = localStorage.getItem("theme") as Theme | null
        if (savedTheme) {
            setThemeState(savedTheme)
        } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            setThemeState("dark")
        } else {
            setThemeState("light")
        }

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
        const handleChange = (e: MediaQueryListEvent) => {
            if (!localStorage.getItem("theme")) {
                setThemeState(e.matches ? "dark" : "light")
            }
        }
        mediaQuery.addEventListener("change", handleChange)
        return () => mediaQuery.removeEventListener("change", handleChange)
    }, [])

    // Apply theme class to document
    useEffect(() => {
        if (!mounted) return

        const root = window.document.documentElement
        root.classList.remove("light", "dark")
        root.classList.add(theme)
    }, [theme, mounted])

    const toggleTheme = () => {
        const next = theme === "dark" ? "light" : "dark"
        setThemeState(next)
        localStorage.setItem("theme", next)
    }

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme)
        localStorage.setItem("theme", newTheme)
    }

    // Prevent flash of incorrect theme
    // We still render the provider to avoid "context missing" errors during SSR
    // The "mounted" check is used for the effect, not for rendering the provider itself

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider")
    }
    return context
}
