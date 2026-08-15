"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/Button";
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
    Clock,
    CheckCircle2,
    Sparkles,
    Bot,
} from "lucide-react";

const chartData = [
    { session: "Session 1", score: 68 },
    { session: "Session 2", score: 75 },
    { session: "Session 3", score: 82 },
    { session: "Session 4", score: 88 },
    { session: "Session 5", score: 94 },
];

export default function DashboardPage() {
    const router = useRouter();
    const [roleTitle, setRoleTitle] = useState("Full Stack Developer");
    const [difficulty, setDifficulty] = useState("Medium");
    const [loading, setLoading] = useState(false);
    const [userEmail, setUserEmail] = useState("Candidate");

    useEffect(() => {
        const userStr = localStorage.getItem("mockmate_user");
        if (userStr) {
            try {
                const u = JSON.parse(userStr);
                setUserEmail(u.full_name || u.email || "Candidate");
            } catch (e) { }
        }
    }, []);

    const handleStartSession = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("mockmate_token");
            const res = await fetch("http://localhost:8000/api/interview/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    role_title: roleTitle,
                    difficulty: difficulty,
                }),
            });

            const data = await res.json();
            if (res.ok && data.session_id) {
                router.push(`/interview/${data.session_id}`);
            }
        } catch (err) {
            console.error("Failed to start session:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#090d16] text-white flex flex-col justify-between selection:bg-indigo-500/30">
            <Navbar />

            <main className="container mx-auto px-6 py-8 flex-1 max-w-6xl">
                {/* Welcome Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-1">
                            Welcome Back, <span className="gradient-text">{userEmail}</span> 👋
                        </h1>
                        <p className="text-gray-400 text-sm">
                            Track your interview readiness, speech metrics, and STAR scoring progress.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="px-4 py-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            Pro AI Plan Active
                        </span>
                    </div>
                </div>

                {/* Top 3 Metric Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <GlassCard className="p-6 border border-white/10 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                Average STAR Score
                            </p>
                            <h3 className="text-3xl font-bold text-white">88%</h3>
                            <span className="text-xs text-emerald-400 flex items-center gap-1 mt-1 font-medium">
                                <TrendingUp className="w-3.5 h-3.5" /> +14% this week
                            </span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                            <Award className="w-6 h-6" />
                        </div>
                    </GlassCard>

                    <GlassCard className="p-6 border border-white/10 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                Completed Mock Sessions
                            </p>
                            <h3 className="text-3xl font-bold text-white">5 Sessions</h3>
                            <span className="text-xs text-gray-400 mt-1 block font-medium">
                                12 Technical Questions Solved
                            </span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                    </GlassCard>

                    <GlassCard className="p-6 border border-white/10 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                Resumes Analyzed
                            </p>
                            <h3 className="text-3xl font-bold text-white">1 Active PDF</h3>
                            <span className="text-xs text-indigo-400 mt-1 block font-medium">
                                RAG Vector Context Enabled
                            </span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <FileText className="w-6 h-6" />
                        </div>
                    </GlassCard>
                </div>

                {/* Main Grid: Launch New Session & Progress Analytics */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* Launch New Session Card */}
                    <div className="md:col-span-5 flex flex-col">
                        <GlassCard className="p-8 border border-white/10 flex-1 flex flex-col justify-between relative overflow-hidden">
                            <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

                            <div>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                        <Bot className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Start AI Interview</h3>
                                        <p className="text-xs text-gray-400">Configure job role & difficulty</p>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-6">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                                            Target Job Position
                                        </label>
                                        <input
                                            type="text"
                                            value={roleTitle}
                                            onChange={(e) => setRoleTitle(e.target.value)}
                                            placeholder="e.g. Full Stack Engineer"
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                                            Target Difficulty
                                        </label>
                                        <select
                                            value={difficulty}
                                            onChange={(e) => setDifficulty(e.target.value)}
                                            className="w-full px-4 py-3 bg-[#0f172a] border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500/50 text-sm"
                                        >
                                            <option value="Easy">Easy (Conceptual & Fundamentals)</option>
                                            <option value="Medium">Medium (System Architecture & Coding)</option>
                                            <option value="Hard">Hard (Senior Level & Deep Scaling)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <Button
                                variant="primary"
                                size="lg"
                                onClick={handleStartSession}
                                disabled={loading}
                                className="w-full justify-center group flex items-center gap-2"
                            >
                                <Play className="w-4 h-4 fill-current" />
                                <span>{loading ? "Generating Session..." : "Launch Voice Interview"}</span>
                            </Button>
                        </GlassCard>
                    </div>

                    {/* Analytics Chart Card */}
                    <div className="md:col-span-7 flex flex-col">
                        <GlassCard className="p-8 border border-white/10 flex-1 flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">Performance Trend</h3>
                                    <p className="text-xs text-gray-400">Score progression across mock sessions</p>
                                </div>
                                <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                                    Upward Trend 🚀
                                </span>
                            </div>

                            {/* Recharts Area Chart */}
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="scoreGlow" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                        <XAxis dataKey="session" stroke="#94a3b8" fontSize={12} />
                                        <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "#0f172a",
                                                borderColor: "#ffffff20",
                                                borderRadius: "12px",
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
                        </GlassCard>
                    </div>
                </div>
            </main>
        </div>
    );
}
