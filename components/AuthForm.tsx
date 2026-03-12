"use client"

import Link from "next/link"
import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import { useState } from "react"

export function AuthForm({ initialView = "login" }: { initialView?: "login" | "signup" }) {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/onboarding"
  const [isLogin, setIsLogin] = useState(initialView === "login")

  return (
    <div className="w-full max-w-[420px] flex flex-col">
      {/* Tab Switcher */}
      <div className="flex w-full bg-gray-200 dark:bg-[#1f1c27] p-1 rounded-xl mb-8">
        <button
          onClick={() => setIsLogin(true)}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${isLogin ? "bg-white dark:bg-primary text-slate-900 dark:text-white shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"}`}
        >
          Sign In
        </button>
        <button
          onClick={() => setIsLogin(false)}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${!isLogin ? "bg-white dark:bg-primary text-slate-900 dark:text-white shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"}`}
        >
          Sign Up
        </button>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">{isLogin ? "Welcome back" : "Create an account"}</h2>
        <p className="text-gray-500 dark:text-[#a69db9]">{isLogin ? "Enter your details to access your dashboard." : "Join thousands of learners today."}</p>
      </div>

      {/* Form */}
      <div className="flex flex-col gap-5">
        {/* Social Login Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => signIn("google", { callbackUrl })}
            className="flex items-center justify-center gap-3 bg-white dark:bg-[#1f1c27] border border-gray-200 dark:border-[#433b54] hover:bg-gray-50 dark:hover:bg-[#2a2635] text-slate-700 dark:text-white py-3 px-4 rounded-xl transition-all font-medium text-sm group hover:shadow-md"
            type="button"
          >
            <Image alt="Google Logo" width={20} height={20} src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4UqHnsxUlLRTM3uM8G8z1bcj_rMUSU8tyQYPgQEBd0AI9qfWz2_YZv4aKuojT2k1mj2NOX0tznKM_mTH6Zc3zXdUqAspbhAGunfBWQbagOspg7ebQh_U_LmhEgJcin-xwIxWCc0lGQ8SYx_FWbzXJNFfsrDPZL3GW6fNSu9vj2NE9Ni1T4cQM6Qre581-YOBPhpDuaBwmFmatgJ5v3v1eEoj-bM0ead0EloKI4F334LSSqOe6G3rIHTtN5rzVNs63_MDrd00TrLnT" />
            <span>Google</span>
          </button>
          <button
            onClick={() => signIn("github", { callbackUrl })}
            className="flex items-center justify-center gap-3 bg-white dark:bg-[#1f1c27] border border-gray-200 dark:border-[#433b54] hover:bg-gray-50 dark:hover:bg-[#2a2635] text-slate-700 dark:text-white py-3 px-4 rounded-xl transition-all font-medium text-sm hover:shadow-md"
            type="button"
          >
            <Image alt="GitHub Logo" className="dark:invert" width={20} height={20} src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9schCEOuNUhue2lHXVkeYKic9D53MXAIjHWwahQCG01tEz82xgtYH2UEzFkDqRtWQdq2JiRLx5L3vp7NxiVoFy1Nc07YhprEUIb6SpxMXnvE9OkFH1q8jytj3-EuaaZzf3A_JBtJlB6WUTLl1nVlmVQtXobUgwgX83mKPuOOWgv8IjALD_XK5Eb3Y7U2jyUID6C-UxO8HoFhJYFrO-iVhu3xCtxKaI_b6vIUCtQzWMhZuxxpB7tPYNfgOB2N6eowUK9UfpcCyvfY_" />
            <span>GitHub</span>
          </button>
        </div>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-gray-200 dark:border-[#433b54]"></div>
          <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-medium uppercase tracking-wider">Or continue with</span>
          <div className="flex-grow border-t border-gray-200 dark:border-[#433b54]"></div>
        </div>

        {/* Inputs (Mock for Email/Password) */}
        <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); }}>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-gray-300" htmlFor="email">Email address</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-gray-400 group-focus-within:text-primary transition-colors text-[20px]">mail</span>
              </div>
              <input className="w-full h-12 pl-11 pr-4 bg-gray-50 dark:bg-[#1f1c27] border border-gray-200 dark:border-[#433b54] rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-gray-400" id="email" placeholder="name@example.com" type="email" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-slate-700 dark:text-gray-300" htmlFor="password">Password</label>
              <Link className="text-sm font-semibold text-primary hover:text-purple-400 transition-colors" href="#">Forgot password?</Link>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-gray-400 group-focus-within:text-primary transition-colors text-[20px]">lock</span>
              </div>
              <input className="w-full h-12 pl-11 pr-4 bg-gray-50 dark:bg-[#1f1c27] border border-gray-200 dark:border-[#433b54] rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-gray-400" id="password" placeholder="••••••••" type="password" />
              <button aria-label="Toggle password visibility" className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-white transition-colors" type="button">
                <span className="material-symbols-outlined text-[20px]">visibility_off</span>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button className="w-full bg-primary hover:bg-purple-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-primary/25 transition-all transform active:scale-[0.98] mt-2 flex items-center justify-center gap-2 group" type="submit">
            {isLogin ? "Sign In" : "Sign Up"}
            <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button onClick={() => setIsLogin(!isLogin)} className="font-bold text-primary hover:text-purple-400 transition-colors ml-1">
            {isLogin ? "Sign up for free" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  )
}
