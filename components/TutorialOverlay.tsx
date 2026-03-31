"use client"

import { useState } from "react"
import { markTutorialComplete } from "@/lib/userStore"

interface TutorialStep {
    target: string
    title: string
    description: string
    position: "top" | "bottom" | "left" | "right"
}

const tutorialSteps: TutorialStep[] = [
    {
        target: "welcome",
        title: "Welcome to StudyFlow! 🎉",
        description: "Let's take a quick tour to help you get started with your learning journey.",
        position: "bottom"
    },
    {
        target: "quick-actions",
        title: "Quick Actions",
        description: "Generate quizzes from your notes, get AI explanations, create study materials, and review your learning history.",
        position: "top"
    },
    {
        target: "courses",
        title: "Your Courses",
        description: "This is where you'll see your enrolled courses and track your progress. Start by creating your first course!",
        position: "top"
    },
    {
        target: "activity",
        title: "Learning Activity",
        description: "Track your study sessions and see how you're progressing week by week.",
        position: "top"
    },
    {
        target: "complete",
        title: "You're All Set! 🚀",
        description: "Start exploring and create your first study session. We're here to help you succeed!",
        position: "bottom"
    }
]

interface TutorialOverlayProps {
    userEmail: string
    onComplete: () => void
}

export function TutorialOverlay({ userEmail, onComplete }: TutorialOverlayProps) {
    const [currentStep, setCurrentStep] = useState(0)
    const [isVisible, setIsVisible] = useState(true)

    const step = tutorialSteps[currentStep]
    const isLastStep = currentStep === tutorialSteps.length - 1
    const isFirstStep = currentStep === 0

    const handleNext = () => {
        if (isLastStep) {
            handleComplete()
        } else {
            setCurrentStep(prev => prev + 1)
        }
    }

    const handleSkip = () => {
        handleComplete()
    }

    const handleComplete = () => {
        setIsVisible(false)
        markTutorialComplete(userEmail)
        setTimeout(onComplete, 300)
    }

    if (!isVisible) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
                onClick={handleSkip}
            />

            {/* Tutorial Card */}
            <div className="relative z-10 mx-4 max-w-md animate-scale-in">
                <div className="rounded-3xl bg-white p-8 shadow-2xl dark:bg-[#2e2839]">
                    {/* Progress dots */}
                    <div className="mb-6 flex justify-center gap-2">
                        {tutorialSteps.map((_, index) => (
                            <div
                                key={index}
                                className={`h-2 rounded-full transition-all duration-300 ${index === currentStep
                                        ? 'w-8 bg-primary'
                                        : index < currentStep
                                            ? 'w-2 bg-primary/50'
                                            : 'w-2 bg-slate-200 dark:bg-[#3a3347]'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Icon */}
                    <div className="mb-4 flex justify-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 animate-pulse-glow">
                            <span className="material-symbols-outlined text-3xl text-primary">
                                {isLastStep ? 'celebration' : isFirstStep ? 'waving_hand' : 'school'}
                            </span>
                        </div>
                    </div>

                    {/* Content */}
                    <h2 className="mb-3 text-center text-xl font-bold text-slate-900 dark:text-white">
                        {step.title}
                    </h2>
                    <p className="mb-8 text-center text-sm text-slate-500 dark:text-[#a69db9] leading-relaxed">
                        {step.description}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-3">
                        {!isFirstStep && !isLastStep && (
                            <button
                                onClick={handleSkip}
                                className="flex-1 rounded-xl px-4 py-3 text-sm font-medium text-slate-500 transition-all hover:bg-slate-100 dark:text-[#a69db9] dark:hover:bg-[#3a3347]"
                            >
                                Skip Tour
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            className={`flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] ${isFirstStep || isLastStep ? 'w-full' : ''
                                }`}
                        >
                            {isLastStep ? "Let's Go!" : isFirstStep ? "Start Tour" : "Next"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
