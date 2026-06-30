"use client"

import Link from "next/link"
import { useState, useEffect, use } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { getQuizById, updateQuiz, SavedQuiz } from "@/lib/quizStore"
import { recordActivity, addXP, updateUserStats, getUserProfile } from "@/lib/userStore"


export default function QuizInterface({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params)
  const id = unwrappedParams.id
  const searchParams = useSearchParams()
  const instantFeedbackEnabled = searchParams.get("feedback") === "true"

  const [quiz, setQuiz] = useState<SavedQuiz | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [hint, setHint] = useState<string | null>(null)
  const [loadingHint, setLoadingHint] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [score, setScore] = useState(0)

  const router = useRouter()

  useEffect(() => {
    const loadedQuiz = getQuizById(id)
    if (loadedQuiz) {
      setQuiz(loadedQuiz)
    }
    setLoading(false)
  }, [id])

  const quizQuestions = quiz?.questions || []
  const currentQuestion = quizQuestions[currentQuestionIndex]

  const handleHint = async () => {
    if (!currentQuestion || loadingHint) return;
    setLoadingHint(true);
    try {
      const response = await fetch("/api/quiz/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: currentQuestion.question,
          context: currentQuestion.correctAnswer,
        })
      });
      const data = await response.json();
      setHint(data.hint);
    } catch (error) {
      console.error("Hint error", error);
    } finally {
      setLoadingHint(false);
    }
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer || !currentQuestion) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    // Save answer
    setAnswers(prev => ({ ...prev, [currentQuestionIndex]: selectedAnswer }));

    if (instantFeedbackEnabled) {
      setShowFeedback(true);
    } else {
      goToNext();
    }
  };

  const goToNext = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setHint(null);
      setShowFeedback(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    // Update quiz with completion data
    if (quiz) {
      let xpReward = (score * 20) + 10;
      let finalScore = score;

      try {
        const response = await fetch("/api/quiz/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questions: quiz.questions,
            answers: answers,
            signature: quiz.signature,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          xpReward = data.xpReward;
          finalScore = data.score;
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error("Verification failed:", errorData.error || "Unknown error");
          xpReward = 0; // Strict: no XP if verification fails
        }
      } catch (error) {
        console.error("Error verifying score:", error);
      }

      updateQuiz(quiz.id, {
        completedAt: new Date().toISOString(),
        score: finalScore,
      });

      // Record activity for streak
      recordActivity();

      addXP(xpReward);

      // Update total quizzes and accuracy in global stats
      const profile = getUserProfile();
      if (profile) {
        const totalQuizzes = profile.stats.totalQuizzes + 1;
        // Simple running average for accuracy
        const currentAccuracy = profile.stats.accuracyScore || 0;
        const newAccuracy = Math.round((currentAccuracy * profile.stats.totalQuizzes + (finalScore / quizQuestions.length * 100)) / totalQuizzes);

        // Record study time: 0.5 mins per question
        const currentHours = profile.stats.hoursStudied || 0;
        const additionalHours = (quizQuestions.length * 0.5) / 60;

        updateUserStats({
          totalQuizzes: totalQuizzes,
          accuracyScore: newAccuracy,
          hoursStudied: parseFloat((currentHours + additionalHours).toFixed(2))
        });
      }
      router.push(`/quiz/${id}/results?score=${finalScore}&total=${quizQuestions.length}&xp=${xpReward}`);
    }
  };


  const getAnswerStyle = (option: string) => {
    if (!showFeedback) {
      const isSelected = selectedAnswer === option;
      return isSelected
        ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-[0_0_20px_rgba(108,43,238,0.15)]"
        : "border-slate-200 dark:border-white/10 bg-white dark:bg-[#1e1828] hover:border-primary/50";
    }

    const isCorrect = option === currentQuestion?.correctAnswer;
    const isSelected = selectedAnswer === option;

    if (isCorrect) {
      return "border-green-500 bg-green-50 dark:bg-green-900/20";
    }
    if (isSelected && !isCorrect) {
      return "border-red-500 bg-red-50 dark:bg-red-900/20";
    }
    return "border-slate-200 dark:border-white/10 bg-white dark:bg-[#1e1828] opacity-50";
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-background-dark text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p>Loading Quiz...</p>
      </div>
    </div>
  );

  if (!quiz || !currentQuestion) return (
    <div className="flex h-screen flex-col items-center justify-center bg-background-dark text-white gap-4">
      <span className="material-symbols-outlined text-6xl text-primary">quiz</span>
      <p className="text-xl">Quiz not found</p>
      <Link href="/quiz/generator" className="text-primary underline">Create a new quiz</Link>
    </div>
  );

  const progressPercentage = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;

  return (
    <div className="flex h-screen w-full flex-row overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display">
      {/* Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-80 bg-white dark:bg-[#131118] border-r border-slate-200 dark:border-white/5 h-full overflow-y-auto">
        <div className="p-6 flex flex-col h-full justify-between">
          <div className="flex flex-col gap-6">
            {/* Quiz Info */}
            <div>
              <h1 className="text-slate-900 dark:text-white text-lg font-bold leading-normal mb-1">{quiz.title}</h1>
              <p className="text-slate-500 dark:text-[#a69db9] text-sm">{quiz.difficulty} • {quiz.language}</p>
              <div className="flex gap-2 mt-2">
                <span className={`text-xs px-2 py-1 rounded-full ${instantFeedbackEnabled
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'bg-slate-100 dark:bg-slate-700/30 text-slate-600 dark:text-slate-400'
                  }`}>
                  {instantFeedbackEnabled ? 'Instant Feedback ON' : 'Feedback at End'}
                </span>
              </div>
            </div>
            <div className="h-px w-full bg-slate-200 dark:bg-white/10"></div>

            {/* Score */}
            <div className="rounded-xl bg-slate-100 dark:bg-[#2e2839] p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-500 dark:text-[#a69db9] text-xs font-medium uppercase tracking-wider">Current Score</span>
                <span className="material-symbols-outlined text-primary text-[18px]">emoji_events</span>
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {score} / {Object.keys(answers).length}
              </p>
            </div>

            {/* Question Grid */}
            <div className="mt-2">
              <h3 className="text-slate-500 dark:text-[#a69db9] text-xs font-medium uppercase tracking-wider mb-4">Questions</h3>
              <div className="grid grid-cols-5 gap-3">
                {quizQuestions.map((q, idx) => {
                  const isAnswered = answers[idx] !== undefined;
                  const isCorrect = isAnswered && answers[idx] === q.correctAnswer;
                  const isCurrent = idx === currentQuestionIndex;

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        if (!showFeedback && idx <= Object.keys(answers).length) {
                          setCurrentQuestionIndex(idx);
                          setSelectedAnswer(answers[idx] || null);
                          setHint(null);
                          setShowFeedback(false);
                        }
                      }}
                      className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all ${isCurrent
                        ? "bg-primary text-white shadow-lg shadow-primary/40 ring-2 ring-primary ring-offset-2 dark:ring-offset-[#131118]"
                        : isAnswered
                          ? isCorrect
                            ? "bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30"
                            : "bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30"
                          : "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-white/40 hover:bg-slate-200 dark:hover:bg-white/10"
                        }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-col gap-3 mt-6">
            <Link href="/dashboard" className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 dark:bg-white/5 px-4 py-3 text-sm font-medium text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
              <span className="material-symbols-outlined text-[20px]">dashboard</span>
              Back to Dashboard
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto relative">
        {/* Progress Bar */}
        <div className="sticky top-0 z-10 w-full bg-background-light dark:bg-background-dark pt-6 px-6 sm:px-12 lg:px-24">
          <div className="flex justify-between items-end mb-2">
            <p className="text-slate-900 dark:text-white text-sm font-medium">Question {currentQuestionIndex + 1} of {quizQuestions.length}</p>
            <p className="text-primary text-sm font-bold">{Math.round(progressPercentage)}% Complete</p>
          </div>
          <div className="w-full bg-slate-200 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
            <div className="bg-primary h-1.5 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(108,43,238,0.5)]" style={{ width: `${progressPercentage}%` }}></div>
          </div>
        </div>

        {/* Quiz Content */}
        <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-6 sm:px-12 lg:px-24 py-8 sm:py-12">
          {/* Question Header */}
          <div className="flex items-start justify-between gap-6 mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-tight tracking-tight">
              {currentQuestion.question}
            </h1>
            {!showFeedback && (
              <button
                onClick={handleHint}
                disabled={loadingHint}
                className="group flex items-center gap-2 pl-3 pr-4 py-2 rounded-full bg-indigo-50 dark:bg-white/5 border border-indigo-200 dark:border-primary/30 hover:border-primary hover:bg-indigo-100 dark:hover:bg-primary/20 transition-all shrink-0 disabled:opacity-50"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-primary text-primary dark:text-white shadow-sm">
                  {loadingHint ? <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span> : <span className="material-symbols-outlined text-[18px]">lightbulb</span>}
                </div>
                <span className="text-sm font-semibold text-indigo-900 dark:text-indigo-200 group-hover:text-primary dark:group-hover:text-white transition-colors">Hint</span>
              </button>
            )}
          </div>

          {hint && !showFeedback && (
            <div className="mb-8 p-4 bg-gradient-to-r from-primary/10 to-transparent border-l-4 border-primary rounded-r-lg animate-fade-in">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary mt-1">lightbulb</span>
                <div>
                  <p className="text-sm text-slate-700 dark:text-indigo-100 font-medium">AI Hint:</p>
                  <p className="text-slate-600 dark:text-slate-300 text-sm mt-1">{hint}</p>
                </div>
              </div>
            </div>
          )}

          {/* Answer Options */}
          <div className="grid gap-4 mt-2">
            {currentQuestion.options.map((option, idx) => {
              const letter = String.fromCharCode(65 + idx);
              const isSelected = selectedAnswer === option;
              const isCorrect = option === currentQuestion.correctAnswer;

              return (
                <label
                  key={idx}
                  className={`group relative flex items-center p-5 rounded-xl border-2 transition-all duration-200 ${showFeedback ? 'cursor-default' : 'cursor-pointer'
                    } ${getAnswerStyle(option)}`}
                  onClick={() => !showFeedback && setSelectedAnswer(option)}
                >
                  <input className="peer sr-only" name="answer" type="radio" checked={isSelected} readOnly />
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 mr-5 transition-colors ${showFeedback && isCorrect
                    ? "border-green-500 bg-green-500 text-white"
                    : showFeedback && isSelected && !isCorrect
                      ? "border-red-500 bg-red-500 text-white"
                      : isSelected
                        ? "border-primary bg-primary text-white"
                        : "border-slate-300 dark:border-white/20 text-slate-500 dark:text-white/40"
                    }`}>
                    {showFeedback && isCorrect ? (
                      <span className="material-symbols-outlined text-sm">check</span>
                    ) : showFeedback && isSelected && !isCorrect ? (
                      <span className="material-symbols-outlined text-sm">close</span>
                    ) : (
                      <span className="text-sm font-bold">{letter}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-lg font-medium ${showFeedback && isCorrect
                      ? "text-green-700 dark:text-green-400"
                      : showFeedback && isSelected && !isCorrect
                        ? "text-red-700 dark:text-red-400"
                        : "text-slate-700 dark:text-slate-300"
                      }`}>
                      {option}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>

          {/* Feedback Explanation */}
          {showFeedback && (
            <div className="mt-6 p-5 bg-slate-50 dark:bg-[#2e2839] rounded-xl border border-slate-200 dark:border-[#3a3347] animate-fade-in">
              <div className="flex items-start gap-3">
                <span className={`material-symbols-outlined text-2xl ${selectedAnswer === currentQuestion.correctAnswer ? 'text-green-500' : 'text-amber-500'
                  }`}>
                  {selectedAnswer === currentQuestion.correctAnswer ? 'check_circle' : 'info'}
                </span>
                <div>
                  <p className={`font-semibold ${selectedAnswer === currentQuestion.correctAnswer
                    ? 'text-green-700 dark:text-green-400'
                    : 'text-amber-700 dark:text-amber-400'
                    }`}>
                    {selectedAnswer === currentQuestion.correctAnswer ? 'Correct!' : 'Not quite right'}
                  </p>
                  <p className="text-slate-600 dark:text-[#a69db9] mt-2">{currentQuestion.explanation}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div className="border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#131118]/80 backdrop-blur-md p-6 sticky bottom-0 z-20">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <button
              onClick={() => {
                if (currentQuestionIndex > 0) {
                  setCurrentQuestionIndex(prev => prev - 1);
                  setSelectedAnswer(answers[currentQuestionIndex - 1] || null);
                  setShowFeedback(false);
                  setHint(null);
                }
              }}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              Previous
            </button>
            <button
              onClick={showFeedback ? goToNext : handleSubmitAnswer}
              disabled={!selectedAnswer}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {showFeedback
                ? (currentQuestionIndex === quizQuestions.length - 1 ? "See Results" : "Next Question")
                : "Submit Answer"
              }
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
