import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types";
import ProductView from "@/components/ProductView";

// Correct type for Next.js App Router Page Props
type Props = {
    params: Promise<{ slug: string }>;
};

export default async function ProductPage({ params }: Props) {
    // Await the params promise
    const resolvedParams = await params;
    const { data: products, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", resolvedParams.slug)
        .limit(1);

    const productData = products?.[0];

    if (error || !productData) {
        // Fallback for demo purposes if Supabase fails (since we are using dummy data on home)
        // Ideally we use a consistent data source, but for this hybrid phase:
        // notFound(); 
        // Let's allow the page to render with dummy data if not found in specific demo context, 
        // BUT for production cleanliness, notFound() is correct.
        // Given user is testing dummy products from Home, they won't be in Supabase yet.
        // So we should handle the "Dummy Product" case gracefully or return notFound.
        // The user's goal implies visual verification. 
        // Let's stick to strict checking: if not in DB, 404.
        // Wait, the dummy products I added to Home (p1, p2...) are NOT in Supabase.
        // They will 404 if I click them.
        // I must allow these dummy IDs to render for the user to see the design!
        // I will Mock it if it's a dummy slug.

        const dummyProduct = [
            {
                id: "p1",
                name: "Royal Banarasi Silk - Maroon",
                slug: "royal-banarasi-maroon",
                price_inr: 12500,
                category: "Silk",
                images: [],
                in_stock: true,
                featured: true,
                description: "Handwoven Banarasi Silk Saree in deep maroon using pure zari. A heirloom piece perfect for weddings.",
                price_usd: 150,
                best_seller: false,
                fabric: "Pure Silk",
                care_instructions: "Dry Clean Only"
            },
            {
                id: "p2",
                name: "Kanjivaram Gold Tissue",
                slug: "kanjivaram-gold",
                price_inr: 45000,
                category: "Bridal",
                images: [],
                in_stock: true,
                featured: false,
                description: "Exquisite Gold Tissue Kanjivaram with temple border. The shimmer of pure gold zari makes it a masterpiece.",
                price_usd: 540,
                best_seller: true,
                fabric: "Silk Tissue",
                care_instructions: "Dry clean Only, Wrap in muslin"
            }
        ].find(p => p.slug === resolvedParams.slug);

        if (dummyProduct) {
            // Use dummy data
            return <ProductView product={dummyProduct as Product} />
        }

        if (!productData) return notFound();
    }

    return <ProductView product={productData as Product} />;
}
