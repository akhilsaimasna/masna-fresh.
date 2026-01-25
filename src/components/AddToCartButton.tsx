"use client";

import { useCart } from "@/context/CartContext";
import { Product } from "@/types";
import { useState } from "react";
import { ShoppingBag, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface AddToCartButtonProps {
    product: Product;
    compact?: boolean;
}

export default function AddToCartButton({ product, compact = false }: AddToCartButtonProps) {
    const { addToCart } = useCart();
    const [isAdded, setIsAdded] = useState(false);

    const handleAdd = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation(); // critical for the card overlay
        addToCart(product);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    if (compact) {
        return (
            <Button
                onClick={handleAdd}
                disabled={!product.in_stock || isAdded}
                variant="royal"
                className="w-full text-xs py-2 h-auto uppercase tracking-widest flex items-center justify-center gap-2"
            >
                {isAdded ? (
                    <>
                        <Check size={14} /> Added
                    </>
                ) : (
                    <>
                        <ShoppingBag size={14} /> Quick Add
                    </>
                )}
            </Button>
        );
    }

    // Default Full Version (for Product Page)
    return (
        <Button
            onClick={handleAdd}
            disabled={!product.in_stock}
            variant="royal"
            size="lg"
            className={`w-full text-lg py-6 uppercase tracking-[0.2em] transition-all duration-300 ${isAdded ? "bg-green-700 border-green-700 hover:bg-green-800" : ""}`}
        >
            {isAdded ? "Added to Cart" : "Add to Cart"}
        </Button>
    );
}
