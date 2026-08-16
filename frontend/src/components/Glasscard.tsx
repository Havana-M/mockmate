import React from "react";

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
}

export function GlassCard({
    children,
    className = "",
}: GlassCardProps) {
    return (
        <div
            className={`
                rounded-2xl
                border border-[#263650]
                bg-[#0F172A]
                shadow-[0_6px_20px_rgba(15,23,42,0.12)]
                transition-all duration-300 ease-out

                hover:-translate-y-1
                hover:border-[#3A4D6A]
                hover:shadow-[0_12px_30px_rgba(15,23,42,0.22)]

                ${className}
            `}
        >
            {children}
        </div>
    );
}