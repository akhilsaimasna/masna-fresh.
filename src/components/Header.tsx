"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useState, useEffect } from "react";
import { Search, ShoppingBag, Menu, X, User, Phone, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { COLLECTIONS, OTHER_CATEGORIES } from "@/data/collections";

export default function Header() {
  const { cartCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sareesMenuOpen, setSareesMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm">

        {/* Top Strip - Contact & Offers */}
        <div className="bg-black text-white text-[10px] md:text-xs py-2 text-center tracking-widest uppercase font-medium">
          Worldwide Shipping • Free Returns in India • <a href="https://wa.me/919440653443" className="hover:text-gray-300 ml-2">WhatsApp: 9440653443</a>
        </div>

        {/* Main Header */}
        <div className="container mx-auto px-4 md:px-8 h-20 flex items-center justify-between">

          {/* Mobile Menu Icon */}
          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(true)}>
            <Menu size={24} className="text-black" />
          </button>

          {/* Logo */}
          <Link href="/" className="text-center md:text-left z-20">
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-black tracking-wider uppercase">
              Shyamala
            </h1>
            <p className="text-[9px] text-gray-500 uppercase tracking-[0.2em] -mt-1 hidden md:block">
              మా ఇంటి నుంచే మీ ఇంటికి.
            </p>
          </Link>

          {/* Desktop Navigation - Centered Mega Menu */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-sm font-medium uppercase tracking-wide text-gray-700 hover:text-black transition-colors">
              Home
            </Link>

            {/* Collections Mega Menu Trigger */}
            <div
              className="relative group"
              onMouseEnter={() => setSareesMenuOpen(true)}
              onMouseLeave={() => setSareesMenuOpen(false)}
            >
              <button className="flex items-center gap-1 text-sm font-medium uppercase tracking-wide text-gray-700 hover:text-black transition-colors py-6">
                Sarees (శారీలు) <ChevronDown size={14} />
              </button>

              {/* Mega Menu Dropdown */}
              <AnimatePresence>
                {sareesMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-1/2 transform -translate-x-1/2 w-[800px] bg-white shadow-xl border-t border-gray-100 p-8 grid grid-cols-3 gap-y-4 gap-x-8 rounded-b-lg z-50 max-h-[70vh] overflow-y-auto"
                  >
                    {COLLECTIONS.map((col) => (
                      <Link
                        key={col.slug}
                        href={`/collections/${col.slug}`}
                        className="group flex flex-col"
                      >
                        <span className="text-sm font-medium text-gray-800 group-hover:text-[#B08D57] transition-colors">
                          {col.name}
                        </span>
                        <span className="text-xs text-gray-400 font-light group-hover:text-[#B08D57]/70">
                          {col.telugu}
                        </span>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {OTHER_CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/collections/${cat.slug}`}
                className="text-sm font-medium uppercase tracking-wide text-gray-700 hover:text-black transition-colors"
              >
                {cat.name}
              </Link>
            ))}

            <Link href="/orders" className="text-sm font-medium uppercase tracking-wide text-gray-700 hover:text-black transition-colors">
              My Orders
            </Link>
            <Link href="/collections/sale" className="text-sm font-medium uppercase tracking-wide text-red-700 hover:text-red-900 transition-colors">
              Sale
            </Link>
          </nav>

          {/* Icons */}
          <div className="flex items-center space-x-5 z-20">
            <button className="hidden md:block text-black hover:text-gray-600 transition-colors">
              <Search size={20} strokeWidth={1.5} />
            </button>
            <Link href="/cart" className="relative text-black hover:text-gray-600 transition-colors">
              <ShoppingBag size={20} strokeWidth={1.5} />
              {mounted && cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Spacer for Fixed Header */}
      <div className="h-[104px]"></div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed inset-0 z-[60] bg-white flex flex-col md:hidden overflow-y-auto"
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <span className="font-heading text-xl font-bold">Menu</span>
              <button onClick={() => setMobileMenuOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <nav className="flex flex-col p-6 space-y-6">
              <Link href="/" className="text-lg font-bold uppercase border-b border-gray-100 pb-2" onClick={() => setMobileMenuOpen(false)}>
                Home
              </Link>

              <div className="flex flex-col space-y-4">
                <span className="text-sm font-bold text-[#B08D57] uppercase tracking-widest">Sarees Collection</span>
                {COLLECTIONS.map((col) => (
                  <Link
                    key={col.slug}
                    href={`/collections/${col.slug}`}
                    className="text-base text-gray-700 flex flex-col"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>{col.name}</span>
                    <span className="text-xs text-gray-400">{col.telugu}</span>
                  </Link>
                ))}
              </div>

              <div className="border-t border-gray-100 my-4"></div>

              {OTHER_CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/collections/${cat.slug}`}
                  className="text-lg font-medium text-black"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {cat.name}
                </Link>
              ))}

              <Link
                href="/orders"
                className="text-lg font-medium text-black"
                onClick={() => setMobileMenuOpen(false)}
              >
                My Orders
              </Link>
            </nav>

            <div className="mt-auto p-6 bg-gray-50">
              <p className="text-gray-500 text-sm mb-2">Concierge</p>
              <a href="https://wa.me/919440653443" className="text-lg font-bold flex items-center gap-2">
                <Phone size={18} /> +91 9440 653 443
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
