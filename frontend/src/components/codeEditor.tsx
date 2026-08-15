"use client";

import React from "react";
import Editor from "@monaco-editor/react";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/Button";
import { Code2, Play, CheckCircle2, RotateCcw } from "lucide-react";

interface CodeEditorProps {
    language: string;
    code: string;
    onChange: (value: string | undefined) => void;
    onRunCode?: () => void;
    onLanguageChange?: (lang: string) => void;
    isRunning?: boolean;
}

export function CodeEditor({
    language = "python",
    code,
    onChange,
    onRunCode,
    onLanguageChange,
    isRunning = false,
}: CodeEditorProps) {
    return (
        <GlassCard className="p-0 border border-white/10 overflow-hidden flex flex-col h-full">
            {/* Editor Header Bar */}
            <div className="px-6 py-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Code2 className="w-5 h-5 text-indigo-400" />
                    <span className="font-semibold text-sm text-gray-200">Interactive Code Sandbox</span>
                </div>

                <div className="flex items-center gap-3">
                    {/* Language Selector */}
                    <select
                        value={language}
                        onChange={(e) => onLanguageChange && onLanguageChange(e.target.value)}
                        className="bg-[#0f172a] text-gray-200 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-indigo-500"
                    >
                        <option value="python">Python 3</option>
                        <option value="javascript">JavaScript (Node.js)</option>
                        <option value="cpp">C++ (GCC)</option>
                    </select>

                    {/* Run Code Button */}
                    {onRunCode && (
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={onRunCode}
                            disabled={isRunning}
                            className="flex items-center gap-2 text-xs py-1.5"
                        >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>{isRunning ? "Running..." : "Run Code"}</span>
                        </Button>
                    )}
                </div>
            </div>

            {/* Monaco Editor Instance */}
            <div className="flex-1 min-h-[350px] bg-[#090d16]">
                <Editor
                    height="100%"
                    language={language}
                    theme="vs-dark"
                    value={code}
                    onChange={onChange}
                    options={{
                        fontSize: 14,
                        fontFamily: "'Fira Code', 'Courier New', monospace",
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 4,
                        padding: { top: 16, bottom: 16 },
                        lineNumbersMinChars: 3,
                    }}
                />
            </div>
        </GlassCard>
    );
}
