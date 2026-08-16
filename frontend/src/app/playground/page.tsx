"use client";

import { useState } from "react";
import {
    Play,
    RotateCcw,
    Copy,
    Check,
    Code2,
    Terminal,
    Loader2,
    Eye,
} from "lucide-react";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Language =
    | "python"
    | "cpp"
    | "java"
    | "javascript"
    | "web";

const languageLabels: Record<Language, string> = {
    python: "Python",
    cpp: "C++",
    java: "Java",
    javascript: "JavaScript",
    web: "Web Development",
};

const starterCode: Record<Exclude<Language, "web">, string> = {
    python: `name = input("Enter your name: ")

print("Hello,", name)
`,

    cpp: `#include <iostream>
using namespace std;

int main() {
    string name;
    cin >> name;

    cout << "Hello, " << name << endl;

    return 0;
}`,

    java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        String name = scanner.nextLine();

        System.out.println("Hello, " + name);
    }
}`,

    javascript: `const name = "MockMate";

console.log("Hello, " + name);`,
};

const starterHTML = `<div class="container">
  <h1>Hello, MockMate!</h1>
  <p>Start building your webpage here.</p>
  <button onclick="showMessage()">
    Click Me
  </button>
</div>`;

const starterCSS = `body {
  margin: 0;
  font-family: Arial, sans-serif;
  background: #f5f7fb;
}

.container {
  text-align: center;
  padding: 60px;
}

h1 {
  color: #0f172a;
}

p {
  color: #64748b;
}

