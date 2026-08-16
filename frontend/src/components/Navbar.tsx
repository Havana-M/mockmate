"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "./Button";
import {
    Bot,
    Sparkles,
    LogOut,
    LayoutDashboard,
} from "lucide-react";

export function Navbar() {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("mockmate_token");
        setIsLoggedIn(!!token);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("mockmate_token");
        localStorage.removeItem("mockmate_user");
        setIsLoggedIn(false);
        router.push("/login");
    };

    return (
        <header
            className="
                w-full
                border-b border-[#24324A]
                bg-[#0F172A]
                sticky top-0
                z-50
                transition-all duration-300
            "
        >
            <div className="container mx-auto px-6 h-20 flex items-center justify-between">

                {/* ==================== BRAND ==================== */}
                <Link
                    href="/"
                    className="flex items-center gap-3 group"
                >
                    {/* Logo */}
                    <div
                        className="
                            w-10 h-10
                            rounded-xl
                            bg-[#1B2A44]
                            border border-[#31445F]
                            flex items-center justify-center
                            shadow-[0_4px_14px_rgba(15,23,42,0.35)]
                            group-hover:bg-[#243650]
                            group-hover:border-[#4A607E]
                            group-hover:shadow-[0_6px_18px_rgba(15,23,42,0.45)]
                            group-hover:scale-105
                            transition-all duration-300
                        "
                    >
                        <Bot className="w-5 h-5 text-white" />
                    </div>

                    {/* Brand Text */}
                    <div className="flex flex-col">
                        <span
                            className="
                                font-extrabold
                                text-xl
                                tracking-tight
                                text-white
                                flex items-center gap-1
                            "
                        >
                            Mock
                            <span className="text-[#8FA8C8]">
                                Mate
                            </span>
                        </span>

                        <span
                            className="
                                text-[10px]
                                uppercase
                                tracking-widest
                                text-[#7F95B2]
                                font-semibold
                                -mt-1
                            "
                        >
                            AI Interviewer
                        </span>
                    </div>
                </Link>

                {/* ==================== NAVIGATION ==================== */}
                <nav
                    className="
                        hidden md:flex
                        items-center gap-8
                        text-sm
                        font-medium
                        text-[#B4C0D1]
                    "
                >
                    {/* Dashboard */}
                    <Link
                        href="/dashboard"
                        className="
                            flex items-center gap-1.5
                            hover:text-white
                            transition-colors duration-200
                        "
                    >
                        <LayoutDashboard
                            className="
                                w-4 h-4
                                text-[#8FA8C8]
                            "
                        />
                        Dashboard
                    </Link>

                    {/* Features */}
                    <a
                        href="#features"
                        className="
                            hover:text-white
                            transition-colors duration-200
                        "
                    >
                        Features
                    </a>

                    {/* API Docs */}
                    <a
                        href="http://localhost:8000/docs"
                        target="_blank"
                        rel="noreferrer"
                        className="
                            hover:text-white
                            transition-colors duration-200
                        "
                    >
                        API Docs
                    </a>
                </nav>

                {/* ==================== ACTIONS ==================== */}
                <div className="flex items-center gap-4">

                    {isLoggedIn ? (
                        <div className="flex items-center gap-3">

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleLogout}
                                className="
                                    flex items-center gap-2
                                    border-[#334968]
                                    text-[#B4C0D1]
                                    bg-transparent
                                    hover:bg-[#1B2A44]
                                    hover:text-white
                                    hover:border-[#4A607E]
                                    transition-all duration-200
                                "
                            >
                                <LogOut
                                    className="
                                        w-4 h-4
                                        text-[#8FA8C8]
                                    "
                                />

                                <span>
                                    Sign Out
                                </span>
                            </Button>

                        </div>
                    ) : (
                        <div className="flex items-center gap-3">

                            {/* Sign In */}
                            <Link href="/login">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="
                                        text-[#B4C0D1]
                                        hover:text-white
                                        hover:bg-[#1B2A44]
                                        transition-all duration-200
                                    "
                                >
                                    Sign In
                                </Button>
                            </Link>

                            {/* Get Started */}
                            <Link href="/signup">
                                <Button
                                    variant="primary"
                                    size="sm"
                                    className="
                                        bg-[#1B2A44]
                                        text-white
                                        border border-[#334968]
                                        shadow-[0_4px_14px_rgba(15,23,42,0.25)]
                                        hover:bg-[#243650]
                                        hover:border-[#4A607E]
                                        hover:shadow-[0_6px_20px_rgba(15,23,42,0.35)]
                                        transition-all duration-300
                                    "
                                >
                                    <Sparkles
                                        className="w-4 h-4 mr-1.5"
                                    />

                                    Get Started
                                </Button>
                            </Link>

                        </div>
                    )}

                </div>
            </div>
        </header>
    );
}