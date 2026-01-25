"use client";

import { useCart } from "@/context/CartContext";
import Image from "next/image";
import Link from "next/link";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import PremiumPlaceholder from "@/components/PremiumPlaceholder";
import { useEffect, useState } from "react";

export default function CartPage() {
    const { cart, removeFromCart, cartTotal, clearCart } = useCart();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const whatsappMessage = encodeURIComponent(
        `Hello Shyamala Sarees! 🌸\n` +
        `I would like to order the following items:\n\n` +
        cart.map((item, i) => `${i + 1}. ${item.name} - ₹${item.price_inr}`).join("\n") +
        `\n\nTotal: ₹${cartTotal.toLocaleString()}\n` +
        `Please confirm availability.`
    );

    if (!mounted) return null;

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-4">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-400">
                    <ShoppingBag size={32} />
                </div>
                <h1 className="font-heading text-3xl text-gray-800 mb-4">Your Cart is Empty</h1>
                <p className="text-gray-500 mb-8 max-w-md text-center">
                    Looks like you haven't added any sarees to your collection yet.
                </p>
                <Link
                    href="/products"
                    className="bg-[#800000] text-white px-8 py-3 uppercase tracking-widest text-sm font-bold hover:bg-[#600000] transition-colors"
                >
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFBF7] py-20 px-4">
            <div className="max-w-6xl mx-auto">
                <h1 className="font-heading text-4xl text-[#800000] mb-10 text-center">Shopping Cart</h1>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Cart Items */}
                    <div className="flex-grow">
                        <div className="bg-white border border-[#E5E0D8] rounded-sm shadow-sm overflow-hidden">
                            <div className="divide-y divide-gray-100">
                                {cart.map((item) => (
                                    <div key={item.id} className="p-6 flex flex-col sm:flex-row gap-6 items-start">
                                        {/* Image */}
                                        <div className="relative w-24 h-32 flex-shrink-0 bg-gray-100 border border-gray-200">
                                            {item.images && item.images.length > 0 ? (
                                                <Image
                                                    src={item.images[0]}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <PremiumPlaceholder text={item.category} />
                                            )}
                                        </div>

                                        {/* Details */}
                                        <div className="flex-grow">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-heading text-lg font-bold text-gray-900">
                                                    {item.name}
                                                </h3>
                                                <span className="font-light text-xl text-gray-900">
                                                    ₹{(item.price_inr * item.quantity).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-[#D4AF37] font-bold tracking-wider uppercase mb-4">
                                                {item.category}
                                            </p>

                                            <div className="flex items-center justify-between mt-4">
                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    <span>Qty: {item.quantity}</span>
                                                </div>

                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="text-red-400 hover:text-red-700 text-sm flex items-center gap-1 transition-colors"
                                                >
                                                    <Trash2 size={14} /> Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-6 flex justify-between items-center">
                            <button
                                onClick={clearCart}
                                className="text-sm text-gray-400 hover:text-gray-600 underline"
                            >
                                Clear Cart
                            </button>
                            <Link href="/products" className="text-[#800000] font-bold text-sm hover:underline">
                                Continue Shopping
                            </Link>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="w-full lg:w-96 flex-shrink-0">
                        <div className="bg-white border border-[#E5E0D8] p-8 shadow-sm rounded-sm sticky top-32">
                            <h2 className="font-heading text-2xl text-gray-900 mb-6 pb-4 border-b border-gray-100">
                                Order Summary
                            </h2>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal ({cart.length} items)</span>
                                    <span>₹{cartTotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span className="text-green-600 font-medium">Free</span>
                                </div>
                                <div className="border-t border-gray-100 pt-4 flex justify-between text-xl font-bold text-[#800000]">
                                    <span>Total</span>
                                    <span>₹{cartTotal.toLocaleString()}</span>
                                </div>
                            </div>

                            <a
                                href={`https://wa.me/919440653443?text=${whatsappMessage}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-4 rounded-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] shadow-lg"
                            >
                                <ShoppingBag size={18} />
                                Checkout on WhatsApp
                            </a>

                            <p className="text-xs text-center text-gray-400 mt-4">
                                Clicking checkout will open WhatsApp with your pre-filled order list.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
