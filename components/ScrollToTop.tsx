"use client"

import { useState, useEffect } from "react"

export function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setIsVisible(true)
            } else {
                setIsVisible(false)
            }
        }

        window.addEventListener("scroll", toggleVisibility)
        return () => window.removeEventListener("scroll", toggleVisibility)
    }, [])

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        })
    }

    if (!isVisible) {
        return null
    }

    return (
        <button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 transition-all hover:-translate-y-1 hover:scale-105 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/40 active:translate-y-0 active:scale-95 animate-fade-in-up"
            aria-label="Scroll to top"
        >
            <span className="material-symbols-outlined text-2xl">arrow_upward</span>
        </button>
    )
}
