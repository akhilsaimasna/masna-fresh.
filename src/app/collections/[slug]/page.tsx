import { getProducts } from "@/actions/products";
import { COLLECTIONS, OTHER_CATEGORIES } from "@/data/collections";
import ProductCard from "@/components/ProductCard";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";
import Link from "next/link";

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    // 1. Find the collection details
    const collectionInfo = [...COLLECTIONS, ...OTHER_CATEGORIES].find((c) => c.slug === slug);
    const collectionName = collectionInfo?.name || "All Products";
    const collectionTelugu = collectionInfo?.telugu || "";

    // 2. Fetch products from Supabase
    // Ideally we filter by category/collection in the DB.
    // For this demo, we'll try to match the 'category' field in DB with the collection name,
    // or just fetch latest items if it's "new-arrivals".

    let dbCategory: string | undefined = undefined;

    // Simple mapping for demo purposes
    if (slug === 'kanchi-silk' || slug === 'gadwal-silk') dbCategory = 'Silk';
    if (slug === 'new-arrivals') dbCategory = undefined;

    const products = await getProducts(dbCategory, 50);

    // In valid app, we might filter further in JS if DB category isn't granular enough yet
    const filteredProducts = products;

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

                {/* Toolbar (Static for now) */}
                <div className="flex flex-wrap items-center justify-between border-t border-b border-gray-100 py-4 mb-10 sticky top-[104px] bg-white/95 backdrop-blur-sm z-30">
                    <button className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-[#B08D57] transition-colors">
                        <SlidersHorizontal size={16} /> Filter
                    </button>
                    <div className="text-sm text-gray-400 uppercase tracking-widest">
                        Sorted by: Featured
                    </div>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-8 md:gap-y-16">
                    {filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}

                    {/* Show Empty State */}
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
