import React from 'react';
import { cn } from "@/lib/utils";

interface ShyamalaLogoMarkProps {
    className?: string;
}

export default function ShyamalaLogoMark({ className }: ShyamalaLogoMarkProps) {
    return (
        <div className={cn("relative w-20 h-20 md:w-24 md:h-24 flex items-center justify-center group cursor-pointer transition-all duration-700 hover:scale-110", className)}>
            {/* Glow Effect on Hover */}
            <div className="absolute inset-0 bg-[#B08D57]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

            <svg className="w-full h-full text-[#B08D57]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Outer Delicate Ring */}
                <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="0.5" className="opacity-50" />
                <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 3" className="opacity-70" />

                {/* Ornamental Mandala Petals (8 points) */}
                <g className="origin-center animate-spin-slow-reverse group-hover:animation-pause">
                    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                        <path
                            key={i}
                            d="M50 10 Q55 25 50 40 Q45 25 50 10"
                            stroke="currentColor"
                            strokeWidth="0.8"
                            fill={i % 2 === 0 ? "currentColor" : "none"}
                            fillOpacity={i % 2 === 0 ? "0.1" : "0"}
                            transform={`rotate(${angle} 50 50)`}
                        />
                    ))}
                </g>

                {/* Inner Circle fit for Monogram */}
                <circle cx="50" cy="50" r="18" stroke="currentColor" strokeWidth="1" />

                {/* Monogram SS */}
                <text x="50" y="58" textAnchor="middle" fill="currentColor" fontFamily="serif" fontSize="24" fontWeight="bold" letterSpacing="0">
                    SS
                </text>
            </svg>
        </div>
    );
}
