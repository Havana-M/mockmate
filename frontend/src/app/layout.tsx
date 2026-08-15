import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MockMate — AI Mock Interview & Career Readiness Engine",
  description:
    "Master technical and behavioral interviews with real-time AI feedback, RAG resume analysis, voice recognition, and interactive code execution.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#090d16] text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
