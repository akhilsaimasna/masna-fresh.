"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function WelcomeOverlay() {
    const [show, setShow] = useState(false);

    useEffect(() => {
        // Show once per session (re-appears if they completely close website and come back)
        const hasSeen = sessionStorage.getItem("shyamala_splash_played");
        
        if (!hasSeen) {
            setShow(true);
            document.body.style.overflow = "hidden";
            
            // Auto close after 3.5 seconds
            const timer = setTimeout(() => {
                setShow(false);
                document.body.style.overflow = "auto";
                sessionStorage.setItem("shyamala_splash_played", "true");
            }, 3500);

            return () => {
                clearTimeout(timer);
                document.body.style.overflow = "auto";
            };
        }
    }, []);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 1.5, ease: "easeInOut" } }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-[#111111] text-white"
                >
                    <div className="relative text-center p-8 max-w-lg w-full flex flex-col items-center">
                        {/* Animated Monogram */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 1.2, ease: "easeOut" }}
                            className="mb-8 relative"
                        >
                            <span className="font-heading text-6xl md:text-7xl text-[#B08D57]">S<span className="text-white">S</span></span>
                        </motion.div>

                        <motion.h2 
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8, duration: 1 }}
                            className="font-heading text-3xl md:text-4xl text-white mb-6 tracking-widest uppercase"
                        >
                            Shyamala Sarees
                        </motion.h2>

                        {/* Subtitle */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 1.4, duration: 1 }}
                            className="flex items-center gap-4 text-[#B08D57]"
                        >
                            <div className="h-[1px] w-8 bg-[#B08D57]/50"></div>
                            <p className="text-xs md:text-sm uppercase tracking-[0.4em] font-medium">
                                Est. In Kalwakurthy
                            </p>
                            <div className="h-[1px] w-8 bg-[#B08D57]/50"></div>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
