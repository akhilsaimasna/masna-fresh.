"use client";

import { Product } from "@/types";
import { cn } from "@/lib/utils";

interface WhatsAppButtonProps {
    product: Product;
    variant?: "primary" | "secondary" | "card";
    className?: string;
    children?: React.ReactNode;
}

export default function WhatsAppButton({ product, variant = "primary", className, children }: WhatsAppButtonProps) {
    const productImage = product.images && product.images.length > 0 ? product.images[0] : "";
    const productPageUrl = `https://shyamalasarees.com/products/${product.slug}`;

    const whatsappMessage = encodeURIComponent(
        `Hello Shyamala Sarees! 🌸\nI would like to order the following saree:\n\n` +
        `👗 *Saree Name:* ${product.name}\n` +
        `🏷️ *Category:* ${product.category}\n` +
        `💰 *Price:* ₹${product.price_inr.toLocaleString()}\n` +
        (product.description ? `📝 *Details:* ${product.description}\n` : ``) +
        (productImage ? `🖼️ *Image:* ${productImage}\n` : ``) +
        `🔗 *Product Link:* ${productPageUrl}\n\n` +
        `Please confirm availability and delivery details. 🙏`
    );

    const href = `https://wa.me/919440653443?text=${whatsappMessage}`;

    if (variant === "card") {
        return (
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
            >
                {children || "WhatsApp Order"}
            </a>
        );
    }

    const defaultStyles = "w-full border border-[#D4AF37] text-[#800000] hover:bg-[#D4AF37]/10 font-medium py-4 uppercase tracking-[0.2em] text-center transition-colors flex items-center justify-center gap-2 text-sm";

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(defaultStyles, className)}
        >
            {children || "WhatsApp లో ఆర్డర్ చేయండి"}
        </a>
    );
}
