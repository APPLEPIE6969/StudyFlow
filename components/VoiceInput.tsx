"use client"

import { useState, useRef, useEffect } from "react"
import { useLanguage } from "@/lib/i18n"

interface VoiceInputProps {
    onAudioSend: (audioBlob: Blob) => Promise<void>
    disabled?: boolean
}

export function VoiceInput({ onAudioSend, disabled }: VoiceInputProps) {
    const [isRecording, setIsRecording] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [showPermissionPrompt, setShowPermissionPrompt] = useState(false)
    const [lastError, setLastError] = useState<string | null>(null)
    const [diagInfo, setDiagInfo] = useState<{
        protocol: string;
        secureContext: boolean;
        hasMediaDevices: boolean;
        permissionState: string;
    } | null>(null)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])
    const { t } = useLanguage()

    // Check permission state on mount if possible
    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (typeof navigator !== 'undefined' && navigator.permissions && (navigator.permissions as any).query) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (navigator.permissions as any).query({ name: 'microphone' }).then((result: any) => {
                if (result.state === 'denied') {
                    // Pre-emptively show help if we know it's denied
                    // Actually clearer to wait for click to avoid annoying users
                }
                result.onchange = () => {
                    if (result.state === 'granted') setShowPermissionPrompt(false)
                }
            }).catch(console.error)
        }
    }, [])

    const handleMicClick = () => {
        if (isRecording) {
            stopRecording()
        } else {
            startRecording()
        }
    }

    const startRecording = async () => {
        setIsProcessing(true)
        setLastError(null)

        // Collect diagnostics
        const info = {
            protocol: typeof window !== 'undefined' ? window.location.protocol : 'N/A',
            secureContext: typeof window !== 'undefined' ? window.isSecureContext : false,
            hasMediaDevices: !!(navigator?.mediaDevices),
            permissionState: 'unknown'
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (navigator.permissions && (navigator.permissions as any).query) {
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const result = await (navigator.permissions as any).query({ name: 'microphone' });
                info.permissionState = result.state;
            } catch { }
        }
        setDiagInfo(info)

        // Check for secure context
        if (typeof window !== 'undefined' && !window.isSecureContext) {
            setIsProcessing(false)
            setLastError("NotSecureContext")
            setShowPermissionPrompt(true)
            return
        }

        if (!info.hasMediaDevices) {
            setIsProcessing(false)
            setLastError("NoMediaDevices")
            setShowPermissionPrompt(true)
            return
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const mediaRecorder = new MediaRecorder(stream)
            mediaRecorderRef.current = mediaRecorder
            chunksRef.current = []

            setIsProcessing(false)
            setShowPermissionPrompt(false)

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data)
                }
            }

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
                setIsProcessing(true)
                try {
                    await onAudioSend(audioBlob)
                } catch (error) {
                    console.error("Error sending audio:", error)
                } finally {
                    setIsProcessing(false)
                }

                // Stop all tracks to release microphone
                stream.getTracks().forEach(track => track.stop())
            }

            mediaRecorder.start()
            setIsRecording(true)
        } catch (err: unknown) {
            const errorName = err instanceof Error ? err.name : 'UnknownError'
            const errorMessage = err instanceof Error ? err.message : String(err)
            console.error("Mic Access Error:", errorName, errorMessage)
            setIsProcessing(false)
            setLastError(errorName)

            if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError' || errorName === 'NotSecureContext') {
                setShowPermissionPrompt(true)
            } else if (errorName === 'NotFoundError' || errorName === 'DevicesNotFoundError') {
                alert("No microphone found. Please connect a microphone and try again.")
            } else if (errorName === 'NotReadableError' || errorName === 'TrackStartError') {
                alert("Your microphone is currently being used by another application.")
            } else {
                alert(`Microphone error (${errorName}): ${errorMessage}`)
            }
        }
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop()
            setIsRecording(false)
        }
    }

    return (
        <div className="flex items-center gap-2 relative">
            {/* Permission Help Pop-up */}
            {showPermissionPrompt && (
                <div className="absolute bottom-16 right-0 w-80 p-5 bg-white dark:bg-[#1e182a] border border-red-200 dark:border-red-900/30 rounded-2xl shadow-2xl animate-fade-in-up z-50">
                    <div className="flex items-center gap-2 mb-3 text-red-500">
                        <span className="material-symbols-outlined text-xl">warning</span>
                        <p className="font-bold text-sm">Microphone Access Needed</p>
                    </div>

                    <div className="space-y-3 mb-4">
                        <p className="text-xs text-slate-500 dark:text-text-secondary leading-relaxed">
                            {lastError === "NotSecureContext"
                                ? "Microphone access requires a secure connection (HTTPS). This site is currently running on a non-secure connection."
                                : "The browser reported that microphone access is currently blocked. This can happen even if you clicked 'Allow' if there's an OS-level restriction."}
                        </p>

                        <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Troubleshooting Steps:</p>
                            <ul className="text-[11px] text-slate-500 dark:text-text-secondary space-y-2">
                                <li className="flex gap-2">
                                    <span className="text-primary font-bold">1.</span>
                                    <span>Click the **lock icon** 🔒 next to the URL and reset the Microphone permission to &quot;Allow&quot;.</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-primary font-bold">2.</span>
                                    <span>Check **Windows Settings &gt; Privacy &gt; Microphone** and ensure &quot;Allow apps to access your microphone&quot; is ON.</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-primary font-bold">3.</span>
                                    <span>If on a laptop, ensure the physical privacy slider on your webcam/mic is open.</span>
                                </li>
                            </ul>
                        </div>

                        {diagInfo && (
                            <div className="bg-slate-100/50 dark:bg-black/20 p-2 rounded-lg border border-dashed border-slate-200 dark:border-slate-800">
                                <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Technical Info (Share with support):</p>
                                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[9px] font-mono text-slate-400">
                                    <div>Protocol: {diagInfo.protocol}</div>
                                    <div>Secure: {diagInfo.secureContext ? "YES" : "NO"}</div>
                                    <div>MediaAPI: {diagInfo.hasMediaDevices ? "YES" : "NO"}</div>
                                    <div>State: {diagInfo.permissionState}</div>
                                </div>
                                {lastError && <div className="mt-1 text-[9px] font-mono text-red-400/80">Error: {lastError}</div>}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={startRecording}
                            className="flex-1 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-md shadow-primary/20"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => setShowPermissionPrompt(false)}
                            className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-text-secondary text-xs rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            Dismiss
                        </button>
                    </div>
                    <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white dark:bg-[#1e182a] border-r border-b border-red-200 dark:border-red-900/30 rotate-45"></div>
                </div>
            )}

            <button
                onClick={handleMicClick}
                disabled={disabled || isProcessing}
                className={`p-3 rounded-full transition-all flex items-center justify-center shadow-lg ${isRecording
                    ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                    : isProcessing
                        ? "bg-primary/50 text-white cursor-wait animate-pulse"
                        : lastError === "NotAllowedError" || lastError === "PermissionDeniedError" || diagInfo?.permissionState === 'denied'
                            ? "bg-red-500 hover:bg-red-600 text-white"
                            : "bg-primary hover:bg-primary/90 text-white"
                    }`}
                title={isRecording ? t("tutor.stop") : lastError ? "Microphone Access Blocked" : t("tutor.voice_mode")}
            >
                {isProcessing ? (
                    <span className="material-symbols-outlined animate-spin text-xl">refresh</span>
                ) : isRecording ? (
                    <span className="material-symbols-outlined text-xl">stop</span>
                ) : lastError === "NotAllowedError" || lastError === "PermissionDeniedError" || diagInfo?.permissionState === 'denied' ? (
                    <span className="material-symbols-outlined text-xl">mic_off</span>
                ) : (
                    <span className="material-symbols-outlined text-xl">mic</span>
                )}
            </button>

            {isRecording && (
                <div className="absolute right-full mr-4 flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 rounded-full border border-red-100 dark:border-red-900/30 whitespace-nowrap animate-fade-in">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-bold text-red-600 dark:text-red-400">
                        {t("tutor.listening")}
                    </span>
                </div>
            )}

            {isProcessing && (
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {t("tutor.processing")}
                </span>
            )}
        </div>
    )
}
