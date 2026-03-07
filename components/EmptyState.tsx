"use client"

import Link from "next/link"

interface EmptyStateProps {
    icon: string
    title: string
    description: string
    actionLabel?: string
    actionHref?: string
    onAction?: () => void
    className?: string
}

export function EmptyState({
    icon,
    title,
    description,
    actionLabel,
    actionHref,
    onAction,
    className = ""
}: EmptyStateProps) {
    return (
        <div className={`flex flex-col items-center justify-center py-12 px-6 text-center animate-fade-in ${className}`}>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4 animate-scale-in transition-transform hover:scale-110">
                <span className="material-symbols-outlined text-3xl">{icon}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                {title}
            </h3>
            <p className="text-sm text-slate-500 dark:text-[#a69db9] max-w-sm mb-2">
                {description}
            </p>
            <p className="mt-2 text-xs font-semibold text-primary uppercase tracking-widest mb-6">
                Ready when you are!
            </p>
            {actionLabel && (
                actionHref ? (
                    <Link
                        href={actionHref}
                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-primary/90 hover:scale-105 hover:shadow-lg hover:shadow-primary/25 active:scale-95"
                    >
                        <span className="material-symbols-outlined text-lg">add</span>
                        {actionLabel}
                    </Link>
                ) : onAction ? (
                    <button
                        onClick={onAction}
                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-primary/90 hover:scale-105 hover:shadow-lg hover:shadow-primary/25 active:scale-95"
                    >
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                        {actionLabel}
                    </button>
                ) : null
            )}
        </div>
    )
}
