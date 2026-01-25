"use client";

import { Product } from "@/types";
import { saveOrder } from "@/lib/orders";
import { cn } from "@/lib/utils";

interface WhatsAppButtonProps {
    product: Product;
    variant?: "primary" | "secondary" | "card"; // card variant for small implementation
    className?: string;
    children?: React.ReactNode;
}

export default function WhatsAppButton({ product, variant = "primary", className, children }: WhatsAppButtonProps) {
    const whatsappMessage = encodeURIComponent(
        `హాయ్ Shyamala Sarees 😊\nనాకు ఈ శారీ కావాలి.\n👉 శారీ పేరు: ${product.name}\n👉 ధర: ₹${product.price_inr}\n👉 బడ్జెట్: ₹${product.price_inr}\nమీ దగ్గర ఉన్న best collection పంపండి 🙏`
    );

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Safe to call even if not inside a clickable container, but good practice
        saveOrder(product);
    };

    const href = `https://wa.me/919440653443?text=${whatsappMessage}`;

    if (variant === "card") {
        // Determine button style based on caller, but for now just returning the anchor with click handler
        // The caller (ProductCard) has specific styles, so we might just want to use this logic instad of full component replacement if styles are complex.
        // However, to reuse logic, passing className is good.
        return (
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleClick}
                className={className}
            >
                {children || "WhatsApp Order"}
            </a>
        );
    }

    // Default Primary Style (used in Product Details)
    const defaultStyles = "w-full border border-[#D4AF37] text-[#800000] hover:bg-[#D4AF37]/10 font-medium py-4 uppercase tracking-[0.2em] text-center transition-colors flex items-center justify-center gap-2 text-sm";

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}
            className={cn(defaultStyles, className)}
        >
            {children || "WhatsApp లో ఆర్డర్ చేయండి"}
        </a>
    );
}
