"use client";

import { useState } from "react";
import Image from "next/image";
import { Product } from "@/types";
import { ChevronDown, Truck, RefreshCw, ShieldCheck } from "lucide-react";
import AddToCartButton from "@/components/AddToCartButton";
import WhatsAppButton from "@/components/WhatsAppButton";
import PremiumPlaceholder from "@/components/PremiumPlaceholder";
import { cn } from "@/lib/utils";

// Simple Accordion Component
function AccordionItem({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="border-b border-[#E5E0D8]">
            <details className="group">
                <summary className="flex justify-between items-center font-medium cursor-pointer list-none py-4 text-[#333333] hover:text-[#800000] transition-colors">
                    <span className="font-heading uppercase tracking-wider text-sm">{title}</span>
                    <span className="transition group-open:rotate-180">
                        <ChevronDown size={16} />
                    </span>
                </summary>
                <div className="text-[#333333]/70 font-light pb-4 animate-fade-in text-sm leading-relaxed">
                    {children}
                </div>
            </details>
        </div>
    );
}

export default function ProductView({ product }: { product: Product }) {
    const [selectedImage, setSelectedImage] = useState(product.images?.[0] || "");

    const hasImage = selectedImage && selectedImage.startsWith("http");
    const hasMultipleImages = product.images && product.images.length > 1;

    return (
        <div className="min-h-screen bg-[#FDFBF7] py-12 md:py-20">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 max-w-7xl mx-auto">

                    {/* Left: Sticky Image Section */}
                    <div className="lg:sticky lg:top-32 h-fit">

                        {/* Main Image */}
                        <div className="relative aspect-[3/4] bg-[#f4f1ea] overflow-hidden rounded-sm shadow-sm border border-[#E5E0D8] mb-4">
                            {hasImage ? (
                                <Image
                                    src={selectedImage}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            ) : (
                                <PremiumPlaceholder
                                    ratio="portrait"
                                    variant="maroon"
                                    text={product.name}
                                    className="w-full h-full"
                                />
                            )}

                            {!product.in_stock && (
                                <div className="absolute top-4 left-4 bg-red-800 text-white text-xs font-bold px-3 py-1 uppercase tracking-widest shadow-md">
                                    Sold Out
                                </div>
                            )}
                        </div>

                        {/* Thumbnail Grid */}
                        {hasMultipleImages && (
                            <div className="grid grid-cols-4 gap-2">
                                {product.images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(img)}
                                        className={cn(
                                            "relative aspect-[3/4] bg-[#f4f1ea] overflow-hidden rounded-sm border cursor-pointer transition-all",
                                            selectedImage === img
                                                ? "border-[#800000] ring-1 ring-[#800000]"
                                                : "border-[#E5E0D8] hover:border-[#800000]/50"
                                        )}
                                    >
                                        <Image
                                            src={img}
                                            alt={`${product.name} view ${idx + 1}`}
                                            fill
                                            className="object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Product Info */}
                    <div className="flex flex-col pt-4">
                        <div className="mb-8 border-b border-[#E5E0D8] pb-8">
                            <span className="text-xs text-[#D4AF37] font-bold tracking-[0.25em] uppercase mb-2 block">
                                {product.category}
                            </span>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-medium text-[#333333] mb-4 leading-tight">
                                {product.name}
                            </h1>
                            <div className="flex items-baseline gap-4 mt-4">
                                <span className="text-2xl font-light text-[#333333]">
                                    ₹{product.price_inr.toLocaleString()}
                                </span>
                                <span className="text-sm text-[#333333]/50 font-light">
                                    All taxes included
                                </span>
                            </div>
                        </div>

                        <div className="prose prose-stone prose-lg text-[#333333]/80 font-light mb-10 leading-relaxed">
                            <p>{product.description}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-4 mb-10">
                            <AddToCartButton product={product} />

                            <WhatsAppButton product={product} />
                        </div>

                        {/* Trust Badges Simple */}
                        <div className="grid grid-cols-3 gap-4 mb-10 text-center text-[#333333]/60 text-xs uppercase tracking-wider">
                            <div className="flex flex-col items-center gap-2">
                                <Truck size={20} className="text-[#800000]" />
                                <span>Free Shipping</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <ShieldCheck size={20} className="text-[#800000]" />
                                <span>Authentic</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <RefreshCw size={20} className="text-[#800000]" />
                                <span>Easy Returns</span>
                            </div>
                        </div>

                        {/* Accordions */}
                        <div className="border-t border-[#E5E0D8]">
                            <AccordionItem title="Fabric & Care">
                                This product is crafted from pure {product.category}. <br />
                                We recommend professional dry cleaning only to maintain the luster and texture of the fabric.
                            </AccordionItem>
                            <AccordionItem title="Shipping & Delivery">
                                **Domestic Orders:** Delivered within 3-5 business days.<br />
                                **International:** Delivered within 7-10 business days.<br />
                                Free shipping on all orders above ₹5000.
                            </AccordionItem>
                            <AccordionItem title="Styling Notes">
                                Pair this with antique gold jewelry and a classic bun for a timeless royal look.
                            </AccordionItem>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
