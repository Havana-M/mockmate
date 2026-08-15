import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { GlassCard } from "@/components/Glasscard";
import { Button } from "@/components/Button";
import {
  Mic,
  FileText,
  Code2,
  BarChart3,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
        {/* Top Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wide backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span>AI-POWERED CAREER READINESS PLATFORM</span>
          </div>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="text-center max-w-4xl mx-auto mb-12">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.15] mb-6">
            Master Technical & HR Interviews with{" "}
            <span className="gradient-text">Real-Time AI Coaching</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Practice voice interviews tailored to your resume experience. Get instant
            evaluations on technical accuracy, communication style, and STAR problem-solving.
          </p>
        </div>

        {/* Hero CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <Link href="/interview">
            <Button variant="primary" size="lg" className="w-full sm:w-auto text-base">
              <Sparkles className="w-5 h-5" />
              Start Free AI Practice
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
          <Link href="/resume">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto text-base">
              <FileText className="w-5 h-5 text-purple-400" />
              Upload PDF Resume
            </Button>
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          <GlassCard className="flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-5">
                <Mic className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Voice Recognition</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Speak into your mic using native browser Speech-to-Text with real-time audio transcript feed.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-xs font-semibold text-indigo-400">
              <Zap className="w-3.5 h-3.5" /> Web Speech API Engine
            </div>
          </GlassCard>

          <GlassCard className="flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-5">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Resume RAG Engine</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Matches your uploaded resume against target job requirements using OpenAI vector embeddings.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-xs font-semibold text-purple-400">
              <ShieldCheck className="w-3.5 h-3.5" /> Supabase pgvector RAG
            </div>
          </GlassCard>

          <GlassCard className="flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-5">
                <Code2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Monaco Code Suite</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Solve coding problems inside VS Code engine with Judge0 test case execution simulator.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-xs font-semibold text-cyan-400">
              <Zap className="w-3.5 h-3.5" /> Judge0 Execution Engine
            </div>
          </GlassCard>

          <GlassCard className="flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">STAR Analytics</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Visual radar charts, speech clarity scoring, and personalized topic recommendations.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" /> Recharts Data Analytics
            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  );
}
