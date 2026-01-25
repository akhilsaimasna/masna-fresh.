"use client";

import { useParams } from "next/navigation";
import { products } from "@/data/products";
import { COLLECTIONS, OTHER_CATEGORIES } from "@/data/collections";
import ProductCard from "@/components/ProductCard";
import { ArrowLeft, Filter, SlidersHorizontal, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function CollectionPage() {
    const params = useParams();
    const slug = params.slug as string;

    // 1. Find the collection details
    const collectionInfo = [...COLLECTIONS, ...OTHER_CATEGORIES].find((c) => c.slug === slug);
    const collectionName = collectionInfo?.name || "All Products";
    const collectionTelugu = collectionInfo?.telugu || "";

    // 2. Filter products (Mock Logic: If collection is 'Silk', show Silk products. If specific slug, try to match collection field or fallback to category)
    // For now, if no exact collection match in dummy data, we just show all products to demonstrate the UI grid.
    // In real app, `products.filter(p => p.collectionSlug === slug)`

    // Mocking filter behavior for demo:
    const filteredProducts = products;

    const [sortBy, setSortBy] = useState("featured");

    return (
        <div className="min-h-screen bg-white pt-32 pb-20">
            <div className="container mx-auto px-4 md:px-8">

                {/* Breadcrumb & Title */}
                <div className="mb-8">
                    <Link href="/collections" className="text-xs text-gray-400 hover:text-black uppercase tracking-widest flex items-center gap-2 mb-4">
                        <ArrowLeft size={12} /> Back to Collections
                    </Link>
                    <h1 className="font-heading text-4xl md:text-5xl text-black">
                        {collectionName} <span className="text-2xl text-gray-400 font-light ml-2">({collectionTelugu})</span>
                    </h1>
                    <p className="text-gray-500 mt-2 font-light">
                        Showing {filteredProducts.length} premium selections
                    </p>
                </div>

                {/* Toolbar (Filters & Sort) */}
                <div className="flex flex-wrap items-center justify-between border-t border-b border-gray-100 py-4 mb-10 sticky top-[104px] bg-white/95 backdrop-blur-sm z-30">

                    {/* Filter Button */}
                    <button className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-[#B08D57] transition-colors">
                        <SlidersHorizontal size={16} /> Filter
                    </button>

                    {/* Sort Dropdown */}
                    <div className="flex items-center gap-4">
                        <span className="text-xs text-gray-400 uppercase tracking-widest hidden md:block">Sort by:</span>
                        <div className="relative group">
                            <button className="flex items-center gap-2 text-sm font-medium hover:text-[#B08D57]">
                                {sortBy === 'featured' ? 'Featured' :
                                    sortBy === 'newest' ? 'New Arrivals' :
                                        sortBy === 'price_low' ? 'Price: Low to High' : 'Price: High to Low'}
                                <ChevronDown size={14} />
                            </button>
                            {/* Simple Dropdown Content */}
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-40">
                                {['featured', 'newest', 'price_low', 'price_high'].map((opt) => (
                                    <button
                                        key={opt}
                                        onClick={() => setSortBy(opt)}
                                        className="block w-full text-left px-4 py-3 text-sm hover:bg-gray-50 uppercase tracking-wide"
                                    >
                                        {opt === 'featured' ? 'Featured' :
                                            opt === 'newest' ? 'New Arrivals' :
                                                opt === 'price_low' ? 'Price: Low to High' : 'Price: High to Low'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-8 md:gap-y-16">
                    {filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}

                    {/* Show Empty State if needed */}
                    {filteredProducts.length === 0 && (
                        <div className="col-span-full text-center py-20">
                            <p className="text-gray-400">No products found in this collection yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
