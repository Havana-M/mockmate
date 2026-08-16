"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Upload,
    FileText,
    CheckCircle2,
    AlertCircle,
    Loader2,
} from "lucide-react";

import { Navbar } from "@/components/Navbar";
import { GlassCard } from "@/components/Glasscard";
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

            const authToken =
                localStorage.getItem("mockmate_token");

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
                throw new Error(
                    data.detail || "Failed to load resumes"
                );
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

            const authToken =
                localStorage.getItem("mockmate_token");

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
                throw new Error(
                    data.detail || "Resume upload failed"
                );
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
        <div className="min-h-screen bg-white text-slate-900">
            <Navbar />

            <main className="mx-auto max-w-6xl px-6 py-10">

                {/* ============================= */}
                {/* PAGE HEADER */}
                {/* ============================= */}

                <div className="mb-8 border-b border-slate-200 pb-6">
                    <h1 className="text-3xl font-bold tracking-tight text-[#0F172A]">
                        My Resume
                    </h1>

                    <p className="mt-2 text-sm text-[#60748F]">
                        Upload your resume so MockMate can personalize
                        your interview questions and feedback.
                    </p>
                </div>

                {/* ============================= */}
                {/* ERROR */}
                {/* ============================= */}

                {error && (
                    <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* ============================= */}
                {/* SUCCESS */}
                {/* ============================= */}

                {success && (
                    <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-600">
                        <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                        <span>{success}</span>
                    </div>
                )}

                {/* ============================= */}
                {/* MAIN GRID */}
                {/* ============================= */}

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

                    {/* ================================= */}
                    {/* UPLOAD RESUME CARD */}
                    {/* ================================= */}

                    <div className="lg:col-span-1">

                        <GlassCard className="p-6">

                            {/* CARD HEADER */}

                            <div className="mb-6 flex items-center gap-3">

                                <div
                                    className="
                                        flex h-11 w-11
                                        items-center justify-center
                                        rounded-xl
                                        bg-[#1B2A44]
                                        border border-[#31445F]
                                        text-white
                                    "
                                >
                                    <Upload className="h-5 w-5" />
                                </div>

                                <div>
                                    <h2 className="font-semibold text-white">
                                        Upload Resume
                                    </h2>

                                    <p className="text-xs text-[#8FA8C8]">
                                        PDF format only
                                    </p>
                                </div>

                            </div>

                            {/* HIDDEN FILE INPUT */}

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,application/pdf"
                                onChange={handleFileChange}
                                className="hidden"
                            />

                            {/* FILE SELECTOR */}

                            <button
                                type="button"
                                onClick={() =>
                                    fileInputRef.current?.click()
                                }
                                className="
                                    group
                                    w-full
                                    rounded-xl
                                    border
                                    border-dashed
                                    border-[#3A4D6A]
                                    bg-[#162238]
                                    p-8
                                    text-center

                                    transition-all duration-300

                                    hover:border-[#6B83A3]
                                    hover:bg-[#1A2940]
                                    hover:shadow-[0_8px_24px_rgba(15,23,42,0.25)]
                                "
                            >

                                <FileText
                                    className="
                                        mx-auto
                                        mb-3
                                        h-10
                                        w-10
                                        text-[#8FA8C8]
                                        transition-all
                                        duration-300
                                        group-hover:text-white
                                    "
                                />

                                <p className="text-sm font-medium text-white">
                                    {selectedFile
                                        ? selectedFile.name
                                        : "Choose your resume"}
                                </p>

                                <p className="mt-2 text-xs text-[#8FA8C8]">
                                    Click to browse your files
                                </p>

                            </button>

                            {/* SELECTED FILE */}

                            {selectedFile && (
                                <div
                                    className="
                                        mt-4
                                        rounded-xl
                                        border
                                        border-[#2D405D]
                                        bg-[#162238]
                                        p-4
                                    "
                                >
                                    <p className="truncate text-sm font-medium text-white">
                                        {selectedFile.name}
                                    </p>

                                    <p className="mt-1 text-xs text-[#8FA8C8]">
                                        {(
                                            selectedFile.size /
                                            1024 /
                                            1024
                                        ).toFixed(2)}{" "}
                                        MB
                                    </p>
                                </div>
                            )}

                            {/* UPLOAD BUTTON */}

                            <button
                                type="button"
                                onClick={handleUpload}
                                disabled={!selectedFile || uploading}
                                className="
                                    mt-5
                                    flex
                                    w-full
                                    items-center
                                    justify-center
                                    rounded-xl
                                    border
                                    border-[#31445F]
                                    bg-[#1B2A44]
                                    px-5
                                    py-3
                                    font-semibold
                                    text-white

                                    transition-all
                                    duration-300

                                    hover:-translate-y-0.5
                                    hover:bg-[#243650]
                                    hover:border-[#4A607E]
                                    hover:shadow-[0_8px_24px_rgba(15,23,42,0.3)]

                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                    disabled:hover:translate-y-0
                                    disabled:hover:bg-[#1B2A44]
                                    disabled:hover:shadow-none
                                "
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
                            </button>

                        </GlassCard>

                    </div>

                    {/* ================================= */}
                    {/* RESUME LIST CARD */}
                    {/* ================================= */}

                    <div className="lg:col-span-2">

                        <GlassCard className="p-6">

                            {/* HEADER */}

                            <div className="mb-6 flex items-center justify-between">

                                <div>
                                    <h2 className="text-xl font-semibold text-white">
                                        Your Resumes
                                    </h2>

                                    <p className="mt-1 text-sm text-[#8FA8C8]">
                                        Resumes uploaded to your MockMate
                                        account.
                                    </p>
                                </div>

                                <span
                                    className="
                                        rounded-full
                                        border
                                        border-[#31445F]
                                        bg-[#1B2A44]
                                        px-3
                                        py-1
                                        text-xs
                                        font-semibold
                                        text-white
                                    "
                                >
                                    {resumes.length}{" "}
                                    {resumes.length === 1
                                        ? "resume"
                                        : "resumes"}
                                </span>

                            </div>

                            {/* LOADING */}

                            {loading ? (

                                <div className="flex min-h-[220px] items-center justify-center">

                                    <Loader2
                                        className="
                                            h-7
                                            w-7
                                            animate-spin
                                            text-[#8FA8C8]
                                        "
                                    />

                                </div>

                            ) : resumes.length === 0 ? (

                                /* EMPTY STATE */

                                <div
                                    className="
                                        flex
                                        min-h-[220px]
                                        flex-col
                                        items-center
                                        justify-center
                                        rounded-xl
                                        border
                                        border-dashed
                                        border-[#3A4D6A]
                                        bg-[#162238]
                                        px-6
                                        text-center
                                    "
                                >

                                    <FileText
                                        className="
                                            mb-4
                                            h-10
                                            w-10
                                            text-[#8FA8C8]
                                        "
                                    />

                                    <h3 className="font-medium text-white">
                                        No resume uploaded yet
                                    </h3>

                                    <p className="mt-2 max-w-md text-sm text-[#8FA8C8]">
                                        Upload your resume to unlock
                                        personalized interview questions
                                        and resume-based practice.
                                    </p>

                                </div>

                            ) : (

                                /* RESUME ITEMS */

                                <div className="space-y-4">

                                    {resumes.map((resume) => (

                                        <div
                                            key={resume.id}
                                            className="
                                                group
                                                flex
                                                items-center
                                                justify-between
                                                gap-4
                                                rounded-xl
                                                border
                                                border-[#2D405D]
                                                bg-[#162238]
                                                p-4

                                                transition-all
                                                duration-300

                                                hover:-translate-y-0.5
                                                hover:border-[#4A607E]
                                                hover:bg-[#1A2940]
                                                hover:shadow-[0_8px_24px_rgba(15,23,42,0.22)]
                                            "
                                        >

                                            {/* FILE INFO */}

                                            <div className="flex min-w-0 items-center gap-4">

                                                {/* FILE ICON */}

                                                <div
                                                    className="
                                                        flex
                                                        h-11
                                                        w-11
                                                        flex-shrink-0
                                                        items-center
                                                        justify-center
                                                        rounded-xl
                                                        border
                                                        border-[#31445F]
                                                        bg-[#0F172A]
                                                        text-white
                                                    "
                                                >
                                                    <FileText className="h-5 w-5" />
                                                </div>

                                                {/* FILE DETAILS */}

                                                <div className="min-w-0">

                                                    <p className="truncate font-medium text-white">
                                                        {resume.file_name}
                                                    </p>

                                                    <p className="mt-1 text-xs text-[#8FA8C8]">
                                                        Uploaded{" "}
                                                        {new Date(
                                                            resume.created_at
                                                        ).toLocaleDateString()}
                                                    </p>

                                                    <p className="mt-1 text-xs text-[#8FA8C8]">
                                                        {resume.character_count.toLocaleString()}{" "}
                                                        characters extracted
                                                    </p>

                                                </div>

                                            </div>

                                            {/* SUCCESS ICON */}

                                            <CheckCircle2
                                                className="
                                                    h-5
                                                    w-5
                                                    flex-shrink-0
                                                    text-emerald-400
                                                "
                                            />

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