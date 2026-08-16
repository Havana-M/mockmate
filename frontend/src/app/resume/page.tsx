"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Upload,
    FileText,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Trash2,
} from "lucide-react";

import { Navbar } from "@/components/Navbar";
import { GlassCard } from "@/components/Glasscard";
import { Button } from "@/components/Button";
import { API_BASE_URL } from "@/lib/api";

interface Resume {
    id: number;
    file_name: string;
    created_at: string;
    character_count: number;
}

export default function ResumePage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [resumes, setResumes] = useState<Resume[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const token =
        typeof window !== "undefined"
            ? localStorage.getItem("mockmate_token")
            : null;

    useEffect(() => {
        if (!token) {
            router.push("/login");
            return;
        }

        fetchResumes();
    }, [router, token]);

    const fetchResumes = async () => {
        try {
            setLoading(true);
            setError(null);

            const authToken = localStorage.getItem("mockmate_token");

            if (!authToken) {
                router.push("/login");
                return;
            }

            const response = await fetch(
                `${API_BASE_URL}/api/resume/my-resumes`,
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Failed to load resumes");
            }

            setResumes(data);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load your resumes"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0] || null;

        setError(null);
        setSuccess(null);

        if (!file) {
            setSelectedFile(null);
            return;
        }

        if (file.type !== "application/pdf") {
            setSelectedFile(null);
            setError("Please select a PDF file.");
            return;
        }

        setSelectedFile(file);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError("Please select a PDF resume first.");
            return;
        }

        try {
            setUploading(true);
            setError(null);
            setSuccess(null);

            const authToken = localStorage.getItem("mockmate_token");

            if (!authToken) {
                router.push("/login");
                return;
            }

            const formData = new FormData();
            formData.append("file", selectedFile);

            const response = await fetch(
                `${API_BASE_URL}/api/resume/upload`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                    body: formData,
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Resume upload failed");
            }

            setSuccess("Resume uploaded successfully.");
            setSelectedFile(null);

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            await fetchResumes();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to upload resume"
            );
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#090d16] text-white">
            <Navbar />

            <main className="container mx-auto max-w-6xl px-6 py-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">
                        My Resume
                    </h1>
                    <p className="mt-2 text-sm text-gray-400">
                        Upload your resume so MockMate can personalize your
                        interview questions and feedback.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-400">
                        <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                        <span>{success}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Upload Section */}
                    <div className="lg:col-span-1">
                        <GlassCard className="p-6 border border-white/10">
                            <div className="mb-6 flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                                    <Upload className="h-5 w-5" />
                                </div>

                                <div>
                                    <h2 className="font-semibold">
                                        Upload Resume
                                    </h2>
                                    <p className="text-xs text-gray-400">
                                        PDF format only
                                    </p>
                                </div>
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,application/pdf"
                                onChange={handleFileChange}
                                className="hidden"
                            />

                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full rounded-xl border border-dashed border-white/20 bg-white/[0.03] p-8 text-center transition hover:border-indigo-500/50 hover:bg-indigo-500/[0.04]"
                            >
                                <FileText className="mx-auto mb-3 h-10 w-10 text-gray-500" />

                                <p className="text-sm font-medium text-gray-200">
                                    {selectedFile
                                        ? selectedFile.name
                                        : "Choose your resume"}
                                </p>

                                <p className="mt-2 text-xs text-gray-500">
                                    Click to browse your files
                                </p>
                            </button>

                            {selectedFile && (
                                <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                                    <p className="truncate text-sm text-gray-200">
                                        {selectedFile.name}
                                    </p>

                                    <p className="mt-1 text-xs text-gray-500">
                                        {(selectedFile.size / 1024 / 1024).toFixed(
                                            2
                                        )}{" "}
                                        MB
                                    </p>
                                </div>
                            )}

                            <Button
                                variant="primary"
                                size="lg"
                                className="mt-5 w-full justify-center"
                                onClick={handleUpload}
                                disabled={!selectedFile || uploading}
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Upload Resume
                                    </>
                                )}
                            </Button>
                        </GlassCard>
                    </div>

                    {/* Resume List */}
                    <div className="lg:col-span-2">
                        <GlassCard className="border border-white/10 p-6">
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold">
                                        Your Resumes
                                    </h2>
                                    <p className="mt-1 text-sm text-gray-400">
                                        Resumes uploaded to your MockMate
                                        account.
                                    </p>
                                </div>

                                <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400">
                                    {resumes.length}{" "}
                                    {resumes.length === 1
                                        ? "resume"
                                        : "resumes"}
                                </span>
                            </div>

                            {loading ? (
                                <div className="flex min-h-[220px] items-center justify-center">
                                    <Loader2 className="h-7 w-7 animate-spin text-indigo-400" />
                                </div>
                            ) : resumes.length === 0 ? (
                                <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-6 text-center">
                                    <FileText className="mb-4 h-10 w-10 text-gray-600" />
                                    <h3 className="font-medium text-gray-300">
                                        No resume uploaded yet
                                    </h3>
                                    <p className="mt-2 max-w-md text-sm text-gray-500">
                                        Upload your resume to unlock
                                        personalized interview questions and
                                        resume-based practice.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {resumes.map((resume) => (
                                        <div
                                            key={resume.id}
                                            className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4"
                                        >
                                            <div className="flex min-w-0 items-center gap-4">
                                                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                                                    <FileText className="h-5 w-5" />
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="truncate font-medium text-white">
                                                        {resume.file_name}
                                                    </p>

                                                    <p className="mt-1 text-xs text-gray-500">
                                                        Uploaded{" "}
                                                        {new Date(
                                                            resume.created_at
                                                        ).toLocaleDateString()}
                                                    </p>

                                                    <p className="mt-1 text-xs text-gray-500">
                                                        {resume.character_count.toLocaleString()}{" "}
                                                        characters extracted
                                                    </p>
                                                </div>
                                            </div>

                                            <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-400" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </GlassCard>
                    </div>
                </div>
            </main>
        </div>
    );
}