/* eslint-disable @next/next/no-img-element */
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Hero() {
    return (
        <section className="relative w-full h-[70vh] md:h-[90vh] bg-black overflow-hidden flex items-center justify-center">

            {/* Background Image */}
            <div className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url('/brand/hero-bg-custom.jpg')` }}
            ></div>

            {/* Enhanced Dark Gradient Overlay (Bottom to Center) */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>

            {/* Content Center */}
            <div className="relative z-10 w-full px-4 text-center mt-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="max-w-4xl mx-auto flex flex-col items-center"
                >
                    {/* Main Headings */}
                    <div className="mb-8">
                        <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl font-medium text-white leading-tight drop-shadow-xl">
                            Handpicked Silks,
                        </h1>
                        <h2 className="font-sans text-3xl md:text-5xl lg:text-6xl font-light text-white/90 leading-tight mt-2 drop-shadow-lg">
                            Straight from the Loom
                        </h2>
                    </div>

                    {/* Gold Divider Line */}
                    <div className="w-24 md:w-32 h-[1px] bg-[#B08D57] mb-8"></div>

                    {/* Sub Text */}
                    <p className="font-sans text-white/80 text-sm md:text-base font-light tracking-[0.2em] uppercase mb-12 drop-shadow-md">
                        Kanjivaram • Gadwal • Banarasi • Delivered via WhatsApp
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
                        {/* Primary: WhatsApp */}
                        <a
                            href="https://wa.me/919440653443"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#B08D57] border border-[#B08D57] text-white px-8 py-4 text-xs font-bold uppercase tracking-widest rounded-sm shadow-xl hover:bg-[#967645] hover:border-[#967645] transition-colors duration-300 w-full sm:w-auto text-center"
                        >
                            WhatsApp Order
                        </a>

                        {/* Secondary: Browse Collections */}
                        <Link
                            href="/collections"
                            className="bg-transparent border border-white text-white px-8 py-4 text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-white hover:text-black transition-colors duration-300 w-full sm:w-auto text-center flex items-center justify-center gap-2"
                        >
                            Browse Collections <ArrowRight size={14} />
                        </Link>
                    </div>

                </motion.div>
            </div>
        </section>
    );
}
