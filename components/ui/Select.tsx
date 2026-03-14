"use client"

import { useState, useRef, useEffect } from "react"

interface SelectOption {
    value: string
    label: string
}

interface SelectProps {
    options: SelectOption[]
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
}

export function Select({
    options,
    value,
    onChange,
    placeholder = "Select an option",
    className = ""
}: SelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const selectRef = useRef<HTMLDivElement>(null)

    const selectedOption = options.find(opt => opt.value === value)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    // Close on escape key
    useEffect(() => {
        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setIsOpen(false)
            }
        }
        document.addEventListener("keydown", handleEscape)
        return () => document.removeEventListener("keydown", handleEscape)
    }, [])

    return (
        <div ref={selectRef} className={`relative ${className}`}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between gap-2 bg-slate-50 dark:bg-[#131118] border border-slate-200 dark:border-[#2e2839] rounded-xl px-4 py-3 text-left text-slate-900 dark:text-white transition-all duration-200 hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary ${isOpen ? 'border-primary ring-2 ring-primary/50' : ''
                    }`}
                aria-label={`Select option, current value: ${selectedOption?.label || placeholder}`}
            >
                <span className={selectedOption ? '' : 'text-slate-400 dark:text-[#a69db9]'}>
                    {selectedOption?.label || placeholder}
                </span>
                <span
                    className={`material-symbols-outlined text-slate-500 transition-transform duration-300 ease-out ${isOpen ? 'rotate-180' : ''
                        }`}
                >
                    expand_more
                </span>
            </button>

            {/* Dropdown Menu */}
            <div
                className={`absolute left-0 right-0 top-full mt-2 z-50 origin-top transition-all duration-200 ease-out ${isOpen
                        ? 'opacity-100 scale-100 translate-y-0'
                        : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                    }`}
            >
                <div className="bg-white dark:bg-[#1f1c27] border border-slate-200 dark:border-[#2e2839] rounded-xl shadow-xl dark:shadow-2xl overflow-hidden backdrop-blur-xl">
                    <div className="max-h-64 overflow-y-auto py-1">
                        {options.map((option, index) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                    onChange(option.value)
                                    setIsOpen(false)
                                }}
                                className={`w-full px-4 py-3 text-left transition-all duration-150 flex items-center justify-between group ${value === option.value
                                        ? 'bg-primary/10 text-primary font-medium'
                                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#2e2839]'
                                    }`}
                                style={{
                                    animationDelay: isOpen ? `${index * 30}ms` : '0ms',
                                    animation: isOpen ? 'slideIn 0.2s ease-out forwards' : 'none'
                                }}
                                aria-label={`Select ${option.label}`}
                            >
                                <span>{option.label}</span>
                                {value === option.value && (
                                    <span className="material-symbols-outlined text-primary text-lg">check</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Keyframe for staggered item animation */}
            <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-8px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
        </div>
    )
}
