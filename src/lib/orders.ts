"use client";

import { Product } from "@/types";

export interface Order extends Product {
    orderedAt: number; // Timestamp
}

const STORAGE_KEY = "mb_order_history";

export const getOrders = (): Order[] => {
    if (typeof window === "undefined") return [];

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error("Failed to parse orders", e);
        return [];
    }
};

export const saveOrder = (product: Product) => {
    if (typeof window === "undefined") return;

    const currentOrders = getOrders();
    const newOrder: Order = { ...product, orderedAt: Date.now() };

    // Add to beginning of list
    const updatedOrders = [newOrder, ...currentOrders];

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedOrders));
    } catch (e) {
        console.error("Failed to save order", e);
    }
};
