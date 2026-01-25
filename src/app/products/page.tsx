
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types";

export const revalidate = 0; // Disable caching for now to see updates immediately

export default async function ProductsPage() {
    const { data: products, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching products:", error);
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-red-500">Error loading products. Please try again later.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="bg-white border-b border-gray-100 py-12 mb-10">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="font-heading text-4xl font-bold text-gray-900 mb-4">Our Saree Collection</h1>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        Handpicked elegance for every occasion. Browse our range of Silk, Cotton, and Designer Sarees.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4">
                {/* Filters (Visual Only for now) */}
                <div className="flex flex-wrap justify-center gap-4 mb-10">
                    {["All", "Silk", "Cotton", "Party Wear", "Bridal"].map((filter, index) => (
                        <button
                            key={filter}
                            className={`px-6 py-2 rounded-full border text-sm font-medium transition-colors ${index === 0
                                    ? "bg-gray-900 text-white border-gray-900"
                                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-900 hover:text-gray-900"
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {(products as Product[])?.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </div>
    );
}
