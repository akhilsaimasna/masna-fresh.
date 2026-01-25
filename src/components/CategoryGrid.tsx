"use client";

import React from "react";
import Link from "next/link";
import PremiumPlaceholder from "./PremiumPlaceholder";

const categories = [
    { id: "sale", name: "Sale", href: "/products?cat=sale", color: "pink" },
    { id: "bridal", name: "Bridal", href: "/products?cat=bridal", color: "maroon" },
    { id: "silk", name: "Silk", href: "/products?cat=silk", color: "gold" },
    { id: "party", name: "Party", href: "/products?cat=party", color: "charcoal" },
    { id: "cotton", name: "Cotton", href: "/products?cat=cotton", color: "ivory" },
    { id: "accessories", name: "Jewelry", href: "/products?cat=acc", color: "gold" },
];

export default function CategoryGrid() {
    return (
        <section className="py-10 bg-white border-b border-gray-100">
            <div className="container mx-auto px-4">
                <h3 className="font-bold text-lg text-charcoal mb-6 uppercase tracking-wider">Shop By Category</h3>

                {/* Horizontal Scroll Container */}
                <div className="flex gap-8 overflow-x-auto pb-4 scrollbar-hide">
                    {categories.map((cat) => (
                        <Link
                            key={cat.id}
                            href={cat.href}
                            className="flex flex-col items-center min-w-[100px] group cursor-pointer"
                        >
                            {/* Circular Image Container */}
                            <div className="w-[100px] h-[100px] rounded-full overflow-hidden mb-3 border-2 border-transparent group-hover:border-pink transition-all p-1">
                                <div className="w-full h-full rounded-full overflow-hidden relative">
                                    <PremiumPlaceholder
                                        ratio="square"
                                        variant={cat.color as any}
                                        text={cat.name.substring(0, 1)} // Just first letter
                                        className="scale-125" // Zoom in
                                    />
                                </div>
                            </div>

                            {/* Label */}
                            <span className="text-sm font-bold text-[#535766] group-hover:text-pink transition-colors">
                                {cat.name}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