button {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  background: #0f172a;
  color: white;
  cursor: pointer;
}`;

const starterJS = `function showMessage() {
  alert("Hello from MockMate!");
}`;

export default function CodePlaygroundPage() {
    const [language, setLanguage] = useState<Language>("python");

    const [code, setCode] = useState(starterCode.python);

    const [input, setInput] = useState("");

    const [output, setOutput] = useState("");

    const [status, setStatus] = useState("");

    const [isRunning, setIsRunning] = useState(false);

    const [copied, setCopied] = useState(false);

    const [htmlCode, setHtmlCode] = useState(starterHTML);

    const [cssCode, setCssCode] = useState(starterCSS);

    const [jsCode, setJsCode] = useState(starterJS);

    const handleLanguageChange = (
        newLanguage: Language
    ) => {
        setLanguage(newLanguage);

        setOutput("");
        setStatus("");
        setInput("");

        if (newLanguage !== "web") {
            setCode(starterCode[newLanguage]);
        }
    };

    const runCode = async () => {
        if (language === "web") {
            setStatus("success");
            setOutput("Live preview updated.");
            return;
        }

        setIsRunning(true);
        setOutput("");
        setStatus("");

        try {
            const token = localStorage.getItem("mockmate_token");

            const response = await fetch(
                `${API_BASE_URL}/api/code/run`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",

                        ...(token
                            ? {
                                Authorization: `Bearer ${token}`,
                            }
                            : {}),
                    },

                    body: JSON.stringify({
                        code,
                        language,
                        stdin: input,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.detail ||
                    "Failed to execute the code."
                );
            }

            setOutput(
                data.output ||
                "Code executed successfully with no output."
            );

            setStatus(data.status || "success");
        } catch (error) {
            setStatus("error");

            setOutput(
                error instanceof Error
                    ? error.message
                    : "Something went wrong while running the code."
            );
        } finally {
            setIsRunning(false);
        }
    };

    const resetCode = () => {
        setOutput("");
        setStatus("");
        setInput("");

        if (language === "web") {
            setHtmlCode(starterHTML);
            setCssCode(starterCSS);
            setJsCode(starterJS);
        } else {
            setCode(starterCode[language]);
        }
    };

    const copyCode = async () => {
        if (language === "web") {
            await navigator.clipboard.writeText(
                `${htmlCode}\n\n${cssCode}\n\n${jsCode}`
            );
        } else {
            await navigator.clipboard.writeText(code);
        }

        setCopied(true);

        setTimeout(() => {
            setCopied(false);
        }, 1500);
    };

    const previewDocument = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
${cssCode}
</style>
</head>
<body>

${htmlCode}

<script>
${jsCode}
</script>

</body>
</html>
`;

    return (
        <div className="min-h-screen bg-[#f8fafc] text-[#0f172a]">

            {/* ================= HEADER ================= */}

            <header className="border-b border-[#dbe3ee] bg-[#0f172a]">
                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

                    <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#29466b] bg-[#16243b]">
                            <Code2 className="h-5 w-5 text-white" />
                        </div>

                        <div>
                            <h1 className="text-xl font-extrabold tracking-tight text-white">
                                Code Playground
                            </h1>

                            <p className="text-xs tracking-wide text-[#8fa6c4]">
                                PRACTICE • RUN • LEARN
                            </p>
                        </div>

                    </div>

                    {/* LANGUAGE SELECTOR */}

                    <select
                        value={language}
                        onChange={(e) =>
                            handleLanguageChange(
                                e.target.value as Language
                            )
                        }
                        className="rounded-xl border border-[#334b6c] bg-[#16243b] px-4 py-3 text-sm font-medium text-white outline-none transition focus:border-[#6b85a8]"
                    >
                        <option value="python">
                            Python
                        </option>

                        <option value="cpp">
                            C++
                        </option>

                        <option value="java">
                            Java
                        </option>

                        <option value="javascript">
                            JavaScript
                        </option>

                        <option value="web">
                            Web Development
                        </option>
                    </select>

                </div>
            </header>

            {/* ================= MAIN ================= */}

            <main className="mx-auto max-w-7xl px-6 py-8">

                {/* PAGE TITLE */}

                <div className="mb-7">

                    <p className="mb-2 text-sm font-medium text-[#5f7898]">
                        Practice your coding skills
                    </p>

                    <h2 className="text-3xl font-bold text-[#0f172a]">
                        {language === "web"
                            ? "Build for the Web"
                            : `Practice ${languageLabels[language]}`}
                    </h2>

                    <p className="mt-2 text-[#64748b]">
                        {language === "web"
                            ? "Write HTML, CSS and JavaScript together and preview your webpage instantly."
                            : "Write code, provide input, run your program and see the output."}
                    </p>

                </div>

                {/* ================= WEB DEVELOPMENT ================= */}

                {language === "web" ? (

                    <div className="space-y-6">

                        <div className="grid gap-6 lg:grid-cols-3">

                            {/* HTML */}

                            <EditorCard
                                title="HTML"
                                code={htmlCode}
                                onChange={setHtmlCode}
                                language="html"
                            />

                            {/* CSS */}

                            <EditorCard
                                title="CSS"
                                code={cssCode}
                                onChange={setCssCode}
                                language="css"
                            />

                            {/* JAVASCRIPT */}

                            <EditorCard
                                title="JavaScript"
                                code={jsCode}
                                onChange={setJsCode}
                                language="javascript"
                            />

                        </div>

                        {/* WEB ACTIONS */}

                        <div className="flex justify-end gap-3">

                            <button
                                onClick={resetCode}
                                className="flex items-center gap-2 rounded-xl border border-[#cbd8e8] bg-white px-5 py-3 font-semibold text-[#334155] transition hover:border-[#17345b] hover:bg-[#f8fafc]"
                            >
                                <RotateCcw className="h-5 w-5" />
                                Reset
                            </button>

                            <button
                                onClick={runCode}
                                className="flex items-center gap-2 rounded-xl bg-[#0f172a] px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-[#16243b]"
                            >
                                <Play className="h-5 w-5" />
                                Run Preview
                            </button>

                        </div>

                        {/* LIVE PREVIEW */}

                        <section className="overflow-hidden rounded-2xl border border-[#cbd8e8] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.08)]">

                            <div className="flex items-center justify-between border-b border-[#dbe3ee] bg-[#f8fafc] px-5 py-4">

                                <div className="flex items-center gap-2">

                                    <Eye className="h-5 w-5 text-[#17345b]" />

                                    <span className="font-semibold text-[#0f172a]">
                                        Live Preview
                                    </span>

                                </div>

                                <span className="text-xs text-[#64748b]">
                                    HTML + CSS + JavaScript
                                </span>

                            </div>

                            <div className="bg-white p-2">

                                <iframe
                                    title="Web Development Preview"
                                    srcDoc={previewDocument}
                                    sandbox="allow-scripts"
                                    className="h-[500px] w-full rounded-xl border border-[#dbe3ee] bg-white"
                                />

                            </div>

                        </section>

                    </div>

                ) : (

                    /* ================= PROGRAMMING ================= */

                    <div className="grid gap-6 lg:grid-cols-2">

                        {/* CODE EDITOR */}

                        <section className="overflow-hidden rounded-2xl border border-[#cbd8e8] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.08)]">

                            <div className="flex items-center justify-between border-b border-[#dbe3ee] bg-[#f8fafc] px-5 py-4">

                                <div className="flex items-center gap-2">

                                    <Code2 className="h-5 w-5 text-[#17345b]" />

                                    <span className="font-semibold text-[#0f172a]">
                                        {languageLabels[language]} Editor
                                    </span>

                                </div>

                                <button
                                    onClick={copyCode}
                                    className="flex items-center gap-2 rounded-lg border border-[#d5dfeb] px-3 py-2 text-sm font-medium text-[#334155] transition hover:border-[#17345b] hover:bg-[#f1f5f9]"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="h-4 w-4" />
                                            Copied
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-4 w-4" />
                                            Copy
                                        </>
                                    )}
                                </button>

                            </div>

                            <div className="p-4">

                                <textarea
                                    value={code}
                                    onChange={(e) =>
                                        setCode(e.target.value)
                                    }
                                    spellCheck={false}
                                    className="min-h-[480px] w-full resize-none rounded-xl border border-[#cbd8e8] bg-[#0f172a] p-5 font-mono text-sm leading-6 text-[#e2e8f0] outline-none transition focus:border-[#294f7d] focus:ring-2 focus:ring-[#294f7d]/20"
                                    placeholder={`Write your ${languageLabels[language]} code here...`}
                                />

                                {/* INPUT */}

                                <div className="mt-4">

                                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#334155]">
                                        <Terminal className="h-4 w-4 text-[#17345b]" />
                                        Input
                                    </label>

                                    <textarea
                                        value={input}
                                        onChange={(e) =>
                                            setInput(e.target.value)
                                        }
                                        placeholder="Enter program input here..."
                                        className="min-h-[100px] w-full resize-y rounded-xl border border-[#cbd8e8] bg-[#f8fafc] p-4 font-mono text-sm text-[#334155] outline-none transition focus:border-[#17345b] focus:ring-2 focus:ring-[#17345b]/10"
                                    />

                                </div>

                                {/* BUTTONS */}

                                <div className="mt-4 flex gap-3">

                                    <button
                                        onClick={runCode}
                                        disabled={
                                            isRunning ||
                                            !code.trim()
                                        }
                                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0f172a] px-5 py-3 font-semibold text-white shadow-lg transition hover:bg-[#16243b] disabled:cursor-not-allowed disabled:opacity-50"
                                    >

                                        {isRunning ? (
                                            <>
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                Running...
                                            </>
                                        ) : (
                                            <>
                                                <Play className="h-5 w-5" />
                                                Run Code
                                            </>
                                        )}

                                    </button>

                                    <button
                                        onClick={resetCode}
                                        className="flex items-center justify-center gap-2 rounded-xl border border-[#cbd8e8] bg-white px-5 py-3 font-semibold text-[#334155] transition hover:border-[#17345b] hover:bg-[#f8fafc]"
                                    >
                                        <RotateCcw className="h-5 w-5" />
                                        Reset
                                    </button>

                                </div>

                            </div>

                        </section>

                        {/* OUTPUT */}

                        <section className="overflow-hidden rounded-2xl border border-[#cbd8e8] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.08)]">

                            <div className="flex items-center justify-between border-b border-[#dbe3ee] bg-[#f8fafc] px-5 py-4">

                                <div className="flex items-center gap-2">

                                    <Terminal className="h-5 w-5 text-[#17345b]" />

                                    <span className="font-semibold text-[#0f172a]">
                                        Output
                                    </span>

                                </div>

                                {status && (
                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${status === "success"
                                                ? "bg-[#e7f7ef] text-[#087443]"
                                                : "bg-[#feecec] text-[#b42318]"
                                            }`}
                                    >
                                        {status === "success"
                                            ? "Success"
                                            : "Error"}
                                    </span>
                                )}

                            </div>

                            <div className="p-4">

                                <div className="min-h-[480px] rounded-xl border border-[#cbd8e8] bg-[#0f172a] p-5 font-mono text-sm leading-6 text-[#dbeafe]">

                                    {output ? (
                                        <pre className="whitespace-pre-wrap break-words">
                                            {output}
                                        </pre>
                                    ) : (
                                        <div className="flex h-[440px] items-center justify-center text-center text-[#64748b]">

                                            <div>

                                                <Terminal className="mx-auto mb-3 h-10 w-10 text-[#334155]" />

                                                <p className="font-medium text-[#94a3b8]">
                                                    Output will appear here
                                                </p>

                                                <p className="mt-1 text-xs text-[#64748b]">
                                                    Enter your input and click Run Code.
                                                </p>

                                            </div>

                                        </div>
                                    )}

                                </div>

                            </div>

                        </section>

                    </div>
                )}

                {/* INFO */}

                <div className="mt-6 rounded-2xl border border-[#cbd8e8] bg-white p-5 shadow-[0_8px_25px_rgba(15,23,42,0.05)]">

                    <div className="flex items-start gap-3">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#eaf0f8]">
                            <Code2 className="h-5 w-5 text-[#17345b]" />
                        </div>

                        <div>

                            <h3 className="font-semibold text-[#0f172a]">
                                Practice Mode
                            </h3>

                            <p className="mt-1 text-sm leading-6 text-[#64748b]">
                                Practice programming with input and output,
                                or switch to Web Development to build HTML,
                                CSS and JavaScript with a live preview.
                            </p>

                        </div>

                    </div>

                </div>

            </main>
        </div>
    );
}

/* =====================================================
   WEB DEVELOPMENT EDITOR
===================================================== */

interface EditorCardProps {
    title: string;
    code: string;
    onChange: (value: string) => void;
    language: string;
}

function EditorCard({
    title,
    code,
    onChange,
    language,
}: EditorCardProps) {
    return (
        <section className="overflow-hidden rounded-2xl border border-[#cbd8e8] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.08)]">

            <div className="flex items-center justify-between border-b border-[#dbe3ee] bg-[#f8fafc] px-4 py-3">

                <div className="flex items-center gap-2">

                    <Code2 className="h-4 w-4 text-[#17345b]" />

                    <span className="text-sm font-semibold text-[#0f172a]">
                        {title}
                    </span>

                </div>

                <span className="text-[11px] uppercase tracking-wider text-[#71839d]">
                    {language}
                </span>

            </div>

            <div className="p-3">

                <textarea
                    value={code}
                    onChange={(e) =>
                        onChange(e.target.value)
                    }
                    spellCheck={false}
                    className="min-h-[360px] w-full resize-none rounded-xl border border-[#cbd8e8] bg-[#0f172a] p-4 font-mono text-xs leading-6 text-[#e2e8f0] outline-none transition focus:border-[#294f7d] focus:ring-2 focus:ring-[#294f7d]/20"
                />

            </div>

        </section>
    );
}