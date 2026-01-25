"use client";

import ProductCard from "@/components/ProductCard";
import { Product } from "@/types";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface ProductCarouselProps {
    title: string;
    products: Product[];
    viewAllLink?: string;
}

export default function ProductCarousel({ title, products, viewAllLink }: ProductCarouselProps) {
    if (products.length === 0) return null;

    return (
        <section className="py-12 border-b border-gray-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="font-heading text-2xl md:text-3xl text-black font-bold">
                        {title}
                    </h3>
                    {viewAllLink && (
                        <Link href={viewAllLink} className="flex items-center gap-1 text-sm font-medium uppercase tracking-widest text-gold hover:text-black transition-colors">
                            View All <ArrowRight size={14} />
                        </Link>
                    )}
                </div>

                <div className="flex gap-6 overflow-x-auto pb-8 -mx-4 px-4 scrollbar-hide snap-x">
                    {products.map((product) => (
                        <div key={product.id} className="min-w-[280px] md:min-w-[300px] snap-start">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
