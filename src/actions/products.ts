import { supabase } from "@/lib/supabase";
import { Product } from "@/types";

export async function getProducts(category?: string, limit: number = 20): Promise<Product[]> {
    let query = supabase
        .from("products")
        .select("*")
        .eq("in_stock", true)
        .order("created_at", { ascending: false })
        .limit(limit);

    if (category) {
        query = query.eq("category", category);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching products:", error);
        return [];
    }

    return (data as Product[]) || [];
}

export async function getBestSellers(limit: number = 4): Promise<Product[]> {
    const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("best_seller", true)
        .limit(limit);

    if (error) {
        console.error("Error fetching best sellers:", error);
        return [];
    }

    return (data as Product[]) || [];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
    const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .single();

    if (error) {
        console.error(`Error fetching product with slug ${slug}:`, error);
        return null;
    }

    return data as Product;
}
