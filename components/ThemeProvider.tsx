"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light"

interface ThemeContextType {
    theme: Theme
    toggleTheme: () => void
    setTheme: (theme: Theme) => void
    mounted: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>("dark")
    const [mounted, setMounted] = useState(false)

    // Initialize theme from localStorage or system preference
    useEffect(() => {
        const savedTheme = localStorage.getItem("theme") as Theme | null
        if (savedTheme) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setThemeState(savedTheme)
        } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setThemeState("dark")
        } else {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setThemeState("light")
        }
        setMounted(true)

    }, [])

    // Apply theme class to document
    useEffect(() => {
        if (!mounted) return

        const root = window.document.documentElement
        root.classList.remove("light", "dark")
        root.classList.add(theme)
        localStorage.setItem("theme", theme)
    }, [theme, mounted])

    const toggleTheme = () => {
        setThemeState((prev) => (prev === "dark" ? "light" : "dark"))
    }

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme)
    }

    // Prevent flash of incorrect theme
    // We still render the provider to avoid "context missing" errors during SSR
    // The "mounted" check is used for the effect, not for rendering the provider itself

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, mounted }}>
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
