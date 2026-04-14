"use client";

import Link from "next/link";
import { Product } from "@/types";
import PremiumPlaceholder from "./PremiumPlaceholder";
import { Heart, MessageCircle } from "lucide-react";
import AddToCartButton from "./AddToCartButton";
import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const [imgError, setImgError] = useState(false);
    const { language } = useLanguage();
    // Show Telugu name if language is Telugu and name_te exists, else show English
    const displayName = language === 'te' && product.name_te ? product.name_te : product.name;
    const hasImage = !imgError && product.images && product.images.length > 0 && product.images[0].startsWith("http");

    const productUrl = `${typeof window !== "undefined" ? window.location.origin : "https://shyamalasarees.com"}/products/${product.slug}`;

    const whatsappMessage = encodeURIComponent(
        `Hello Shyamala Sarees! 🌸\n` +
        `I would like to order the following saree:\n\n` +
        `👗 *Saree Name:* ${product.name}\n` +
        `🏷️ *Category:* ${product.category}\n` +
        `💰 *Price:* ₹${product.price_inr.toLocaleString()}\n` +
        (product.description ? `📝 *Details:* ${product.description}\n` : ``) +
        (product.images && product.images.length > 0 ? `🖼️ *Image:* ${product.images[0]}\n` : ``) +
        `🔗 *Product Link:* ${productUrl}\n\n` +
        `Please confirm availability and delivery details. 🙏`
    );

    // Real discount from compareAtPrice only
    const compareAtPrice = (product as any).compareAtPrice;
    const discount = compareAtPrice && compareAtPrice > product.price_inr
        ? Math.round(((compareAtPrice - product.price_inr) / compareAtPrice) * 100)
        : null;

    return (
        <div className="group relative bg-white rounded-xl overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl shadow-sm border border-gray-100 hover:border-[#B08D57]/30 flex flex-col">

            {/* Gold bottom border that animates in on hover */}
            <div className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full bg-gradient-to-r from-[#B08D57] to-[#D4AF37] transition-all duration-500 z-10" />

            {/* Wishlist Button */}
            <button className="absolute top-3 right-3 z-20 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white hover:text-[#800000] text-gray-400 transition-all duration-200 shadow-sm opacity-0 group-hover:opacity-100">
                <Heart size={15} />
            </button>

            {/* Discount Badge */}
            {discount !== null && product.in_stock && (
                <div className="absolute top-3 left-3 z-20 bg-[#800000] text-white text-[10px] font-bold px-2 py-1 rounded-sm tracking-wider">
                    {discount}% OFF
                </div>
            )}

            {/* Sold Out Badge */}
            {!product.in_stock && (
                <div className="absolute top-3 left-3 z-30 bg-black/80 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-sm tracking-widest uppercase">
                    Sold Out
                </div>
            )}

            <Link href={`/products/${product.slug}`} className="block flex-grow">

                {/* Image Container — fixed height, any URL domain works */}
                <div className="relative h-[280px] overflow-hidden bg-[#F5F0EC]">
                    {hasImage ? (
                        // Plain <img> works with ANY domain — no Next.js whitelist needed
                        <img
                            src={product.images[0]}
                            alt={product.name}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-[#F0EBE3] text-gray-400 gap-2">
                            <span className="text-5xl">🥻</span>
                            <span className="text-xs font-medium tracking-widest uppercase text-gray-400">Image Coming Soon</span>
                        </div>
                    )}
                </div>

                {/* Details */}
                <div className="px-4 pt-4 pb-2">
                    {/* Category */}
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#B08D57] font-semibold mb-1">
                        {product.category}
                    </p>

                    {/* Product Name — serif */}
                    <h3 className="font-heading text-[15px] text-[#1a1a1a] leading-snug mb-3">
                        {displayName}
                    </h3>

                    {/* Price Row */}
                    <div className="flex items-baseline gap-2 flex-wrap mb-1">
                        <span className="text-lg font-bold text-[#1a1a1a]">
                            ₹{product.price_inr.toLocaleString()}
                        </span>
                        {discount !== null && compareAtPrice && (
                            <>
                                <span className="text-xs text-gray-400 line-through">
                                    ₹{(compareAtPrice as number).toLocaleString()}
                                </span>
                                <span className="text-xs font-bold text-red-600">
                                    {discount}% off
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </Link>

            {/* Action Buttons — Desktop hover overlay */}
            <div className="hidden md:flex flex-col gap-2 px-4 pb-4 pt-0 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                {product.in_stock ? (
                    <>
                        <AddToCartButton product={product} compact={true} />
                        <a
                            href={`https://wa.me/919440653443?text=${whatsappMessage}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => {
                                e.stopPropagation();
                                import("@/lib/orders").then(mod => mod.saveOrder(product));
                            }}
                            className="flex items-center justify-center gap-2 w-full py-2 border border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white text-xs font-bold uppercase tracking-widest rounded-sm transition-all duration-200"
                        >
                            <MessageCircle size={13} />
                            WhatsApp Order
                        </a>
                    </>
                ) : (
                    <button disabled className="w-full py-2 bg-gray-100 text-gray-400 text-xs font-bold uppercase tracking-widest rounded-sm cursor-not-allowed border border-gray-200">
                        Currently Unavailable
                    </button>
                )}
            </div>

            {/* Mobile WhatsApp Button */}
            <div className="md:hidden px-4 pb-4 pt-0">
                {product.in_stock ? (
                    <a
                        href={`https://wa.me/919440653443?text=${whatsappMessage}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                            e.stopPropagation();
                            import("@/lib/orders").then(mod => mod.saveOrder(product));
                        }}
                        className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0] text-xs font-bold uppercase tracking-wider rounded-sm"
                    >
                        <MessageCircle size={13} />
                        WhatsApp లో ఆర్డర్ చేయండి
                    </a>
                ) : (
                    <button disabled className="w-full py-2.5 bg-gray-100 text-gray-400 border border-gray-200 text-xs font-bold uppercase tracking-wider rounded-sm cursor-not-allowed">
                        అందుబాటులో లేదు
                    </button>
                )}
            </div>
        </div>
    );
}
