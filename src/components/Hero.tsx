"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Hero() {
    // Encoded WhatsApp Message
    const whatsappMessage = encodeURIComponent(
        "హాయ్ Shyamala Sarees 😊\n" +
        "నాకు శారీ కావాలి.\n" +
        "👉 బడ్జెట్: ₹____\n" +
        "👉 సందర్భం: పెళ్లి / ఫంక్షన్ / రోజువారీ\n" +
        "👉 కలర్: ____\n" +
        "👉 డెలివరీ ప్రాంతం: ____\n" +
        "మీ దగ్గర ఉన్న best collection పంపండి 🙏"
    );

    return (
        <section className="relative w-full h-[60vh] md:h-[85vh] bg-gray-900 overflow-hidden">

            {/* Background Image */}
            <div className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url('/brand/hero-bg-custom.jpg')` }}
            >
            </div>

            {/* Dark Overlay Gradient */}
            <div className="absolute inset-0 bg-black/40"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 opacity-90"></div>

            {/* Content Center */}
            <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl mx-auto flex flex-col items-center"
                >
                    {/* Eyebrow Label */}
                    <span className="text-[#F2D06B] font-sans text-xs md:text-sm font-bold uppercase tracking-[4px] mb-6 drop-shadow-md">
                        Shyamala Sarees • Kalwakurthy
                    </span>

                    {/* Main Headings */}
                    <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-tight drop-shadow-2xl mb-6">
                        WhatsApp లో <br className="md:hidden" /> శారీ ఎంపిక
                    </h1>

                    {/* Sub Text */}
                    <p className="font-sans text-gray-100 text-base md:text-xl font-light tracking-wide max-w-2xl mb-10 drop-shadow-md opacity-95 leading-relaxed">
                        మీ బడ్జెట్ & సందర్భం చెప్పండి — <br />
                        మీకు సరిపోయే best కలెక్షన్ వెంటనే పంపిస్తాం.
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        {/* Primary: WhatsApp */}
                        <a
                            href={`https://wa.me/919440653443?text=${whatsappMessage}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#B08D57] text-white px-8 py-4 text-sm font-bold uppercase tracking-widest rounded-sm shadow-xl hover:bg-[#967645] hover:scale-105 transition-all duration-300 flex items-center gap-2 min-w-[280px] justify-center"
                        >
                            WhatsApp లో ఆర్డర్ చేయండి
                        </a>

                        {/* Secondary: View Collection */}
                        <Link
                            href="/collections"
                            className="border border-white/40 text-white px-8 py-4 text-sm font-bold uppercase tracking-widest rounded-sm hover:bg-white hover:text-black transition-all duration-300 flex items-center gap-2 min-w-[280px] justify-center"
                        >
                            కలెక్షన్ చూడండి <ArrowRight size={16} />
                        </Link>
                    </div>

                </motion.div>
            </div>
        </section>
    );
}
