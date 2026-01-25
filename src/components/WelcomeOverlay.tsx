"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function WelcomeOverlay() {
    const [show, setShow] = useState(false);

    useEffect(() => {
        // Check if seen in last 24 hours
        const lastSeen = localStorage.getItem("mb_welcome_seen");
        const now = new Date().getTime();

        if (!lastSeen || now - parseInt(lastSeen) > 24 * 60 * 60 * 1000) {
            // Show it
            setShow(true);
            // Disable scrolling
            document.body.style.overflow = "hidden";
        }
    }, []);

    const handleClose = () => {
        setShow(false);
        // Enable scrolling
        document.body.style.overflow = "auto";
        // Save timestamp
        localStorage.setItem("mb_welcome_seen", new Date().getTime().toString());
    };

    const handleShop = () => {
        handleClose();
        const productSection = document.getElementById("products");
        if (productSection) {
            productSection.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-[#FDFBF7] text-[#333333]"
                >
                    {/* Background Texture Effect (CSS Gradient) */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/0 via-[#D4AF37]/5 to-[#D4AF37]/10 pointer-events-none" />

                    <div className="relative text-center p-8 max-w-lg w-full">
                        {/* Animated Monogram */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.5, duration: 1 }}
                            className="mb-8 relative"
                        >
                            <div className="absolute inset-0 bg-gold/20 blur-xl rounded-full animate-pulse-slow"></div>
                            <span className="font-heading text-4xl text-[#D4AF37]">SS</span>
                        </motion.div>

                        <h2 className="font-heading text-3xl md:text-5xl text-[#333333] mb-6 leading-tight">
                            Welcome to <br /> Shyamala Sarees
                        </h2>

                        {/* Subtitle */}
                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.9, duration: 0.8 }}
                            className="text-lg text-gray-600 mb-10 font-light"
                        >
                            Royal Sarees for Every Occasion
                        </motion.p>

                        {/* Buttons */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 1.2, duration: 0.8 }}
                            className="flex flex-col gap-4 items-center"
                        >
                            <button
                                onClick={handleShop}
                                className="w-full max-w-xs bg-[#800000] text-white py-4 px-8 rounded-sm hover:bg-[#600000] transition-colors font-medium tracking-wide uppercase text-sm"
                            >
                                Shop Sarees
                            </button>

                            <a
                                href="https://wa.me/919440653443"
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={handleClose}
                                className="w-full max-w-xs border border-[#800000] text-[#800000] py-4 px-8 rounded-sm hover:bg-[#800000]/5 transition-colors font-medium tracking-wide uppercase text-sm"
                            >
                                Order on WhatsApp
                            </a>

                            <button
                                onClick={handleClose}
                                className="mt-4 text-xs text-gray-400 hover:text-gray-600 underline decoration-gray-300 underline-offset-4"
                            >
                                Skip to site
                            </button>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
