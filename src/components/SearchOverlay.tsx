"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, Loader2, ArrowRight } from "lucide-react";
import { searchProducts } from "@/actions/products";
import { Product } from "@/types";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const SUGGESTIONS = ["Silk", "Bridal", "Banarasi", "Kanjivaram", "Cotton", "Gadwal"];

export default function SearchOverlay({ onClose }: { onClose: () => void }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        inputRef.current?.focus();
        // Close on Escape key
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    const doSearch = useCallback(async (q: string) => {
        if (!q.trim()) { setResults([]); setSearched(false); return; }
        setLoading(true);
        setSearched(true);
        const data = await searchProducts(q);
        setResults(data);
        setLoading(false);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => doSearch(val), 400);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex flex-col"
            onClick={onClose}
        >
            {/* Search Panel */}
            <motion.div
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -30, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="bg-white w-full max-h-[80vh] overflow-y-auto shadow-2xl flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Search Input Row */}
                <div className="flex items-center gap-4 px-6 md:px-12 py-5 border-b border-gray-100">
                    <Search size={22} className="text-[#B08D57] flex-shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={handleChange}
                        placeholder="Search sarees — silk, bridal, gadwal..."
                        className="flex-1 text-lg md:text-xl outline-none text-gray-900 placeholder:text-gray-300 bg-transparent"
                    />
                    {loading && <Loader2 size={20} className="animate-spin text-gray-400 flex-shrink-0" />}
                    <button onClick={onClose} className="p-1 hover:text-[#800000] text-gray-400 transition-colors flex-shrink-0">
                        <X size={22} />
                    </button>
                </div>

                <div className="px-6 md:px-12 py-6">

                    {/* Suggestions (before any search) */}
                    {!searched && (
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-3 font-semibold">Popular searches</p>
                            <div className="flex flex-wrap gap-2">
                                {SUGGESTIONS.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => { setQuery(s); doSearch(s); }}
                                        className="px-4 py-1.5 bg-gray-50 hover:bg-[#800000] hover:text-white text-sm text-gray-600 border border-gray-200 rounded-full transition-all duration-200"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Results */}
                    {searched && !loading && (
                        <>
                            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-4 font-semibold">
                                {results.length > 0 ? `${results.length} results for "${query}"` : `No results for "${query}"`}
                            </p>

                            {results.length === 0 ? (
                                <div className="text-center py-10">
                                    <p className="text-4xl mb-3">🥻</p>
                                    <p className="text-gray-500 mb-2">No sarees found for <strong>"{query}"</strong></p>
                                    <p className="text-sm text-gray-400">Try "silk", "bridal", or a saree colour</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {results.map((product) => (
                                        <Link
                                            key={product.id}
                                            href={`/products/${product.slug}`}
                                            onClick={onClose}
                                            className="group flex flex-col gap-2 hover:opacity-90 transition-opacity"
                                        >
                                            {/* Thumbnail */}
                                            <div className="aspect-[3/4] bg-[#F5F0EC] overflow-hidden rounded-md">
                                                {product.images?.[0] ? (
                                                    <img
                                                        src={product.images[0]}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-2xl">🥻</div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-[#B08D57] uppercase tracking-wider">{product.category}</p>
                                                <p className="text-sm font-semibold text-gray-900 leading-tight line-clamp-2">{product.name}</p>
                                                <p className="text-sm font-bold text-[#800000] mt-0.5">₹{product.price_inr.toLocaleString()}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {/* View All Results Link */}
                            {results.length > 0 && (
                                <Link
                                    href={`/products?search=${encodeURIComponent(query)}`}
                                    onClick={onClose}
                                    className="mt-6 flex items-center gap-2 text-sm font-bold text-[#800000] hover:underline"
                                >
                                    View all results for "{query}" <ArrowRight size={14} />
                                </Link>
                            )}
                        </>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}
