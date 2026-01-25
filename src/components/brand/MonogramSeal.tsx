import React from 'react';
import { cn } from "@/lib/utils";

interface MonogramSealProps {
    className?: string;
}

export default function MonogramSeal({ className }: MonogramSealProps) {
    return (
        <div className={cn("relative w-24 h-24 flex items-center justify-center rounded-full border border-[#B08D57]/40 bg-[#FAF7F2]/10 backdrop-blur-sm group cursor-pointer transition-all duration-700 hover:shadow-[0_0_15px_rgba(176,141,87,0.3)] hover:border-[#B08D57]/80 opacity-80 hover:opacity-100", className)}>
            {/* Rotating Text Ring */}
            <svg className="absolute w-full h-full text-[#B08D57] animate-spin-slow-reverse group-hover:animation-pause" viewBox="0 0 100 100">
                <path id="curve" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="transparent" />
                <text className="text-[8.5px] uppercase font-medium tracking-[0.24em] fill-current">
                    <textPath href="#curve" startOffset="50%" textAnchor="middle">
                        Shyamala Sarees • Est. 2012 •
                    </textPath>
                </text>
            </svg>

            {/* Center Monogram */}
            <div className="relative z-10 flex flex-col items-center justify-center pt-1">
                <span className="font-heading text-2xl text-[#B08D57] font-bold tracking-widest leading-none group-hover:scale-105 transition-transform duration-700">SS</span>
            </div>
        </div>
    );
}
