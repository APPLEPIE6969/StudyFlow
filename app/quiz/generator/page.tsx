"use client"

import { Sidebar } from "@/components/Sidebar"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/Textarea"
import { Select } from "@/components/ui/Select"
import { saveQuiz } from "@/lib/quizStore"
import { useLanguage } from "@/lib/i18n"
import { LANGUAGES } from "@/lib/constants"

// Options for selects
const difficultyOptions = [
  { value: "Beginner", label: "Beginner" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Advanced", label: "Advanced" },
  { value: "Expert", label: "Expert" },
]

const questionTypeOptions = [
  { value: "Multiple Choice", label: "Multiple Choice" },
  { value: "True / False", label: "True / False" },
  { value: "Short Answer", label: "Short Answer" },
  { value: "Mix of All", label: "Mix of All" },
]

const questionCountOptions = [
  { value: "recommended", label: "Recommended (AI decides)" },
  { value: "5", label: "5 Questions" },
  { value: "10", label: "10 Questions" },
  { value: "15", label: "15 Questions" },
  { value: "20", label: "20 Questions" },
  { value: "25", label: "25 Questions" },
]

const languageOptions = LANGUAGES as unknown as { value: string; label: string; }[]

const aiModeOptions = [
  { value: "fast", label: "⚡ Fast", description: "Quick generation, best for simple topics" },
  { value: "balanced", label: "⚖️ Balanced", description: "Good speed and accuracy balance" },
  { value: "smart", label: "🧠 Smart", description: "Best accuracy, ideal for complex topics" },
]

export default function QuizGenerator() {
  const [topic, setTopic] = useState("")
  const [difficulty, setDifficulty] = useState("Intermediate")
  const [questionType, setQuestionType] = useState("Multiple Choice")
  const [questionCount, setQuestionCount] = useState("recommended")
  const [language, setLanguageState] = useState("English")
  const [aiMode, setAiMode] = useState("balanced")
  const [instantFeedback, setInstantFeedback] = useState(true)
  const [customContent, setCustomContent] = useState("")
  const [showCustomContent, setShowCustomContent] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const router = useRouter()
  const { t, language: appLanguage } = useLanguage()

  // Sync with app language
  useEffect(() => {
    setLanguageState(appLanguage)
  }, [appLanguage])

  useEffect(() => {
    // Load persisted language
    const savedProfile = localStorage.getItem("studyflow_user_profile");
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        if (profile.language) {
          setLanguageState(profile.language);
        }
      } catch (e) {
        console.error("Failed to parse user profile", e);
      }
    }
  }, []);

  const handleGenerate = async () => {
    if (!topic && !customContent) return;

    setIsGenerating(true);
    try {
      const response = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic || "Custom Content Quiz",
          difficulty,
          type: questionType,
          amount: questionCount,
          language,
          mode: aiMode,
          customContent: showCustomContent ? customContent : undefined,
          instantFeedback,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate quiz");
      }

      const data = await response.json();

      // Save quiz to storage
      const savedQuiz = saveQuiz({
        title: topic || "Custom Content Quiz",
        topic: topic || "Custom Content",
        difficulty,
        questionType,
        language,
        aiMode: data.settings.aiMode,
        instantFeedback,
        questions: data.quiz,
        signature: data.signature,
        totalQuestions: data.quiz.length,
      });

      router.push(`/quiz/${savedQuiz.id}?feedback=${instantFeedback}`);
    } catch (error) {
      console.error("Generation error:", error);
      alert("Failed to generate quiz. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col items-center justify-start py-8 px-4 sm:px-8 overflow-y-auto bg-background-light dark:bg-background-dark">
        <div className="w-full max-w-[800px] flex flex-col gap-6 animate-fade-in-up">
          {/* Header */}
          <div className="text-center space-y-2 mb-4">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">{t("quiz.title")}</h1>
            <p className="text-slate-500 dark:text-[#a69db9] text-base md:text-lg">{t("quiz.subtitle")}</p>
          </div>

          {/* Main Card */}
          <div className="bg-white dark:bg-[#2e2839] border border-slate-200 dark:border-[#3a3347] rounded-2xl shadow-xl dark:shadow-none p-6 md:p-8 flex flex-col gap-6">

            {/* Topic Input */}
            <div className="flex flex-col gap-2">
              <label className="text-slate-900 dark:text-white text-sm font-bold ml-1">{t("quiz.topic_label")}</label>
              <div className="relative group">
                <Textarea
                  placeholder={t("quiz.topic_placeholder")}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="h-28"
                />
                <div className="absolute bottom-3 right-3 text-xs text-slate-400 dark:text-[#a69db9]/60 font-medium bg-slate-50 dark:bg-[#1f1c27] px-2 rounded">{topic.length}/500</div>
              </div>
            </div>

            {/* Custom Knowledge Toggle */}
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setShowCustomContent(!showCustomContent)}
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${showCustomContent ? 'text-primary' : 'text-slate-500 dark:text-[#a69db9] hover:text-slate-700 dark:hover:text-white'
                  }`}
              >
                <span className="material-symbols-outlined text-lg">
                  {showCustomContent ? 'expand_less' : 'add_circle'}
                </span>
                {t("quiz.custom_content")}
              </button>

              {showCustomContent && (
                <div className="animate-fade-in">
                  <Textarea
                    placeholder="Paste your notes, textbook excerpts, or any content you want the AI to use for generating questions..."
                    value={customContent}
                    onChange={(e) => setCustomContent(e.target.value)}
                    className="h-40"
                  />
                  <p className="text-xs text-slate-400 dark:text-[#a69db9]/60 mt-2">
                    When provided, the AI will only use this content to generate questions.
                  </p>
                </div>
              )}
            </div>

            {/* Configuration Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-slate-900 dark:text-white text-sm font-bold ml-1">{t("quiz.difficulty")}</label>
                <Select options={difficultyOptions} value={difficulty} onChange={setDifficulty} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-slate-900 dark:text-white text-sm font-bold ml-1">{t("quiz.question_type")}</label>
                <Select options={questionTypeOptions} value={questionType} onChange={setQuestionType} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-slate-900 dark:text-white text-sm font-bold ml-1">{t("quiz.question_count")}</label>
                <Select options={questionCountOptions} value={questionCount} onChange={setQuestionCount} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-slate-900 dark:text-white text-sm font-bold ml-1">{t("quiz.language")}</label>
                <Select options={languageOptions} value={language} onChange={setLanguageState} />
              </div>
            </div>

            {/* AI Mode Selection */}
            <div className="border-t border-slate-200 dark:border-[#3a3347] pt-6">
              <label className="text-slate-900 dark:text-white text-sm font-bold ml-1 block mb-3">{t("quiz.ai_mode")}</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {aiModeOptions.map((mode) => (
                  <button
                    key={mode.value}
                    type="button"
                    onClick={() => setAiMode(mode.value)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${aiMode === mode.value
                      ? 'border-primary bg-primary/10 dark:bg-primary/20'
                      : 'border-slate-200 dark:border-[#3a3347] hover:border-primary/50'
                      }`}
                  >
                    <p className={`font-semibold ${aiMode === mode.value ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>
                      {mode.label}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-[#a69db9] mt-1">{mode.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Instant Feedback Toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#1a1622] rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <span className="material-symbols-outlined">feedback</span>
                </div>
                <div>
                  <p className="text-slate-900 dark:text-white font-medium">{t("quiz.instant_feedback")}</p>
                  <p className="text-slate-500 dark:text-[#a69db9] text-sm">See correct answers after each question</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={instantFeedback}
                  onChange={(e) => setInstantFeedback(e.target.checked)}
                />
                <div className="w-11 h-6 bg-slate-200 dark:bg-[#3a3347] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {/* Generate Button */}
            <div className="pt-4">
              <button
                onClick={handleGenerate}
                disabled={isGenerating || (!topic && !customContent)}
                className="group w-full bg-primary hover:bg-primary/90 text-white font-bold text-lg py-4 px-6 rounded-xl shadow-lg shadow-primary/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3 relative overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                {isGenerating ? (
                  <span className="material-symbols-outlined relative z-10 animate-spin">refresh</span>
                ) : (
                  <span className="material-symbols-outlined relative z-10">auto_awesome</span>
                )}
                <span className="relative z-10">{isGenerating ? t("quiz.generating") : t("quiz.generate_button")}</span>
              </button>
              <p className="text-center text-xs text-slate-400 dark:text-[#a69db9]/60 mt-3">
                {aiMode === "smart" ? "~20 seconds" : aiMode === "balanced" ? "~10 seconds" : "~5 seconds"}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
