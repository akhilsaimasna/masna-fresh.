import Image from "next/image";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AddToCartButton from "@/components/AddToCartButton";
import { Product } from "@/types";
import { ChevronDown, Truck, RefreshCw, ShieldCheck } from "lucide-react";
import PremiumPlaceholder from "@/components/PremiumPlaceholder";
import WhatsAppButton from "@/components/WhatsAppButton";

// Correct type for Next.js App Router Page Props
type Props = {
    params: Promise<{ slug: string }>;
};

// Simple Accordion Component (Inline for simplicity)
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

// Reusable View Component to handle both Real and Dummy data
function ProductView({ product }: { product: Product }) {
    const whatsappMessage = encodeURIComponent(
        `హాయ్ Shyamala Sarees 😊\nనాకు ఈ శారీ కావాలి.\n👉 శారీ పేరు: ${product.name}\n👉 ధర: ₹${product.price_inr}\n👉 కలర్: ____\n👉 బడ్జెట్: ₹${product.price_inr}\n👉 డెలివరీ ప్రాంతం: ____\nమీ దగ్గర ఉన్న best collection పంపండి 🙏`
    );

    const hasImage = product.images && product.images.length > 0 && product.images[0].startsWith("http");

    return (
        <div className="min-h-screen bg-[#FDFBF7] py-12 md:py-20">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 max-w-7xl mx-auto">

                    {/* Left: Sticky Image Section */}
                    <div className="lg:sticky lg:top-32 h-fit">
                        <div className="relative aspect-[3/4] bg-[#f4f1ea] overflow-hidden rounded-sm shadow-sm border border-[#E5E0D8]">
                            {hasImage ? (
                                <Image
                                    src={product.images[0]}
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
                        {/* Thumbnail Grid would go here if we had multiple images */}
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
                            <AddToCartButton product={product} /> {/* Uses default large variant */}

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
