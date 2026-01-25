export interface Product {
    id: string;
    name: string;
    slug: string;
    price_inr: number;
    price_usd: number;
    category: "Silk" | "Cotton" | "Party Wear" | "Bridal" | "Daily Wear" | "Sarees" | "Lehengas" | "Jewellery" | "Kids";
    collection?: string; // e.g. "Gadwal Silk", "Banarasi"
    subCategory?: string; // e.g. "Premium Gadwal"
    description: string;
    images: string[];
    in_stock: boolean;
    featured: boolean;
    best_seller: boolean;
}

export interface OrderItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
}

export interface Order {
    id: string;
    date: string; // ISO string
    total: number;
    status: "Pending" | "Confirmed" | "Shipped" | "Delivered";
    items: OrderItem[];
    customerDetails: {
        name: string;
        phone: string;
        address: string;
    };
}
