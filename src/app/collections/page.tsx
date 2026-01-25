"use client";

import Link from "next/link";
import { COLLECTIONS } from "@/data/collections";
import { ArrowRight } from "lucide-react";

export default function CollectionsPage() {
    return (
        <div className="min-h-screen bg-white py-20">
            <div className="container mx-auto px-4 md:px-8">

                {/* Header */}
                <div className="text-center mb-16">
                    <span className="text-gold text-xs uppercase tracking-[0.3em] font-medium mb-4 block">
                        Our Collections
                    </span>
                    <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-black mb-6">
                        Shop by Category
                    </h1>
                    <p className="text-gray-500 max-w-2xl mx-auto font-light">
                        Explore our wide range of handpicked sarees, from traditional Kanjivarams to modern floral Organzas.
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {COLLECTIONS.map((col, index) => (
                        <Link href={`/collections/${col.slug}`} key={col.slug} className="group block relative overflow-hidden h-[300px] border border-gray-100 bg-gray-50 hover:shadow-xl transition-all duration-500">

                            {/* Mockup Image Background (Using patterns/gradients for now) */}
                            <div className="absolute inset-0 bg-gray-100 group-hover:scale-105 transition-transform duration-700">
                                {/* Placeholder for collection image */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            </div>

                            {/* Content */}
                            <div className="absolute bottom-0 left-0 w-full p-8 text-white">
                                <span className="text-xs text-gold uppercase tracking-widest mb-1 block opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-100">
                                    {col.telugu}
                                </span>
                                <h3 className="font-heading text-2xl md:text-3xl font-bold mb-2 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                                    {col.name}
                                </h3>
                                <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                                    View Collection <ArrowRight size={14} />
                                </div>
                            </div>

                            {/* Index Number */}
                            <div className="absolute top-4 right-4 text-white/20 font-heading text-6xl font-bold z-0">
                                {String(index + 1).padStart(2, '0')}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
