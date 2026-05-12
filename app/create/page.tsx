"use client"

import { useState, useCallback, memo } from "react"
import { Sidebar } from "@/components/Sidebar"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, FileText, Plus, Trash2, Loader2, Save, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/lib/i18n"

import { saveQuiz, SavedQuiz } from "@/lib/quizStore"
import { recordActivity, addXP } from "@/lib/userStore"
import { QuizQuestion } from "@/lib/ai"


export default function Create() {
    const router = useRouter()
    const { t } = useLanguage()
    const [activeTab, setActiveTab] = useState<"ai" | "manual">("ai")
    const [title, setTitle] = useState("")
    const [topic, setTopic] = useState("")
    const [isGenerating, setIsGenerating] = useState(false)
    const [generatedTerms, setGeneratedTerms] = useState<Array<QuizQuestion>>([])
    const [generatedSignature, setGeneratedSignature] = useState<string | undefined>(undefined)
    const [manualTerms, setManualTerms] = useState([{ term: "", definition: "" }, { term: "", definition: "" }])
    const handleUpdateTerm = useCallback((index: number, field: "term" | "definition", value: string) => {
        setManualTerms(prev => {
            const newTerms = [...prev]
            newTerms[index] = { ...newTerms[index], [field]: value }
            return newTerms
        })
    }, [])

    const handleDeleteTerm = useCallback((index: number) => {
        setManualTerms(prev => prev.filter((_, idx) => idx !== index))
    }, [])


    const handleGenerate = async () => {
        if (!topic) return;
        setIsGenerating(true)
        try {
            const response = await fetch("/api/quiz/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    topic,
                    type: "Flashcards",
                    amount: 5,
                    language: "English", // Default, could be synced with app language
                    mode: "balanced",
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to generate flashcards");
            }

            const data = await response.json();
            setGeneratedTerms(data.quiz);
            setGeneratedSignature(data.signature);
        } catch (error) {
            console.error("Generation error:", error);
            alert("Failed to generate flashcards. Please try again.");
        } finally {
            setIsGenerating(false)
        }
    }

    const handleSave = async () => {
        if (!title) {
            alert(t("create.error_title"))
            return
        }

        const questions = activeTab === "ai"
            ? generatedTerms.map((t, i) => ({
                id: `q-${i}`,
                question: t.question,
                options: t.options,
                correctAnswer: t.correctAnswer,
                explanation: t.explanation
            }))
            : manualTerms.reduce((acc: any[], t) => {
                if (t.term && t.definition) {
                    acc.push({
                        id: `q-${acc.length}`,
                        question: `What is ${t.term}?`,
                        options: [t.definition, "Incorrect A", "Incorrect B", "Incorrect C"],
                        correctAnswer: t.definition,
                        explanation: t.definition
                    });
                }
                return acc;
            }, [])

        if (questions.length === 0) {
            alert(t("create.error_terms"))
            return
        }

        const newQuizData = {
            title: title,
            topic: topic || "Custom Set",
            questions: questions,
            signature: activeTab === "ai" ? generatedSignature : undefined,
            score: 0,
            totalQuestions: questions.length,
            language: "English", // Default
            aiMode: "balanced" as const,
            difficulty: "Medium",
            questionType: "Multiple Choice",
            instantFeedback: true
        }

        saveQuiz(newQuizData)

        // Record activity
        recordActivity();

        // Reward XP via backend
        let xpReward = 0;
        try {
            const response = await fetch("/api/user/reward", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "create_set" }),
            });
            if (response.ok) {
                const data = await response.json();
                xpReward = data.xpReward;
            }
        } catch (error) {
            console.error("Failed to fetch reward:", error);
        }

        addXP(xpReward);

        router.push("/quizzes")
    }


    const addManualTerm = () => {
        setManualTerms([...manualTerms, { term: "", definition: "" }])
    }

    return (
        <div className="flex h-screen w-full overflow-hidden">
            <Sidebar />

            <main className="flex flex-1 flex-col overflow-y-auto bg-background-light dark:bg-background-dark transition-colors duration-300">
                <div className="flex-1 max-w-5xl mx-auto w-full p-6 md:p-10">
                    <div className="flex items-center gap-4 mb-8 animate-fade-in transition-all">
                        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full hover:bg-white dark:hover:bg-white/10 shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-white/10 bg-slate-100 dark:bg-surface-dark-lighter">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div className="animate-slide-up stagger-1">
                            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none mb-1">
                                {t("create.title")}
                            </h1>
                            <p className="text-slate-500 dark:text-text-secondary font-medium">{t("create.subtitle")}</p>
                        </div>
                    </div>


                    <div className="grid gap-8">
                        {/* Title Section */}
                        <div className="p-6 bg-white dark:bg-surface-dark-lighter rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <label className="block text-sm font-bold mb-2 text-slate-500 dark:text-slate-400 uppercase tracking-wide">{t("create.set_title")}</label>
                            <Input
                                placeholder={t("create.set_title_placeholder")}
                                className="text-xl py-6 border-none bg-transparent shadow-none focus-visible:ring-0 px-0 placeholder:text-slate-300 dark:placeholder:text-slate-600 font-bold text-slate-900 dark:text-white"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                            <div className="h-0.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full mt-2" />
                        </div>

                        {/* Tab Selection */}
                        <div className="flex space-x-4">
                            <button
                                onClick={() => setActiveTab("ai")}
                                className={cn(
                                    "flex-1 py-6 px-6 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-3 relative overflow-hidden group",
                                    activeTab === "ai"
                                        ? "border-primary bg-primary/5 text-primary shadow-lg shadow-primary/10"
                                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-dark-lighter text-slate-500 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-800"
                                )}
                            >
                                <div className={`absolute inset-0 bg-linear-to-br from-primary/10 to-transparent opacity-0 transition-opacity ${activeTab === 'ai' ? 'opacity-100' : ''}`} />
                                <div className={cn("p-3 rounded-xl transition-colors", activeTab === "ai" ? "bg-primary text-white" : "bg-slate-100 dark:bg-slate-800")}>
                                    <Sparkles className="h-6 w-6" />
                                </div>
                                <span className="font-bold text-lg">{t("create.tab_ai")}</span>
                            </button>
                            <button
                                onClick={() => setActiveTab("manual")}
                                className={cn(
                                    "flex-1 py-6 px-6 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-3 group",
                                    activeTab === "manual"
                                        ? "border-primary bg-primary/5 text-primary shadow-lg shadow-primary/10"
                                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-dark-lighter text-slate-500 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-800"
                                )}
                            >
                                <div className={cn("p-3 rounded-xl transition-colors", activeTab === "manual" ? "bg-primary text-white" : "bg-slate-100 dark:bg-slate-800")}>
                                    <FileText className="h-6 w-6" />
                                </div>
                                <span className="font-bold text-lg">{t("create.tab_manual")}</span>
                            </button>
                        </div>

                        {/* Content Area */}
                        <AnimatePresence mode="wait">
                            {activeTab === "ai" ? (
                                <motion.div
                                    key="ai"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-6"
                                >
                                    <Card className="border-slate-200 dark:border-slate-700 shadow-md bg-white dark:bg-surface-dark-lighter">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                                                <Sparkles className="h-5 w-5 text-primary" />
                                                {t("create.ai_generator_title")}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">{t("create.topic_label")}</label>
                                                <textarea
                                                    className="flex min-h-[150px] w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1a1622] px-4 py-3 text-sm ring-offset-background placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y text-slate-900 dark:text-white"
                                                    placeholder={t("create.topic_placeholder")}
                                                    value={topic}
                                                    onChange={(e) => setTopic(e.target.value)}
                                                />
                                            </div>
                                            <Button
                                                onClick={handleGenerate}
                                                disabled={isGenerating || !topic}
                                                className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20 transition-all hover:translate-y-[-2px] hover:shadow-primary/40 rounded-xl"
                                                size="lg"
                                            >
                                                {isGenerating ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                        {t("create.generating")}
                                                    </>
                                                ) : (
                                                    <>
                                                        <Sparkles className="mr-2 h-5 w-5" />
                                                        {t("create.generate_button")}
                                                    </>
                                                )}
                                            </Button>
                                        </CardContent>
                                    </Card>

                                    {generatedTerms.length > 0 && (
                                        <div className="space-y-4">
                                            <h3 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                                                {t("create.preview_title")}
                                                <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">{generatedTerms.length} {t("create.cards_count")}</span>
                                            </h3>
                                            <div className="grid gap-4">
                                                {generatedTerms.map((item, i) => (
                                                    <motion.div
                                                        key={i}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: i * 0.05 }}
                                                        className="p-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-dark-lighter flex flex-col md:flex-row gap-4 hover:border-primary/50 transition-colors shadow-sm"
                                                    >
                                                        <div className="flex-1 font-bold text-lg text-slate-900 dark:text-white">{item.question}</div>
                                                        <div className="hidden md:block w-px bg-slate-200 dark:bg-slate-700 self-stretch" />
                                                        <div className="flex-1 text-slate-600 dark:text-slate-400">{item.correctAnswer}</div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                            <Button
                                                className="w-full h-14 text-lg font-bold rounded-xl mt-4"
                                                onClick={handleSave}
                                            >
                                                <Save className="mr-2 h-5 w-5" />
                                                {t("create.save_button")}
                                            </Button>
                                        </div>
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="manual"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-6"
                                >
                                    <div className="space-y-4">
                                        {manualTerms.map((item, i) => (
                                            <ManualTermItem
                                                key={i}
                                                item={item}
                                                index={i}
                                                onUpdate={handleUpdateTerm}
                                                onDelete={handleDeleteTerm}
                                                t={t}
                                            />
                                        ))}
                                        <Button variant="outline" className="w-full py-8 border-dashed border-2 hover:border-primary hover:text-primary transition-all text-slate-500 text-lg rounded-xl dark:border-slate-700 dark:hover:border-primary" onClick={addManualTerm}>
                                            <Plus className="mr-2 h-5 w-5" />
                                            {t("create.add_card")}
                                        </Button>
                                        <div className="flex justify-end pt-4 sticky bottom-6 z-10">
                                            <Button className="w-full md:w-auto min-w-[200px] h-12 text-lg font-bold rounded-xl shadow-xl shadow-primary/20" size="lg" onClick={handleSave}>
                                                {t("create.save_button")}
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </main>
        </div>
    )
}


const ManualTermItem = memo(({
    item,
    index,
    onUpdate,
    onDelete,
    t
}: {
    item: { term: string; definition: string };
    index: number;
    onUpdate: (index: number, field: "term" | "definition", value: string) => void;
    onDelete: (index: number) => void;
    t: (key: string, ...args: any[]) => string;
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
        >
            <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-dark-lighter shadow-sm overflow-visible">
                <CardContent className="p-4 flex gap-4 items-start pt-6">
                    <div className="flex-none pt-4 text-slate-400 font-mono text-sm w-8 text-center bg-slate-100 dark:bg-slate-800 rounded-lg py-1">
                        {index + 1}
                    </div>
                    <div className="flex-1 space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t("create.term_label")}</label>
                        <Input
                            value={item.term}
                            className="border-b-2 border-x-0 border-t-0 rounded-none focus-visible:ring-0 focus-visible:border-primary px-0 text-lg bg-transparent border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                            placeholder={t("create.term_placeholder")}
                            onChange={(e) => onUpdate(index, "term", e.target.value)}
                        />
                    </div>
                    <div className="flex-1 space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t("create.definition_label")}</label>
                        <Input
                            value={item.definition}
                            className="border-b-2 border-x-0 border-t-0 rounded-none focus-visible:ring-0 focus-visible:border-primary px-0 text-lg bg-transparent border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                            placeholder={t("create.definition_placeholder")}
                            onChange={(e) => onUpdate(index, "definition", e.target.value)}
                        />
                    </div>
                    <Button variant="ghost" size="icon" className="mt-4 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" onClick={() => onDelete(index)}>
                        <Trash2 className="h-5 w-5" />
                    </Button>
                </CardContent>
            </Card>
        </motion.div>
    )
})

ManualTermItem.displayName = "ManualTermItem"
