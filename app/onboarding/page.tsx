"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { saveUserProfile, isOnboardingComplete } from "@/lib/userStore"

export default function Onboarding() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [name, setName] = useState("")
    const [agreedToTerms, setAgreedToTerms] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState("")

    // Pre-fill name from session
    useEffect(() => {
        const setSessionName = () => {
            if (session?.user?.name) {
                setName(session.user.name)
            }
        }
        setSessionName()
    }, [session])

    // Redirect if not authenticated
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login")
        }
    }, [status, router])

    // Check if already onboarded
    useEffect(() => {
        if (session?.user?.email && isOnboardingComplete(session.user.email)) {
            router.push("/dashboard")
        }
    }, [session, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!name.trim()) {
            setError("Please enter your name")
            return
        }

        if (!agreedToTerms) {
            setError("Please agree to the Privacy Policy and Terms of Service")
            return
        }

        if (!session?.user?.email) {
            setError("Session error. Please try logging in again.")
            return
        }

        setIsSubmitting(true)

        try {
            // Save user profile to localStorage
            saveUserProfile({
                name: name.trim(),
                email: session.user.email,
                image: session.user.image || undefined,
                agreedToTerms: true,
                onboardingComplete: true,
            })

            // Redirect to dashboard
            router.push("/dashboard")
        } catch {
            setError("Something went wrong. Please try again.")
            setIsSubmitting(false)
        }
    }

    if (status === "loading") {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background-dark">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <p className="text-white/60">Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen flex-col lg:flex-row overflow-hidden">
            {/* Left Panel: Visual */}
            <div className="relative lg:w-1/2 w-full bg-background-dark flex flex-col justify-center p-8 lg:p-16 overflow-hidden">
                {/* Gradient Mesh Background */}
                <div className="absolute inset-0 w-full h-full bg-[#161022]">
                    <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-primary/30 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600/20 rounded-full blur-[100px]"></div>
                    <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[80px]"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col gap-8 max-w-lg mx-auto text-center lg:text-left">
                    {/* Logo */}
                    <div className="flex items-center justify-center lg:justify-start gap-2">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-white">
                            <span className="material-symbols-outlined text-2xl">auto_awesome</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">StudyFlow</span>
                    </div>

                    <div>
                        <h1 className="text-3xl lg:text-4xl font-black leading-[1.1] tracking-tight text-white mb-4">
                            Almost there! 🎉
                        </h1>
                        <p className="text-lg text-gray-300 leading-relaxed">
                            Just a few more details to personalize your learning experience and get started with AI-powered studying.
                        </p>
                    </div>

                    {/* Features */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3 text-left">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-primary">
                                <span className="material-symbols-outlined">quiz</span>
                            </div>
                            <div>
                                <p className="text-white font-medium">AI-Generated Quizzes</p>
                                <p className="text-sm text-gray-400">Turn any content into personalized tests</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-left">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                                <span className="material-symbols-outlined">psychology</span>
                            </div>
                            <div>
                                <p className="text-white font-medium">Smart Explanations</p>
                                <p className="text-sm text-gray-400">Get instant help on complex topics</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-left">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                                <span className="material-symbols-outlined">trending_up</span>
                            </div>
                            <div>
                                <p className="text-white font-medium">Track Your Progress</p>
                                <p className="text-sm text-gray-400">Monitor your learning journey</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel: Form */}
            <div className="lg:w-1/2 w-full bg-background-light dark:bg-[#131118] flex items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-[420px] flex flex-col">
                    {/* Header */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
                            Complete Your Profile
                        </h2>
                        <p className="text-gray-500 dark:text-[#a69db9]">
                            Welcome, {session?.user?.email || "new learner"}! Set up your account to continue.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        {/* Avatar Preview */}
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 overflow-hidden rounded-full ring-4 ring-primary/20">
                                {session?.user?.image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={session.user.image}
                                        alt={name || "User"}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="h-full w-full bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center text-white text-2xl font-bold">
                                        {name.charAt(0).toUpperCase() || "?"}
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">Profile Picture</p>
                                <p className="text-xs text-slate-500 dark:text-[#a69db9]">From your {session?.user?.email?.includes("github") ? "GitHub" : "Google"} account</p>
                            </div>
                        </div>

                        {/* Name Input */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-gray-300" htmlFor="name">
                                Display Name
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-gray-400 group-focus-within:text-primary transition-colors text-[20px]">
                                        person
                                    </span>
                                </div>
                                <input
                                    className="w-full h-12 pl-11 pr-4 bg-gray-50 dark:bg-[#1f1c27] border border-gray-200 dark:border-[#433b54] rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-gray-400"
                                    id="name"
                                    placeholder="Enter your name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Terms Checkbox */}
                        <div className="flex items-start gap-3">
                            <div className="pt-0.5">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    checked={agreedToTerms}
                                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                                    className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary focus:ring-offset-0 dark:border-[#433b54] dark:bg-[#1f1c27]"
                                />
                            </div>
                            <label htmlFor="terms" className="text-sm text-slate-600 dark:text-[#a69db9] leading-relaxed">
                                I agree to the{" "}
                                <Link href="/privacy" target="_blank" className="font-semibold text-primary hover:text-purple-400 transition-colors">
                                    Privacy Policy
                                </Link>{" "}
                                and{" "}
                                <Link href="/terms" target="_blank" className="font-semibold text-primary hover:text-purple-400 transition-colors">
                                    Terms of Service
                                </Link>
                            </label>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-500">
                                <span className="material-symbols-outlined text-lg">error</span>
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-primary hover:bg-purple-600 disabled:bg-primary/50 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-primary/25 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 group"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                    Setting up...
                                </>
                            ) : (
                                <>
                                    Get Started
                                    <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">
                                        arrow_forward
                                    </span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
