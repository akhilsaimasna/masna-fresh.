"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Order, getOrders } from "@/lib/orders";
import PremiumPlaceholder from "@/components/PremiumPlaceholder";

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setOrders(getOrders());
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-[#FDFBF7] py-20 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="font-heading text-4xl text-[#800000] mb-8 text-center">My Orders</h1>

                <div className="bg-white border border-[#E5E0D8] p-6 md:p-10 shadow-sm rounded-sm">
                    {orders.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
                            <Link
                                href="/products"
                                className="inline-block bg-[#B08D57] text-white px-8 py-3 uppercase tracking-widest text-sm font-bold hover:bg-[#967645] transition-colors"
                            >
                                Start Shopping
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <p className="text-sm text-gray-500 mb-4 border-b pb-4">
                                Note: These are items you initiated an order for via WhatsApp. Actual purchase status depends on your conversation.
                            </p>
                            {orders.map((order, index) => (
                                <div key={`${order.id}-${index}`} className="flex flex-col md:flex-row gap-6 border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                                    {/* Image */}
                                    <div className="relative w-24 h-32 md:w-32 md:h-40 flex-shrink-0 bg-gray-100">
                                        {order.images && order.images.length > 0 ? (
                                            <Image
                                                src={order.images[0]}
                                                alt={order.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <PremiumPlaceholder text={order.category} />
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="flex-grow">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-heading text-lg md:text-xl text-gray-900 mb-1">
                                                    {order.name}
                                                </h3>
                                                <p className="text-sm text-[#D4AF37] font-bold tracking-wider uppercase mb-2">
                                                    {order.category}
                                                </p>
                                            </div>
                                            <span className="font-light text-xl">
                                                ₹{order.price_inr.toLocaleString()}
                                            </span>
                                        </div>

                                        <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <span className="text-xs text-gray-400">
                                                Inquired on: {new Date(order.orderedAt).toLocaleDateString()}
                                            </span>

                                            <Link
                                                href={`/products/${order.slug}`}
                                                className="text-sm font-bold text-[#800000] border-b border-[#800000] w-fit hover:opacity-80"
                                            >
                                                View Product
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
