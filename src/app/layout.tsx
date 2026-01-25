import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

const playfair = Playfair_Display({
    subsets: ["latin"],
    variable: "--font-playfair",
    display: "swap",
});

export const metadata: Metadata = {
    title: "Shyamala Sarees | Premium Silk & Bridal",
    description: "Handpicked silk, cotton, and bridal sarees from Shyamala Sarees. Order directly on WhatsApp.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${inter.variable} ${playfair.variable} antialiased bg-background text-foreground`}
            >
                <CartProvider>
                    <Header />
                    {children}
                    <Footer />
                </CartProvider>
            </body>
        </html>
    );
}
