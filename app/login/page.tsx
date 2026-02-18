"use client"

import Link from "next/link"
import { AuthForm } from "@/components/AuthForm"
import { Suspense } from "react"

export default function Login() {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen w-full overflow-hidden">
      {/* Left Panel: Visual & Testimonial */}
      <div className="relative lg:w-1/2 w-full bg-background-dark flex flex-col justify-between p-8 lg:p-16 overflow-hidden">
        {/* Gradient Mesh Background */}
        <div className="absolute inset-0 w-full h-full bg-[#161022]">
          <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-primary/30 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600/20 rounded-full blur-[100px]"></div>
          <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[80px]"></div>
          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
        </div>

        {/* Logo Area */}
        <div className="relative z-10 flex items-center gap-2 mb-10">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-white">
            <span className="material-symbols-outlined text-2xl">auto_awesome</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">StudyFlow</span>
        </div>

        {/* Content Area */}
        <div className="relative z-10 flex flex-col gap-8 max-w-lg">
          <div>
            <h1 className="text-4xl lg:text-5xl font-black leading-[1.1] tracking-tight text-white mb-6">
              Master any subject with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Intelligence</span>
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed">
              Join thousands of students who are accelerating their learning curve with our AI-powered personalized quizzes and study plans.
            </p>
          </div>

          {/* Testimonial Card */}
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="flex gap-1 mb-4 text-yellow-400">
              <span className="material-symbols-outlined text-[20px] fill">star</span>
              <span className="material-symbols-outlined text-[20px] fill">star</span>
              <span className="material-symbols-outlined text-[20px] fill">star</span>
              <span className="material-symbols-outlined text-[20px] fill">star</span>
              <span className="material-symbols-outlined text-[20px] fill">star</span>
            </div>
            <p className="text-gray-200 text-base leading-relaxed mb-6 font-medium">
              &quot;This platform helped me ace my calculus finals in half the time. The AI quizzes adapt to my weak spots perfectly. It&apos;s like having a private tutor 24/7.&quot;
            </p>
            <div className="flex items-center gap-4">
              <div
                className="h-12 w-12 rounded-full bg-gray-700 bg-center bg-cover border-2 border-primary/50"
                style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCnb_ZIRjX_IAmfkASq7IPPcE3vAHqIOxL1ZeCtYay2-lyGo2OJF0UVC19ArQ7FYlwtDcoc3EAhG4--XnBSStuCEC57zoPOaJ1VrD8ag95HZ-SLsF1sIeetu9yMLM-NNj9DmoAN2LBUpARadT-1_G7chvva4bqV0_3kyMhrna1gV13L76dY6nKWHKqZHVfZXTmR9wmNQmlohdzW8KHmGDL4zzdb_3j4F6NHgHg_bKq-bDk79WVHb733nbHH5gaUGmurUEI0UyBd57r9")' }}
              ></div>
              <div>
                <p className="text-white font-bold text-sm">Sarah Jenkins</p>
                <p className="text-gray-400 text-xs">Computer Science Student, MIT</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer links for left side */}
        <div className="relative z-10 mt-10 lg:mt-0 hidden lg:flex gap-6 text-sm text-gray-400">
          <Link className="hover:text-white transition-colors" href="/privacy">Privacy Policy</Link>
          <Link className="hover:text-white transition-colors" href="/terms">Terms of Service</Link>
        </div>
      </div>

      {/* Right Panel: Authentication Form */}
      <div className="lg:w-1/2 w-full bg-background-light dark:bg-[#131118] flex items-center justify-center p-6 sm:p-12 relative">
        <Suspense fallback={<div>Loading...</div>}>
            <AuthForm initialView="login" />
        </Suspense>

        {/* Mobile footer links */}
        <div className="absolute bottom-6 left-0 w-full flex justify-center gap-6 text-xs text-gray-500 lg:hidden">
          <Link className="hover:text-slate-900 dark:hover:text-white" href="/privacy">Privacy</Link>
          <Link className="hover:text-slate-900 dark:hover:text-white" href="/terms">Terms</Link>
        </div>
      </div>
    </div>
  )
}
