"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { Sidebar } from "@/components/Sidebar"
import { getUserProfile } from "@/lib/userStore"
import { useLanguage } from "@/lib/i18n"
import { VoiceInput } from "@/components/VoiceInput"
import { Select } from "@/components/ui/Select"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type Message = {
  role: 'user' | 'ai'
  content: string
}

const SUBJECTS = [
  { id: "general", name: "General Tutor", icon: "school", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  { id: "math", name: "Mathematics", icon: "calculate", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  { id: "science", name: "Science", icon: "science", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  { id: "coding", name: "Coding", icon: "code", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  { id: "history", name: "History", icon: "history_edu", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
]

export default function SmartExplanation() {
  const [query, setQuery] = useState("")
  const [chatHistory, setChatHistory] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState(SUBJECTS[0])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { t, language } = useLanguage()

  // Load chat history from local storage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("ai_tutor_history")
    if (savedHistory) {
      try {
        setChatHistory(JSON.parse(savedHistory))
      } catch (e) {
        console.error("Failed to parse chat history", e)
      }
    }
  }, [])

  // Save chat history to local storage whenever it changes
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem("ai_tutor_history", JSON.stringify(chatHistory))
    }
  }, [chatHistory])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatHistory])

  const handleAsk = async () => {
    if (!query.trim() || loading) return;

    const userMessage = query;
    setQuery("");
    const newHistory = [...chatHistory, { role: 'user', content: userMessage } as Message];
    setChatHistory(newHistory);
    setLoading(true);

    try {
      const response = await fetch("/api/tutor/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: userMessage,
          subject: selectedSubject.name,
          history: chatHistory.slice(-6) // Send last 6 messages for context
        })
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();
      setChatHistory(prev => [...prev, { role: 'ai', content: data.explanation }]);
    } catch (error) {
      console.error("Chat error", error);
      setChatHistory(prev => [...prev, { role: 'ai', content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleAudioSend = async (audioBlob: Blob) => {
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("audio", audioBlob);
      formData.append("history", JSON.stringify(chatHistory.slice(-6)));
      formData.append("language", language);

      const response = await fetch("/api/tutor/live", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();

      // If the model returned text, add it to history
      if (data.text) {
        setChatHistory(prev => [...prev, { role: 'ai', content: data.text }]);
      }

      // If audio, play it
      if (data.audio) {
        const audio = new Audio(`data:audio/wav;base64,${data.audio}`);
        audio.play().catch(e => console.error("Audio playback failed", e));
      }

    } catch (error) {
      console.error("Voice chat error", error);
      setChatHistory(prev => [...prev, { role: 'ai', content: "Sorry, I had trouble processing your voice message." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    if (confirm("Are you sure you want to clear the chat history?")) {
      setChatHistory([]);
      localStorage.removeItem("ai_tutor_history");
    }
  }

  return (
    <div className="flex h-screen bg-background-light dark:bg-background-dark">
      <Sidebar />

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Header */}
        <header className="flex-none flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-surface-dark-lighter bg-white dark:bg-[#131118] z-10 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className={`p-2 rounded-lg ${selectedSubject.bg} ${selectedSubject.color}`}>
              <span className="material-symbols-outlined">{selectedSubject.icon}</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">{t("nav.tutor")}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-slate-500 dark:text-text-secondary">Subject:</span>
                <Select
                  options={SUBJECTS.map(s => ({ value: s.id, label: s.name }))}
                  value={selectedSubject.id}
                  onChange={(val) => setSelectedSubject(SUBJECTS.find(s => s.id === val) || SUBJECTS[0])}
                  className="w-48"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleClearChat}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
            title={t("tutor.clear_chat")}
          >
            <span className="material-symbols-outlined">delete_sweep</span>
          </button>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
          {chatHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-80 animate-fade-in-up">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <span className="material-symbols-outlined text-5xl text-primary">school</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t("tutor.welcome")}</h2>
              <p className="text-slate-500 dark:text-text-secondary max-w-md mb-8">
                {t("tutor.description")}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                <button onClick={() => setQuery("Explain Quantum Physics like I'm 5")} className="p-4 rounded-xl bg-white dark:bg-[#1e182a] border border-slate-200 dark:border-surface-dark-lighter hover:border-primary/50 text-left transition-all group">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white block mb-1 group-hover:text-primary">Explain Quantum Physics</span>
                  <span className="text-xs text-slate-500 dark:text-text-secondary">Like I'm 5 years old</span>
                </button>
                <button onClick={() => setQuery("Give me a practice math problem")} className="p-4 rounded-xl bg-white dark:bg-[#1e182a] border border-slate-200 dark:border-surface-dark-lighter hover:border-primary/50 text-left transition-all group">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white block mb-1 group-hover:text-primary">Practice Problem</span>
                  <span className="text-xs text-slate-500 dark:text-text-secondary">Test my knowledge</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                  {msg.role === 'ai' && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                      <span className="material-symbols-outlined text-sm text-primary">smart_toy</span>
                    </div>
                  )}
                  <div className={`p-4 rounded-2xl max-w-[85%] text-sm md:text-base leading-relaxed ${msg.role === 'user'
                    ? 'bg-primary text-white rounded-br-none'
                    : 'bg-white dark:bg-[#1e182a] border border-slate-200 dark:border-surface-dark-lighter text-slate-800 dark:text-slate-200 rounded-bl-none shadow-sm prose dark:prose-invert max-w-none prose-sm sm:prose-base'
                    }`}>
                    {msg.role === 'user' ? (
                      msg.content
                    ) : (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          table: ({ node, ...props }) => <div className="overflow-x-auto my-4"><table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700 border dark:border-slate-700" {...props} /></div>,
                          th: ({ node, ...props }) => <th className="px-3 py-2 bg-slate-50 dark:bg-slate-800/50 text-left text-xs font-semibold uppercase tracking-wider" {...props} />,
                          td: ({ node, ...props }) => <td className="px-3 py-2 whitespace-nowrap border-t dark:border-slate-700" {...props} />,
                          ul: ({ node, ...props }) => <ul className="list-disc pl-5 space-y-1 my-2" {...props} />,
                          ol: ({ node, ...props }) => <ol className="list-decimal pl-5 space-y-1 my-2" {...props} />,
                          code: ({ node, ...props }) => <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded font-mono text-sm" {...props} />,
                          a: ({ node, ...props }) => <a className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 mt-1">
                      <span className="material-symbols-outlined text-sm text-slate-500 dark:text-slate-300">person</span>
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex gap-4 justify-start animate-fade-in-up">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                    <span className="material-symbols-outlined text-sm text-primary">smart_toy</span>
                  </div>
                  <div className="bg-white dark:bg-[#1e182a] border border-slate-200 dark:border-surface-dark-lighter p-4 rounded-2xl rounded-bl-none">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="flex-none p-4 md:p-6 bg-white dark:bg-[#131118] border-t border-slate-200 dark:border-surface-dark-lighter animate-fade-in">
          <div className="relative max-w-4xl mx-auto flex items-center gap-2">
            <div className="relative flex-1">
              <input
                className="w-full bg-slate-100 dark:bg-[#0a0a0c] rounded-xl border border-transparent focus:border-primary text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 px-4 py-4 pr-14 transition-all outline-none"
                placeholder={t("tutor.input_placeholder")}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                disabled={loading}
                autoFocus
              />
              <button
                onClick={handleAsk}
                disabled={loading || !query.trim()}
                className="absolute right-2 top-2 bottom-2 p-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center aspect-square"
              >
                {loading ? (
                  <span className="material-symbols-outlined animate-spin text-xl">refresh</span>
                ) : (
                  <span className="material-symbols-outlined text-xl">send</span>
                )}
              </button>
            </div>

            <VoiceInput onAudioSend={handleAudioSend} disabled={loading} />
          </div>
          <p className="text-center text-xs text-slate-400 dark:text-[#5f586b] mt-3">
            {t("tutor.disclaimer")}
          </p>
        </div>
      </main>
    </div>
  )
}
