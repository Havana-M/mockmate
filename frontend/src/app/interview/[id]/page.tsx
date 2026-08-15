"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/Button";
import { useSpeech } from "@/hooks/useSpeech";
import {
    Mic,
    MicOff,
    Volume2,
    VolumeX,
    ArrowRight,
    ArrowLeft,
    Bot,
    User,
    Clock,
    Sparkles,
    CheckCircle2,
} from "lucide-react";

interface Question {
    id: number;
    text: string;
    category: string;
    difficulty: string;
    order_index: number;
}

interface SessionData {
    session_id: number;
    role_title: string;
    status: string;
    difficulty: string;
    questions: Question[];
}

export default function InterviewRoomPage() {
    const params = useParams();
    const router = useRouter();
    const sessionId = params.id;

    const [session, setSession] = useState<SessionData | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [timerSeconds, setTimerSeconds] = useState(0);

    const {
        isListening,
        transcript,
        setTranscript,
        startListening,
        stopListening,
        isSpeaking,
        speakText,
        stopSpeaking,
    } = useSpeech();

    // Fetch session details on load
    useEffect(() => {
        async function fetchSession() {
            try {
                const token = localStorage.getItem("mockmate_token");
                const res = await fetch(`http://localhost:8000/api/interview/session/${sessionId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (res.ok) {
                    const data = await res.json();
                    setSession(data);
                }
            } catch (err) {
                console.error("Error loading session:", err);
            } finally {
                setLoading(false);
            }
        }
        if (sessionId) fetchSession();
    }, [sessionId]);

    // Session timer
    useEffect(() => {
        const interval = setInterval(() => {
            setTimerSeconds((prev) => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Update answer state as candidate speaks
    useEffect(() => {
        if (transcript) {
            setAnswers((prev) => ({
                ...prev,
                [currentIndex]: transcript,
            }));
        }
    }, [transcript, currentIndex]);

    const currentQuestion = session?.questions[currentIndex];

    const handleNext = () => {
        stopListening();
        stopSpeaking();
        setTranscript("");
        if (session && currentIndex < session.questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            router.push("/dashboard");
        }
    };

    const handlePrev = () => {
        stopListening();
        stopSpeaking();
        setTranscript("");
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const formatTime = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#090d16] text-white flex flex-col justify-between">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="flex items-center gap-3 text-indigo-400">
                        <Sparkles className="w-6 h-6 animate-spin" />
                        <span className="text-lg">Preparing AI Voice Room...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#090d16] text-white flex flex-col justify-between selection:bg-indigo-500/30">
            <Navbar />

            <main className="container mx-auto px-6 py-8 flex-1 flex flex-col max-w-5xl">
                {/* Top Room Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-bold">{session?.role_title || "Mock Interview"}</h1>
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                {session?.difficulty || "Medium"}
                            </span>
                        </div>
                        <p className="text-gray-400 text-sm">
                            Live AI Voice Session • Interactive Speech & STAR Scoring
                        </p>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-gray-300 text-sm font-mono bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                            <Clock className="w-4 h-4 text-indigo-400" />
                            <span>{formatTime(timerSeconds)}</span>
                        </div>

                        <div className="text-sm font-medium text-gray-400">
                            Question <span className="text-white font-bold">{currentIndex + 1}</span> of{" "}
                            <span className="text-white font-bold">{session?.questions.length || 5}</span>
                        </div>
                    </div>
                </div>

                {/* Main Voice Room Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 flex-1">
                    {/* Left Column: AI Interviewer Avatar & Question Box */}
                    <div className="md:col-span-7 flex flex-col gap-6">
                        <GlassCard className="p-8 border border-white/10 relative overflow-hidden flex-1 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                            <Bot className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white">AI Interviewer</h3>
                                            <span className="text-xs text-gray-400">MockMate Voice Avatar</span>
                                        </div>
                                    </div>

                                    <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                        {currentQuestion?.category || "conceptual"}
                                    </span>
                                </div>

                                <div className="my-6">
                                    <p className="text-xl font-medium leading-relaxed text-gray-100">
                                        "{currentQuestion?.text}"
                                    </p>
                                </div>
                            </div>

                            {/* Speech Controls */}
                            <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        if (isSpeaking) stopSpeaking();
                                        else if (currentQuestion) speakText(currentQuestion.text);
                                    }}
                                    className="flex items-center gap-2"
                                >
                                    {isSpeaking ? (
                                        <>
                                            <VolumeX className="w-4 h-4 text-red-400" />
                                            <span>Stop Voice</span>
                                        </>
                                    ) : (
                                        <>
                                            <Volume2 className="w-4 h-4 text-indigo-400" />
                                            <span>Read Question Aloud</span>
                                        </>
                                    )}
                                </Button>

                                {isSpeaking && (
                                    <div className="flex items-center gap-1">
                                        <div className="w-1.5 h-6 bg-indigo-500 rounded-full animate-bounce" />
                                        <div className="w-1.5 h-8 bg-purple-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                                        <div className="w-1.5 h-5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                                    </div>
                                )}
                            </div>
                        </GlassCard>
                    </div>

                    {/* Right Column: Candidate Voice Response & Live Transcript */}
                    <div className="md:col-span-5 flex flex-col gap-6">
                        <GlassCard className="p-8 border border-white/10 flex-1 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                            <User className="w-5 h-5 text-gray-300" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white">Your Response</h3>
                                            <span className="text-xs text-gray-400">Speak or type your answer</span>
                                        </div>
                                    </div>

                                    {isListening && (
                                        <span className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse">
                                            <span className="w-2 h-2 rounded-full bg-red-500" />
                                            Recording Live
                                        </span>
                                    )}
                                </div>

                                {/* Transcript Textarea */}
                                <textarea
                                    value={answers[currentIndex] || ""}
                                    onChange={(e) =>
                                        setAnswers((prev) => ({
                                            ...prev,
                                            [currentIndex]: e.target.value,
                                        }))
                                    }
                                    placeholder="Click the microphone to speak your answer, or type your response here..."
                                    className="w-full h-48 bg-white/5 border border-white/10 rounded-xl p-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 resize-none text-sm leading-relaxed"
                                />
                            </div>

                            {/* Mic Toggle Button */}
                            <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                                <Button
                                    variant={isListening ? "secondary" : "primary"}
                                    size="md"
                                    onClick={() => {
                                        if (isListening) stopListening();
                                        else startListening();
                                    }}
                                    className="w-full justify-center flex items-center gap-2"
                                >
                                    {isListening ? (
                                        <>
                                            <MicOff className="w-5 h-5 text-red-400" />
                                            <span>Stop Microphone</span>
                                        </>
                                    ) : (
                                        <>
                                            <Mic className="w-5 h-5" />
                                            <span>Start Voice Response</span>
                                        </>
                                    )}
                                </Button>
                            </div>
                        </GlassCard>
                    </div>
                </div>

                {/* Bottom Navigation */}
                <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                    <Button
                        variant="outline"
                        size="md"
                        onClick={handlePrev}
                        disabled={currentIndex === 0}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Previous</span>
                    </Button>

                    <Button variant="primary" size="md" onClick={handleNext} className="flex items-center gap-2">
                        <span>
                            {session && currentIndex === session.questions.length - 1
                                ? "Finish Interview"
                                : "Next Question"}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                </div>
            </main>
        </div>
    );
}
