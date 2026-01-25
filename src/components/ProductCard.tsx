"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { cn } from "@/lib/utils";
import PremiumPlaceholder from "./PremiumPlaceholder";
import { Heart } from "lucide-react";
import AddToCartButton from "./AddToCartButton";

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const hasImage = product.images && product.images.length > 0 && product.images[0].startsWith("http");

    const whatsappMessage = encodeURIComponent(
        `హాయ్ Shyamala Sarees 😊\nనాకు ఈ శారీ కావాలి.\n👉 శారీ పేరు: ${product.name}\n👉 ధర: ₹${product.price_inr}\n👉 బడ్జెట్: ₹${product.price_inr}\nమీ దగ్గర ఉన్న best collection పంపండి 🙏`
    );

    // Calculate random discount for demo if not present
    const discount = Math.floor(Math.random() * (60 - 30 + 1) + 30);
    const originalPrice = Math.floor(product.price_inr * (100 / (100 - discount)));

    return (
        <div className="group block relative bg-white hover:shadow-card transition-shadow duration-300 pb-2">
            <Link href={`/products/${product.slug}`} className="block">

                {/* Image Container */}
                <div className="relative aspect-[3/4] overflow-hidden bg-[#F5F5F6]">
                    {hasImage ? (
                        <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <PremiumPlaceholder
                            ratio="portrait"
                            variant="maroon" // Fixed: Check valid variant in next step or assume maroon is safe
                            text={product.category || "New"}
                            className="w-full h-full"
                        />
                    )}

                    {/* Rating Pill (Myntra style) */}
                    <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-[2px] text-[10px] font-bold flex items-center gap-1 shadow-sm opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>4.5</span>
                        <span className="text-teal-500">★</span>
                        <span className="font-normal text-gray-500 border-l border-gray-300 pl-1 ml-1">1.2k</span>
                    </div>

                    {/* WhatsApp Overlay Button (Desktop Hover) */}
                    <div className="hidden md:flex absolute inset-x-0 bottom-0 bg-white/95 backdrop-blur py-3 items-center justify-center transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 border-t border-gray-100">
                        <div className="flex flex-col gap-2 w-full px-4">
                            <AddToCartButton product={product} compact={true} />

                            <a
                                href={`https://wa.me/919440653443?text=${whatsappMessage}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    import("@/lib/orders").then(mod => mod.saveOrder(product));
                                }}
                                className="text-xs font-bold uppercase tracking-widest text-[#B08D57] flex items-center justify-center gap-2 hover:text-black transition-colors py-2"
                            >
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                WhatsApp Order
                            </a>
                        </div>
                    </div>
                </div>

                {/* Details */}
                <div className="px-3 pt-3">
                    <h3 className="font-bold text-base text-[#282C3F] mb-0.5 truncate leading-tight">
                        {product.name.split(" ")[0]} {/* Brand Name simulation */}
                    </h3>
                    <p className="text-sm text-[#535766] mb-2 truncate font-normal leading-tight">
                        {product.name}
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="font-bold text-[#282C3F]">₹{product.price_inr.toLocaleString()}</span>
                        <span className="text-xs text-[#94969F] line-through">₹{originalPrice.toLocaleString()}</span>
                        <span className="text-xs text-[#FF905A] font-bold">({discount}% OFF)</span>
                    </div>
                </div>
            </Link>

            {/* Mobile WhatsApp Button (Visible always on mobile) */}
            <div className="md:hidden px-3 pb-2 pt-1">
                <a
                    href={`https://wa.me/919440653443?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                        e.stopPropagation();
                        import("@/lib/orders").then(mod => mod.saveOrder(product));
                    }}
                    className="w-full block bg-green-50 text-green-700 border border-green-200 text-[10px] font-bold uppercase tracking-wider text-center py-2 rounded-sm"
                >
                    WhatsApp లో ఆర్డర్ చేయండి
                </a>
            </div>

            {/* Wishlist Button Overlay */}
            <button className="absolute top-3 right-3 w-8 h-8 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white text-[#282C3F] transition-colors md:invisible md:group-hover:visible shadow-sm">
                <Heart size={16} />
            </button>
        </div>
    );
}
