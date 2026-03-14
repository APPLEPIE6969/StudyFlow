"use client"

import { useState, useRef, useEffect } from "react"

interface DropdownOption {
    value: string
    label: string
}

interface AnimatedDropdownProps {
    options: DropdownOption[]
    value: string
    onChange: (value: string) => void
    className?: string
}

export function AnimatedDropdown({
    options,
    value,
    onChange,
    className = ""
}: AnimatedDropdownProps) {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const selectedOption = options.find(opt => opt.value === value)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    return (
        <div ref={dropdownRef} className={`relative ${className}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600 transition-all hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 dark:bg-[#1a1622] dark:text-[#a69db9] dark:hover:bg-[#2e2839]"
                aria-label={`Toggle dropdown, current selection: ${selectedOption?.label || ''}`}
            >
                {selectedOption?.label}
                <span className={`material-symbols-outlined text-sm transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                    expand_more
                </span>
            </button>

            {/* Dropdown Menu */}
            <div
                className={`absolute right-0 top-full mt-2 min-w-[140px] origin-top-right rounded-xl bg-white p-1 shadow-lg ring-1 ring-slate-900/5 backdrop-blur-md transition-all duration-200 dark:bg-[#2e2839] dark:ring-white/10 z-50 ${isOpen
                        ? 'opacity-100 scale-100 translate-y-0'
                        : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                    }`}
            >
                {options.map((option, index) => (
                    <button
                        key={option.value}
                        onClick={() => {
                            onChange(option.value)
                            setIsOpen(false)
                        }}
                        className={`w-full rounded-lg px-3 py-2 text-left text-xs font-medium transition-all hover:bg-slate-100 dark:hover:bg-[#3a3347] ${value === option.value
                                ? 'text-primary bg-primary/5'
                                : 'text-slate-600 dark:text-[#a69db9]'
                            }`}
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
        </div>
    )
}
