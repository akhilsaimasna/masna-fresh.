"use client";

import { Product } from "@/types";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface WhatsAppButtonProps {
    product: Product;
    variant?: "primary" | "secondary" | "card";
    className?: string;
    children?: React.ReactNode;
}

export default function WhatsAppButton({ product, variant = "primary", className, children }: WhatsAppButtonProps) {
    const { user } = useAuth();
    const router = useRouter();

    const whatsappMessage = encodeURIComponent(
        `హాయ్ Shyamala Sarees 😊\nనాకు ఈ శారీ కావాలి.\n👉 శారీ పేరు: ${product.name}\n👉 ధర: ₹${product.price_inr}\n👉 బడ్జెట్: ₹${product.price_inr}\nమీ దగ్గర ఉన్న best collection పంపండి 🙏`
    );

    const href = `https://wa.me/919440653443?text=${whatsappMessage}`;

    const handleClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            // Redirect to login if not authenticated
            router.push("/login");
            return;
        }

        // Track Order in Supabase
        try {
            await supabase.from('orders').insert({
                user_id: user.id,
                product_id: product.id || product.slug, // Use slug if ID not available
                product_name: product.name,
                price: product.price_inr,
                status: 'clicked_whatsapp'
            });
        } catch (err) {
            console.error("Error tracking order:", err);
            // We proceed to WhatsApp even if tracking fails (don't block sales)
        }

        // Open WhatsApp
        window.open(href, '_blank');
    };

    if (variant === "card") {
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

    // Default Primary Style
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
