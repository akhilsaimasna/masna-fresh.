"use client";

import React from "react";
import { cn } from "@/lib/utils";

type AspectRatio = "video" | "portrait" | "square" | "landscape";
type Variant = "gold" | "maroon" | "ivory" | "charcoal";

interface PremiumPlaceholderProps {
    ratio?: AspectRatio;
    variant?: Variant;
    text?: string;
    className?: string;
    showMonogram?: boolean;
}

export default function PremiumPlaceholder({
    ratio = "portrait",
    variant = "maroon",
    text,
    className,
    showMonogram = true,
}: PremiumPlaceholderProps) {

    // Aspect Ratio styles
    const ratioStyles = {
        video: "aspect-video", // 16:9
        portrait: "aspect-[3/4]",
        square: "aspect-square",
        landscape: "aspect-[4/3]",
    };

    // Base background gradients simulating "Royal" textures
    const variantStyles = {
        gold: "bg-gradient-to-br from-[#D4AF37] via-[#F2D06B] to-[#AA8C2C]",
        maroon: "bg-gradient-to-br from-[#4a0012] via-[#800020] to-[#2d000b]",
        ivory: "bg-gradient-to-br from-[#FDFBF7] via-[#f4f1ea] to-[#e6e2d8]",
        charcoal: "bg-gradient-to-br from-[#1a1a1a] via-[#333333] to-[#000000]",
    };

    // Text color based on background
    const textStyles = {
        gold: "text-[#800020]",
        maroon: "text-[#D4AF37]",
        ivory: "text-[#333333]",
        charcoal: "text-[#D4AF37]",
    };

    return (
        <div
            className={cn(
                "relative overflow-hidden w-full h-full flex items-center justify-center group bg-cover bg-center",
                ratioStyles[ratio],
                variantStyles[variant],
                className
            )}
        >
            {/* Silk Texture overlay (CSS Pattern) */}
            <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`
                }}
            />

            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />

            {/* Content */}
            <div className="relative z-10 p-6 text-center transform group-hover:scale-110 transition-transform duration-700">
                {/* Monogram or Icon */}
                {showMonogram && (
                    <div className={cn("mb-2 text-4xl font-heading font-bold opacity-30", textStyles[variant])}>
                        SS
                    </div>
                )}

                {text && (
                    <span className={cn("uppercase tracking-[0.2em] text-xs font-bold opacity-90 block mt-2", textStyles[variant])}>
                        {text}
                    </span>
                )}
            </div>

            {/* Dark Overlay on Hover for premium feel */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
        </div>
    );
}
