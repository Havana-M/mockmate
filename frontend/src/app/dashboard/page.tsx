"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { GlassCard } from "@/components/Glasscard";
import { Button } from "@/components/Button";
import { API_BASE_URL } from "@/lib/api";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from "recharts";
import {
    Play,
    Upload,
    FileText,
    Award,
    TrendingUp,
    CheckCircle2,
    Sparkles,
    Bot,
    AlertCircle,
} from "lucide-react";

interface Resume {
    id: number;
    file_name: string;
    created_at: string;
    character_count: number;
}

interface ChartPoint {
    session: string;
    score: number;
}

export default function DashboardPage() {
    const router = useRouter();

    const [roleTitle, setRoleTitle] = useState("");
    const [difficulty, setDifficulty] = useState("Medium");
    const [selectedResumeId, setSelectedResumeId] = useState<number | null>(
        null
    );

    const [resumes, setResumes] = useState<Resume[]>([]);
    const [loadingResumes, setLoadingResumes] = useState(true);
    const [loading, setLoading] = useState(false);

    const [userName, setUserName] = useState("Candidate");
    const [error, setError] = useState<string | null>(null);

    // These remain placeholders until we connect the real dashboard
    // statistics endpoint in the next step.
    const [averageScore] = useState(0);
    const [completedSessions] = useState(0);
    const [technicalQuestions] = useState(0);

    const chartData: ChartPoint[] = [];

    useEffect(() => {
        const userStr = localStorage.getItem("mockmate_user");

        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                setUserName(
                    user.full_name ||
                    user.email ||
                    "Candidate"
                );
            } catch {
                setUserName("Candidate");
            }
        }

        loadResumes();
    }, []);

    const loadResumes = async () => {
        try {
            setLoadingResumes(true);
            setError(null);

            const token = localStorage.getItem("mockmate_token");

            if (!token) {
                router.push("/login");
                return;
            }

            const response = await fetch(
                `${API_BASE_URL}/api/resume/my-resumes`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail || "Failed to load resumes"
                );
            }

            setResumes(data);

            // Automatically select the most recently uploaded resume.
            if (data.length > 0) {
                setSelectedResumeId(data[0].id);
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load your resumes"
            );
        } finally {
            setLoadingResumes(false);
        }
    };

    const handleStartSession = async () => {
        setError(null);

        if (!roleTitle.trim()) {
            setError("Please enter your target job position.");
            return;
        }

        if (!selectedResumeId) {
            setError(
                "Please upload a resume before starting an interview."
            );
            return;
        }

        try {
            setLoading(true);

            const token = localStorage.getItem("mockmate_token");

            if (!token) {
                router.push("/login");
                return;
            }

            const response = await fetch(
                `${API_BASE_URL}/api/interview/generate`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        role_title: roleTitle.trim(),
                        difficulty,
                        resume_id: selectedResumeId,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail ||
                    "Failed to create interview session"
                );
            }

            if (!data.session_id) {
                throw new Error(
                    "The backend did not return a session ID."
                );
            }

            router.push(`/interview/${data.session_id}`);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to start interview"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#090d16] text-white flex flex-col">
            <Navbar />

            <main className="container mx-auto max-w-6xl flex-1 px-6 py-8">
                {/* Welcome Header */}
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
                    <div>
                        <h1 className="mb-1 text-3xl font-bold tracking-tight">
                            Welcome,{" "}
                            <span className="gradient-text">
                                {userName}
                            </span>{" "}
                            👋
                        </h1>

                        <p className="text-sm text-gray-400">
                            Prepare for interviews using your real
                            resume and real performance data.
                        </p>
                    </div>

                    <span className="flex items-center gap-2 rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
                        <Sparkles className="h-4 w-4" />
                        AI Interview Platform
                    </span>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Current statistics */}
                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                    <GlassCard className="flex items-center justify-between border border-white/10 p-6">
                        <div>
                            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                Average Score
                            </p>

                            <h3 className="text-3xl font-bold text-white">
                                {averageScore > 0
                                    ? `${averageScore}%`
                                    : "—"}
                            </h3>

                            <span className="mt-1 flex items-center gap-1 text-xs font-medium text-gray-500">
                                <TrendingUp className="h-3.5 w-3.5" />
                                Based on completed interviews
                            </span>
                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
                            <Award className="h-6 w-6" />
                        </div>
                    </GlassCard>

                    <GlassCard className="flex items-center justify-between border border-white/10 p-6">
                        <div>
                            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                Completed Sessions
                            </p>

                            <h3 className="text-3xl font-bold text-white">
                                {completedSessions}
                            </h3>

                            <span className="mt-1 block text-xs font-medium text-gray-500">
                                {technicalQuestions} questions evaluated
                            </span>
                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/10 text-purple-400">
                            <CheckCircle2 className="h-6 w-6" />
                        </div>
                    </GlassCard>

                    <GlassCard className="flex items-center justify-between border border-white/10 p-6">
                        <div>
                            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                Resumes Analyzed
                            </p>

                            <h3 className="text-3xl font-bold text-white">
                                {resumes.length}
                            </h3>

                            <span className="mt-1 block text-xs font-medium text-indigo-400">
                                Your uploaded resumes
                            </span>
                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                            <FileText className="h-6 w-6" />
                        </div>
                    </GlassCard>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
                    {/* Interview Configuration */}
                    <div className="md:col-span-5">
                        <GlassCard className="relative flex h-full flex-col justify-between overflow-hidden border border-white/10 p-8">
                            <div className="absolute -left-24 -top-24 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl" />

                            <div>
                                <div className="mb-6 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/20">
                                        <Bot className="h-5 w-5 text-white" />
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-bold text-white">
                                            Start AI Interview
                                        </h3>

                                        <p className="text-xs text-gray-400">
                                            Use your real resume
                                        </p>
                                    </div>
                                </div>

                                <div className="mb-6 space-y-5">
                                    {/* Resume */}
                                    <div>
                                        <div className="mb-2 flex items-center justify-between">
                                            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300">
                                                Resume
                                            </label>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    router.push(
                                                        "/resume"
                                                    )
                                                }
                                                className="flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300"
                                            >
                                                <Upload className="h-3.5 w-3.5" />
                                                Manage resumes
                                            </button>
                                        </div>

                                        {loadingResumes ? (
                                            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-400">
                                                Loading your resumes...
                                            </div>
                                        ) : resumes.length === 0 ? (
                                            <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
                                                <div className="flex items-start gap-3">
                                                    <FileText className="mt-0.5 h-5 w-5 text-yellow-400" />

                                                    <div>
                                                        <p className="text-sm font-medium text-yellow-300">
                                                            Resume required
                                                        </p>

                                                        <p className="mt-1 text-xs text-yellow-200/70">
                                                            Upload a PDF resume before starting your interview.
                                                        </p>

                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="mt-3"
                                                            onClick={() =>
                                                                router.push(
                                                                    "/resume"
                                                                )
                                                            }
                                                        >
                                                            Upload Resume
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <select
                                                value={
                                                    selectedResumeId ?? ""
                                                }
                                                onChange={(e) =>
                                                    setSelectedResumeId(
                                                        Number(
                                                            e.target
                                                                .value
                                                        )
                                                    )
                                                }
                                                className="w-full rounded-xl border border-white/10 bg-[#0f172a] px-4 py-3 text-sm text-white focus:border-indigo-500/50 focus:outline-none"
                                            >
                                                {resumes.map((resume) => (
                                                    <option
                                                        key={resume.id}
                                                        value={resume.id}
                                                    >
                                                        {resume.file_name}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </div>

                                    {/* Role */}
                                    <div>
                                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                                            Target Job Position
                                        </label>

                                        <input
                                            type="text"
                                            value={roleTitle}
                                            onChange={(e) =>
                                                setRoleTitle(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="e.g. Full Stack Developer"
                                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-indigo-500/50 focus:outline-none"
                                        />
                                    </div>

                                    {/* Difficulty */}
                                    <div>
                                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                                            Target Difficulty
                                        </label>

                                        <select
                                            value={difficulty}
                                            onChange={(e) =>
                                                setDifficulty(
                                                    e.target.value
                                                )
                                            }
                                            className="w-full rounded-xl border border-white/10 bg-[#0f172a] px-4 py-3 text-sm text-white focus:border-indigo-500/50 focus:outline-none"
                                        >
                                            <option value="Easy">
                                                Easy (Conceptual & Fundamentals)
                                            </option>

                                            <option value="Medium">
                                                Medium (System Architecture & Coding)
                                            </option>

                                            <option value="Hard">
                                                Hard (Senior Level & Deep Scaling)
                                            </option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <Button
                                variant="primary"
                                size="lg"
                                onClick={handleStartSession}
                                disabled={
                                    loading ||
                                    loadingResumes ||
                                    resumes.length === 0 ||
                                    !selectedResumeId ||
                                    !roleTitle.trim()
                                }
                                className="group flex w-full items-center justify-center gap-2"
                            >
                                <Play className="h-4 w-4 fill-current" />

                                <span>
                                    {loading
                                        ? "Generating Session..."
                                        : "Launch Voice Interview"}
                                </span>
                            </Button>
                        </GlassCard>
                    </div>

                    {/* Performance */}
                    <div className="md:col-span-7">
                        <GlassCard className="flex h-full flex-col justify-between border border-white/10 p-8">
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <h3 className="mb-1 text-xl font-bold text-white">
                                        Performance Trend
                                    </h3>

                                    <p className="text-xs text-gray-400">
                                        Real scores from completed
                                        interviews
                                    </p>
                                </div>

                                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-gray-500">
                                    No results yet
                                </span>
                            </div>

                            {chartData.length === 0 ? (
                                <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] text-center">
                                    <TrendingUp className="mb-3 h-8 w-8 text-gray-600" />

                                    <p className="text-sm font-medium text-gray-400">
                                        Complete your first interview
                                    </p>

                                    <p className="mt-1 text-xs text-gray-600">
                                        Your real performance scores will appear here.
                                    </p>
                                </div>
                            ) : (
                                <div className="h-64 w-full">
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <AreaChart
                                            data={chartData}
                                            margin={{
                                                top: 10,
                                                right: 10,
                                                left: -20,
                                                bottom: 0,
                                            }}
                                        >
                                            <defs>
                                                <linearGradient
                                                    id="scoreGlow"
                                                    x1="0"
                                                    y1="0"
                                                    x2="0"
                                                    y2="1"
                                                >
                                                    <stop
                                                        offset="5%"
                                                        stopColor="#6366f1"
                                                        stopOpacity={0.4}
                                                    />
                                                    <stop
                                                        offset="95%"
                                                        stopColor="#6366f1"
                                                        stopOpacity={0}
                                                    />
                                                </linearGradient>
                                            </defs>

                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                stroke="#ffffff10"
                                            />

                                            <XAxis
                                                dataKey="session"
                                                stroke="#94a3b8"
                                                fontSize={12}
                                            />

                                            <YAxis
                                                stroke="#94a3b8"
                                                fontSize={12}
                                                domain={[0, 100]}
                                            />

                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor:
                                                        "#0f172a",
                                                    borderColor:
                                                        "#ffffff20",
                                                    borderRadius:
                                                        "12px",
                                                    color: "#fff",
                                                }}
                                            />

                                            <Area
                                                type="monotone"
                                                dataKey="score"
                                                stroke="#6366f1"
                                                strokeWidth={3}
                                                fillOpacity={1}
                                                fill="url(#scoreGlow)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </GlassCard>
                    </div>
                </div>
            </main>
        </div>
    );
}