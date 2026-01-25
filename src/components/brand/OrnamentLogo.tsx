import React from 'react';
import { cn } from "@/lib/utils";

interface OrnamentLogoProps {
    className?: string;
}

export default function OrnamentLogo({ className }: OrnamentLogoProps) {
    return (
        <div className={cn("relative flex items-center justify-center group cursor-pointer transition-all duration-700 hover:scale-105", className)}>
            {/* Soft Glow on Hover */}
            <div className="absolute inset-0 bg-[#B08D57]/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

            <svg className="w-full h-full text-[#B08D57]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Complex Indian Mandala Pattern - Gold & Subtle */}
                <g className="opacity-60">
                    {/* Outer decorative ring */}
                    <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 3" />
                    <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="0.3" />

                    {/* Paisley/Leaf motifs */}
                    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                        <g key={i} transform={`rotate(${angle} 50 50)`}>
                            <path
                                d="M50 15 Q55 25 50 35 Q45 25 50 15"
                                stroke="currentColor"
                                strokeWidth="0.5"
                                fill="none"
                            />
                            <circle cx="50" cy="12" r="1.5" fill="currentColor" />
                        </g>
                    ))}

                    {/* Inner Diamond Shape */}
                    <rect x="35" y="35" width="30" height="30" transform="rotate(45 50 50)" stroke="currentColor" strokeWidth="0.5" />
                </g>

                {/* Center Monogram - BIG & BLACK */}
                <text x="50" y="65" textAnchor="middle" fill="#000000" fontFamily="serif" fontSize="45" fontWeight="bold" letterSpacing="-0.02em" className="drop-shadow-sm">
                    SS
                </text>
            </svg>
        </div>
    );
}
