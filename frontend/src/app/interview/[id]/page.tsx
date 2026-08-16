"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { GlassCard } from "@/components/Glasscard";
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
    AlertCircle,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

interface Question {
    id: number;
    text: string;
    type: string;
    difficulty: string;
    ideal_answer?: string;
}

interface SessionData {
    session_id: number;
    role_title: string;
    status: string;
    difficulty: string;
    questions: Question[];
}

interface EvaluationResult {
    session_id: number;
    overall_score: number;
    status: string;
    questions_evaluated: number;
    results: Array<{
        question_id: number;
        technical_score: number;
        communication_score: number;
        star_score: number;
        overall_score: number;
        strengths: string[];
        weaknesses: string[];
        improved_answer: string;
    }>;
}

export default function InterviewRoomPage() {
    const params = useParams();
    const router = useRouter();

    const sessionId = params.id;

    const [session, setSession] = useState<SessionData | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [timerSeconds, setTimerSeconds] = useState(0);
    const [error, setError] = useState<string | null>(null);

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

    useEffect(() => {
        async function fetchSession() {
            try {
                const token = localStorage.getItem("mockmate_token");

                if (!token) {
                    router.push("/login");
                    return;
                }

                const response = await fetch(
                    `${API_BASE_URL}/api/interview/session/${sessionId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.detail || "Failed to load interview session"
                    );
                }

                setSession(data);
            } catch (err) {
                console.error("Error loading session:", err);

                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load interview session"
                );
            } finally {
                setLoading(false);
            }
        }

        if (sessionId) {
            fetchSession();
        }
    }, [sessionId, router]);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimerSeconds((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!transcript || !session?.questions[currentIndex]) {
            return;
        }

        const questionId = session.questions[currentIndex].id;

        setAnswers((prev) => ({
            ...prev,
            [questionId]: transcript,
        }));
    }, [transcript, currentIndex, session]);

    const currentQuestion = session?.questions[currentIndex];

    const handleNext = () => {
        stopListening();
        stopSpeaking();
        setTranscript("");

        if (session && currentIndex < session.questions.length - 1) {
            setCurrentIndex((prev) => prev + 1);
        }
    };

    const handlePrev = () => {
        stopListening();
        stopSpeaking();
        setTranscript("");

        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);

            const previousQuestion =
                session?.questions[currentIndex - 1];

            if (previousQuestion) {
                setTranscript(
                    answers[previousQuestion.id] || ""
                );
            }
        }
    };

    const handleFinishInterview = async () => {
        if (!session) {
            return;
        }

        stopListening();
        stopSpeaking();

        setSubmitting(true);
        setError(null);

        try {
            const token = localStorage.getItem("mockmate_token");

            if (!token) {
                router.push("/login");
                return;
            }

            const cleanedAnswers: Record<number, string> = {};

            session.questions.forEach((question) => {
                const answer = answers[question.id];

                if (answer && answer.trim()) {
                    cleanedAnswers[question.id] = answer.trim();
                }
            });

            if (Object.keys(cleanedAnswers).length === 0) {
                setError(
                    "Please answer at least one question before finishing the interview."
                );
                return;
            }

            const response = await fetch(
                `${API_BASE_URL}/api/interview/evaluate`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        session_id: session.session_id,
                        answers: cleanedAnswers,
                    }),
                }
            );

            const data: EvaluationResult | { detail?: string } =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    "detail" in data && data.detail
                        ? data.detail
                        : "Interview evaluation failed"
                );
            }

            // Keep the real evaluation available for the next results page.
            sessionStorage.setItem(
                `mockmate_evaluation_${session.session_id}`,
                JSON.stringify(data)
            );

            router.push(
                `/interview/${session.session_id}/results`
            );
        } catch (err) {
            console.error("Interview evaluation error:", err);

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to evaluate the interview"
            );
        } finally {
            setSubmitting(false);
        }
    };

    const formatTime = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;

        return `${mins.toString().padStart(2, "0")}:${secs
            .toString()
            .padStart(2, "0")}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#090d16] text-white">
                <Navbar />

                <div className="flex min-h-[80vh] items-center justify-center">
                    <div className="flex items-center gap-3 text-indigo-400">
                        <Sparkles className="h-6 w-6 animate-spin" />
                        <span className="text-lg">
                            Preparing AI Voice Room...
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen bg-[#090d16] text-white">
                <Navbar />

                <div className="flex min-h-[80vh] items-center justify-center px-6">
                    <GlassCard className="max-w-md border border-white/10 p-8 text-center">
                        <AlertCircle className="mx-auto mb-4 h-10 w-10 text-red-400" />
                        <h2 className="text-xl font-semibold">
                            Interview unavailable
                        </h2>

                        <p className="mt-2 text-sm text-gray-400">
                            {error || "Could not load this interview."}
                        </p>
                    </GlassCard>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#090d16] text-white">
            <Navbar />

            <main className="container mx-auto flex max-w-5xl flex-1 flex-col px-6 py-8">
                {error && (
                    <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
                    <div>
                        <div className="mb-1 flex items-center gap-3">
                            <h1 className="text-2xl font-bold">
                                {session.role_title}
                            </h1>

                            <span className="rounded-full border border-indigo-500/30 bg-indigo-500/20 px-3 py-1 text-xs font-medium text-indigo-300">
                                {session.difficulty}
                            </span>
                        </div>

                        <p className="text-sm text-gray-400">
                            Live AI Voice Interview
                        </p>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-mono text-sm text-gray-300">
                            <Clock className="h-4 w-4 text-indigo-400" />
                            <span>{formatTime(timerSeconds)}</span>
                        </div>

                        <div className="text-sm font-medium text-gray-400">
                            Question{" "}
                            <span className="font-bold text-white">
                                {currentIndex + 1}
                            </span>{" "}
                            of{" "}
                            <span className="font-bold text-white">
                                {session.questions.length}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid flex-1 grid-cols-1 gap-8 md:grid-cols-12">
                    <div className="flex flex-col gap-6 md:col-span-7">
                        <GlassCard className="relative flex flex-1 flex-col justify-between overflow-hidden border border-white/10 p-8">
                            <div>
                                <div className="mb-6 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/20">
                                            <Bot className="h-5 w-5 text-white" />
                                        </div>

                                        <div>
                                            <h3 className="font-semibold text-white">
                                                AI Interviewer
                                            </h3>

                                            <span className="text-xs text-gray-400">
                                                MockMate Voice Interviewer
                                            </span>
                                        </div>
                                    </div>

                                    <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-purple-400">
                                        {currentQuestion?.type ||
                                            "voice"}
                                    </span>
                                </div>

                                <div className="my-6">
                                    <p className="text-xl font-medium leading-relaxed text-gray-100">
                                        "{currentQuestion?.text}"
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between border-t border-white/10 pt-6">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        if (isSpeaking) {
                                            stopSpeaking();
                                        } else if (currentQuestion) {
                                            speakText(
                                                currentQuestion.text
                                            );
                                        }
                                    }}
                                    className="flex items-center gap-2"
                                >
                                    {isSpeaking ? (
                                        <>
                                            <VolumeX className="h-4 w-4 text-red-400" />
                                            <span>Stop Voice</span>
                                        </>
                                    ) : (
                                        <>
                                            <Volume2 className="h-4 w-4 text-indigo-400" />
                                            <span>Read Question Aloud</span>
                                        </>
                                    )}
                                </Button>
                            </div>
                        </GlassCard>
                    </div>

                    <div className="flex flex-col gap-6 md:col-span-5">
                        <GlassCard className="flex flex-1 flex-col justify-between border border-white/10 p-8">
                            <div>
                                <div className="mb-6 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                                            <User className="h-5 w-5 text-gray-300" />
                                        </div>

                                        <div>
                                            <h3 className="font-semibold text-white">
                                                Your Response
                                            </h3>

                                            <span className="text-xs text-gray-400">
                                                Speak or type your answer
                                            </span>
                                        </div>
                                    </div>

                                    {isListening && (
                                        <span className="flex animate-pulse items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400">
                                            <span className="h-2 w-2 rounded-full bg-red-500" />
                                            Recording
                                        </span>
                                    )}
                                </div>

                                <textarea
                                    value={
                                        currentQuestion
                                            ? answers[currentQuestion.id] || ""
                                            : ""
                                    }
                                    onChange={(e) => {
                                        if (!currentQuestion) {
                                            return;
                                        }

                                        setAnswers((prev) => ({
                                            ...prev,
                                            [currentQuestion.id]:
                                                e.target.value,
                                        }));
                                    }}
                                    placeholder="Speak or type your answer here..."
                                    className="h-48 w-full resize-none rounded-xl border border-white/10 bg-white/5 p-4 text-sm leading-relaxed text-gray-200 placeholder-gray-500 focus:border-indigo-500/50 focus:outline-none"
                                />
                            </div>

                            <div className="border-t border-white/10 pt-6">
                                <Button
                                    variant={
                                        isListening
                                            ? "secondary"
                                            : "primary"
                                    }
                                    size="md"
                                    onClick={() => {
                                        if (isListening) {
                                            stopListening();
                                        } else {
                                            setTranscript("");
                                            startListening();
                                        }
                                    }}
                                    className="flex w-full items-center justify-center gap-2"
                                >
                                    {isListening ? (
                                        <>
                                            <MicOff className="h-5 w-5 text-red-400" />
                                            <span>
                                                Stop Microphone
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <Mic className="h-5 w-5" />
                                            <span>
                                                Start Voice Response
                                            </span>
                                        </>
                                    )}
                                </Button>
                            </div>
                        </GlassCard>
                    </div>
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
                    <Button
                        variant="outline"
                        size="md"
                        onClick={handlePrev}
                        disabled={currentIndex === 0 || submitting}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Previous</span>
                    </Button>

                    {currentIndex === session.questions.length - 1 ? (
                        <Button
                            variant="primary"
                            size="md"
                            onClick={handleFinishInterview}
                            disabled={submitting}
                            className="flex items-center gap-2"
                        >
                            {submitting ? (
                                <span>Evaluating...</span>
                            ) : (
                                <span>Finish Interview</span>
                            )}

                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    ) : (
                        <Button
                            variant="primary"
                            size="md"
                            onClick={handleNext}
                            disabled={submitting}
                            className="flex items-center gap-2"
                        >
                            <span>Next Question</span>
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </main>
        </div>
    );
}