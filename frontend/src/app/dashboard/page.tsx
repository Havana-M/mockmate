"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import {
    Upload,
    FileText,
    Award,
    TrendingUp,
    CheckCircle2,
    Sparkles,
    Bot,
    AlertCircle,
} from "lucide-react";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from "recharts";
import { API_BASE_URL } from "@/lib/api";

const NAVY = "#0F172A";
const SIDEBAR_NAVY = "#0F172A";
const SIDEBAR_ICON = "#1E3A5F";

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
        <AppShell>
            <div className="min-h-screen bg-white text-slate-900">
                <main className="mx-auto max-w-7xl px-6 py-8">

                    {/* HEADER */}
                    <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
                        <div>
                            <p className="mb-2 text-sm font-medium text-slate-500">
                                AI Interview Preparation
                            </p>

                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                                Welcome,{" "}
                                <span className="text-[#0F172A]">
                                    {userName}
                                </span>{" "}
                                👋
                            </h1>

                            <p className="mt-2 text-sm text-slate-500">
                                Prepare smarter. Practice better. Get
                                interview-ready.
                            </p>
                        </div>

                        <div
                            className="flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold"
                            style={{
                                borderColor: `${NAVY}20`,
                                color: NAVY,
                                backgroundColor: "#f8fafc",
                            }}
                        >
                            <Sparkles className="h-4 w-4" />
                            AI Interview Platform
                        </div>
                    </div>

                    {/* ERROR */}
                    {error && (
                        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                            <AlertCircle className="h-5 w-5" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* STAT CARDS */}
                    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">

                        {/* Average Score */}
                        <div
                            className="
                                group flex items-center justify-between
                                rounded-2xl border border-slate-200
                                bg-white p-6 shadow-sm
                                transition-all duration-300
                                hover:-translate-y-1
                                hover:shadow-xl
                            "
                        >
                            <div>
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Average Score
                                </p>

                                <h3 className="text-3xl font-bold text-slate-900">
                                    {averageScore > 0
                                        ? `${averageScore}%`
                                        : "—"}
                                </h3>

                                <span className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                                    <TrendingUp className="h-3.5 w-3.5" />
                                    Based on completed interviews
                                </span>
                            </div>

                            <div
                                className="
                                    flex h-12 w-12 items-center justify-center
                                    rounded-xl text-white
                                    shadow-sm
                                "
                                style={{
                                    backgroundColor: SIDEBAR_NAVY,
                                    border: `1px solid ${SIDEBAR_ICON}`,
                                }}
                            >
                                <Award className="h-6 w-6" />
                            </div>
                        </div>

                        {/* Completed Sessions */}
                        <div
                            className="
                                group flex items-center justify-between
                                rounded-2xl border border-slate-200
                                bg-white p-6 shadow-sm
                                transition-all duration-300
                                hover:-translate-y-1
                                hover:shadow-xl
                            "
                        >
                            <div>
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Completed Sessions
                                </p>

                                <h3 className="text-3xl font-bold text-slate-900">
                                    {completedSessions}
                                </h3>

                                <span className="mt-2 block text-xs text-slate-500">
                                    {technicalQuestions} questions evaluated
                                </span>
                            </div>

                            <div
                                className="
                                    flex h-12 w-12 items-center justify-center
                                    rounded-xl text-white
                                    shadow-sm
                                "
                                style={{
                                    backgroundColor: SIDEBAR_NAVY,
                                    border: `1px solid ${SIDEBAR_ICON}`,
                                }}
                            >
                                <CheckCircle2 className="h-6 w-6" />
                            </div>
                        </div>

                        {/* Resumes */}
                        <div
                            className="
                                group flex items-center justify-between
                                rounded-2xl border border-slate-200
                                bg-white p-6 shadow-sm
                                transition-all duration-300
                                hover:-translate-y-1
                                hover:shadow-xl
                            "
                        >
                            <div>
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Resumes Analyzed
                                </p>

                                <h3 className="text-3xl font-bold text-slate-900">
                                    {resumes.length}
                                </h3>

                                <span
                                    className="mt-2 block text-xs font-medium"
                                    style={{ color: NAVY }}
                                >
                                    Your uploaded resumes
                                </span>
                            </div>

                            <div
                                className="
                                    flex h-12 w-12 items-center justify-center
                                    rounded-xl text-white
                                    shadow-sm
                                "
                                style={{
                                    backgroundColor: SIDEBAR_NAVY,
                                    border: `1px solid ${SIDEBAR_ICON}`,
                                }}
                            >
                                <FileText className="h-6 w-6" />
                            </div>
                        </div>
                    </div>

                    {/* MAIN GRID */}
                    <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">

                        {/* START INTERVIEW */}
                        <div className="xl:col-span-5">
                            <div
                                className="
                                    flex h-full flex-col justify-between
                                    rounded-2xl border border-slate-200
                                    bg-white p-8 shadow-sm
                                    transition-all duration-300
                                    hover:-translate-y-1
                                    hover:shadow-xl
                                "
                            >
                                <div>

                                    <div className="mb-7 flex items-center gap-4">
                                        <div
                                            className="
                                                flex h-14 w-14 items-center
                                                justify-center rounded-xl
                                                text-white shadow-md
                                            "
                                            style={{
                                                backgroundColor:
                                                    SIDEBAR_NAVY,
                                                border: `1px solid ${SIDEBAR_ICON}`,
                                            }}
                                        >
                                            <Bot className="h-6 w-6" />
                                        </div>

                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900">
                                                Start AI Interview
                                            </h3>

                                            <p className="mt-1 text-xs text-slate-500">
                                                Personalized interview based
                                                on your profile
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">

                                        {/* RESUME */}
                                        <div>
                                            <div className="mb-2 flex items-center justify-between">
                                                <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                                                    Resume
                                                </label>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        router.push("/resume")
                                                    }
                                                    className="
                                                        flex items-center gap-1
                                                        text-xs font-semibold
                                                        text-[#0F172A]
                                                        transition
                                                        hover:opacity-70
                                                    "
                                                >
                                                    <Upload className="h-3.5 w-3.5" />
                                                    Manage resumes
                                                </button>
                                            </div>

                                            {loadingResumes ? (
                                                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                                                    Loading your resumes...
                                                </div>
                                            ) : resumes.length === 0 ? (
                                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                                    <div className="flex items-start gap-3">
                                                        <FileText
                                                            className="mt-0.5 h-5 w-5"
                                                            style={{
                                                                color: NAVY,
                                                            }}
                                                        />

                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-800">
                                                                Resume required
                                                            </p>

                                                            <p className="mt-1 text-xs text-slate-500">
                                                                Upload a PDF
                                                                resume before
                                                                starting your
                                                                interview.
                                                            </p>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    router.push(
                                                                        "/resume"
                                                                    )
                                                                }
                                                                className="
                                                                    mt-3 rounded-lg
                                                                    px-4 py-2
                                                                    text-xs font-semibold
                                                                    text-white
                                                                    transition
                                                                    hover:opacity-90
                                                                "
                                                                style={{
                                                                    backgroundColor:
                                                                        NAVY,
                                                                }}
                                                            >
                                                                Upload Resume
                                                            </button>
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
                                                                e.target.value
                                                            )
                                                        )
                                                    }
                                                    className="
                                                        w-full rounded-xl
                                                        border border-slate-200
                                                        bg-white px-4 py-3
                                                        text-sm text-slate-800
                                                        outline-none transition
                                                        focus:border-[#0F172A]
                                                        focus:ring-2
                                                        focus:ring-slate-200
                                                    "
                                                >
                                                    {resumes.map(
                                                        (resume) => (
                                                            <option
                                                                key={resume.id}
                                                                value={
                                                                    resume.id
                                                                }
                                                            >
                                                                {
                                                                    resume.file_name
                                                                }
                                                            </option>
                                                        )
                                                    )}
                                                </select>
                                            )}
                                        </div>

                                        {/* JOB POSITION */}
                                        <div>
                                            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-600">
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
                                                placeholder="e.g. Python Developer"
                                                className="
                                                    w-full rounded-xl
                                                    border border-slate-200
                                                    bg-white px-4 py-3
                                                    text-sm text-slate-800
                                                    placeholder-slate-400
                                                    outline-none transition
                                                    focus:border-[#0F172A]
                                                    focus:ring-2
                                                    focus:ring-slate-200
                                                "
                                            />
                                        </div>

                                        {/* DIFFICULTY */}
                                        <div>
                                            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                                                Target Difficulty
                                            </label>

                                            <select
                                                value={difficulty}
                                                onChange={(e) =>
                                                    setDifficulty(
                                                        e.target.value
                                                    )
                                                }
                                                className="
                                                    w-full rounded-xl
                                                    border border-slate-200
                                                    bg-white px-4 py-3
                                                    text-sm text-slate-800
                                                    outline-none transition
                                                    focus:border-[#0F172A]
                                                    focus:ring-2
                                                    focus:ring-slate-200
                                                "
                                            >
                                                <option value="Easy">
                                                    Easy — Fundamentals
                                                </option>

                                                <option value="Medium">
                                                    Medium — Practical
                                                    Development
                                                </option>

                                                <option value="Hard">
                                                    Hard — Advanced & System
                                                    Design
                                                </option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* LAUNCH BUTTON */}
                                <button
                                    type="button"
                                    onClick={handleStartSession}
                                    disabled={
                                        loading ||
                                        loadingResumes ||
                                        resumes.length === 0 ||
                                        !selectedResumeId ||
                                        !roleTitle.trim()
                                    }
                                    className="
                                        mt-8 flex w-full items-center
                                        justify-center gap-2 rounded-xl
                                        px-5 py-3.5 text-sm font-semibold
                                        text-white shadow-md
                                        transition-all duration-300
                                        hover:-translate-y-0.5
                                        hover:shadow-lg
                                        disabled:cursor-not-allowed
                                        disabled:opacity-50
                                    "
                                    style={{
                                        backgroundColor: NAVY,
                                    }}
                                >
                                    {loading
                                        ? "Generating Session..."
                                        : "Launch AI Interview →"}
                                </button>
                            </div>
                        </div>

                        {/* PERFORMANCE */}
                        <div className="xl:col-span-7">
                            <div
                                className="
                                    flex h-full flex-col
                                    rounded-2xl border border-slate-200
                                    bg-white p-8 shadow-sm
                                    transition-all duration-300
                                    hover:-translate-y-1
                                    hover:shadow-xl
                                "
                            >
                                <div className="mb-6 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900">
                                            Performance Trend
                                        </h3>

                                        <p className="mt-1 text-xs text-slate-500">
                                            Your interview performance over
                                            time
                                        </p>
                                    </div>

                                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
                                        No results yet
                                    </span>
                                </div>

                                {chartData.length === 0 ? (
                                    <div
                                        className="
                                            flex min-h-[350px]
                                            flex-1 flex-col
                                            items-center justify-center
                                            rounded-xl border border-dashed
                                            border-slate-200 bg-slate-50
                                            text-center
                                        "
                                    >
                                        <div
                                            className="
                                                mb-4 flex h-12 w-12
                                                items-center justify-center
                                                rounded-xl text-white
                                                shadow-sm
                                            "
                                            style={{
                                                backgroundColor:
                                                    SIDEBAR_NAVY,
                                                border: `1px solid ${SIDEBAR_ICON}`,
                                            }}
                                        >
                                            <TrendingUp className="h-6 w-6" />
                                        </div>

                                        <p className="text-sm font-semibold text-slate-800">
                                            Complete your first interview
                                        </p>

                                        <p className="mt-2 max-w-sm text-xs leading-5 text-slate-500">
                                            Your performance scores will
                                            appear here once you complete an
                                            interview.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="h-[350px] w-full">
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
                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    stroke="#e2e8f0"
                                                />

                                                <XAxis
                                                    dataKey="session"
                                                    stroke="#64748b"
                                                    fontSize={12}
                                                />

                                                <YAxis
                                                    stroke="#64748b"
                                                    fontSize={12}
                                                    domain={[0, 100]}
                                                />

                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor:
                                                            "#ffffff",
                                                        borderColor:
                                                            "#e2e8f0",
                                                        borderRadius:
                                                            "12px",
                                                        color: NAVY,
                                                    }}
                                                />

                                                <Area
                                                    type="monotone"
                                                    dataKey="score"
                                                    stroke={NAVY}
                                                    strokeWidth={3}
                                                    fill={NAVY}
                                                    fillOpacity={0.08}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </AppShell>
    );
}