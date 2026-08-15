"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "./Button";
import { Bot, Sparkles, User, LogOut, LayoutDashboard } from "lucide-react";

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
        <header className="w-full border-b border-white/10 bg-[#090d16]/80 backdrop-blur-xl sticky top-0 z-50 transition-all duration-300">
            <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                {/* Brand Logo */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-300">
                        <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1">
                            Mock<span className="gradient-text">Mate</span>
                        </span>
                        <span className="text-[10px] uppercase tracking-widest text-indigo-400 font-semibold -mt-1">
                            AI Interviewer
                        </span>
                    </div>
                </Link>

                {/* Navigation Links */}
                <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
                    <Link href="/dashboard" className="hover:text-white transition-colors flex items-center gap-1.5">
                        <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                        Dashboard
                    </Link>
                    <a href="#features" className="hover:text-white transition-colors">
                        Features
                    </a>
                    <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                        API Docs
                    </a>
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    {isLoggedIn ? (
                        <div className="flex items-center gap-3">
                            <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-2">
                                <LogOut className="w-4 h-4 text-red-400" />
                                <span>Sign Out</span>
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link href="/login">
                                <Button variant="ghost" size="sm">
                                    Sign In
                                </Button>
                            </Link>
                            <Link href="/signup">
                                <Button variant="primary" size="sm" className="shadow-lg shadow-indigo-500/20">
                                    <Sparkles className="w-4 h-4 mr-1.5" />
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
