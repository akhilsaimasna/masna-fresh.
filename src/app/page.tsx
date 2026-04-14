import Hero from "@/components/Hero";
import WelcomeOverlay from "@/components/WelcomeOverlay";
import ProductCarousel from "@/components/ProductCarousel";
import { getProducts, getBestSellers } from "@/actions/products";
import { COLLECTIONS } from "@/data/collections";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default async function Home() {
  // Fetch real data from Supabase
  const newArrivals = await getProducts(undefined, 'new-arrivals', 4);
  const bestSellers = await getBestSellers(4);

  return (
    <div className="min-h-screen bg-white text-black font-sans flex flex-col">
      <WelcomeOverlay />
      <main className="flex-grow">
        <Hero />

        {/* SHOP BY COLLECTION GRID */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-3 text-center text-charcoal">
              Curated Collections
            </h2>
            <p className="text-gray-500 mb-12 font-light text-center max-w-2xl mx-auto uppercase tracking-widest text-xs">
              Handpicked traditional weaves
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {COLLECTIONS.map((col) => (
                <Link
                  key={col.slug}
                  href={`/collections/${col.slug}`}
                  className="group relative h-[320px] w-full overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 block"
                >
                  {/* Background Image with Zoom Effect */}
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
                    style={{ backgroundImage: `url('${col.image || "/brand/kanjivaram-hero.jpg"}')` }}
                  ></div>

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>

                  {/* Content */}
                  <div className="absolute inset-0 p-8 flex flex-col justify-end">

                    {/* Telugu Translation */}
                    <span className="text-[#F2D06B] font-medium text-sm mb-1 opacity-90 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 delay-100 block">
                      {col.telugu}
                    </span>

                    {/* English Title */}
                    <h3 className="text-white font-heading text-2xl md:text-3xl font-bold tracking-wide mb-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                      {col.name}
                    </h3>

                    {/* CTA */}
                    <div className="flex items-center gap-2 text-white/90 text-xs font-bold uppercase tracking-widest group-hover:text-[#F2D06B] transition-colors">
                      <span className="border-b border-transparent group-hover:border-[#F2D06B] pb-0.5 transition-all">
                        View Collection
                      </span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-16 text-center">
              <Link href="/collections" className="inline-flex items-center gap-2 px-8 py-3 bg-charcoal text-white text-sm font-bold uppercase tracking-widest hover:bg-[#B08D57] transition-colors rounded-sm">
                View Full Catalog
              </Link>
            </div>
          </div>
        </section>

        {/* OUR STORY SECTION */}
        <section className="py-20 bg-[#FAF7F2]">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
              
              {/* Left Image */}
              <div className="w-full lg:w-1/2 relative h-[400px] md:h-[500px] lg:h-[600px] rounded-sm overflow-hidden shadow-xl">
                <Image 
                  src="/brand/kanjivaram-hero.jpg" 
                  alt="Shyamala Sarees Collection" 
                  fill 
                  className="object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* Right Content */}
              <div className="w-full lg:w-1/2 flex flex-col justify-center text-center lg:text-left">
                <span className="text-[#B08D57] font-bold text-xs uppercase tracking-[0.3em] mb-4 block">
                  Est. In Kalwakurthy
                </span>
                
                <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl text-[#1a1a1a] leading-tight mb-8">
                  A Family Tradition,<br className="hidden lg:block"/> Delivered to Your Door
                </h2>
                
                <p className="text-gray-600 font-light text-lg leading-relaxed mb-10 max-w-xl mx-auto lg:mx-0">
                  Shyamala Sarees is a family store from Kalwakurthy, Telangana, run by my mother Shyamala with love and dedication. For over two decades, she has been handpicking the finest silk sarees — Kanjivaram, Gadwal, Banarasi — directly from weavers. We bring you authentic, heirloom-quality sarees at honest prices, delivered personally via WhatsApp.
                </p>
                
                <div className="flex justify-center lg:justify-start">
                  <a 
                    href="https://wa.me/919440653443" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-8 py-4 border border-[#B08D57] text-[#B08D57] hover:bg-[#B08D57] hover:text-white transition-colors duration-300 rounded-sm font-bold uppercase tracking-widest text-sm"
                  >
                    Chat With Us on WhatsApp
                  </a>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* CAROUSELS */}
        <ProductCarousel title="New Arrivals" products={newArrivals} viewAllLink="/collections/new-arrivals" />

        <ProductCarousel title="Best Sellers" products={bestSellers} viewAllLink="/collections/best-sellers" />



        {/* Personal Saree Styling Service */}
        <section className="py-20 bg-[#FAF7F2] border-t border-gold/10">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <span className="text-gold text-xs uppercase tracking-[0.3em] font-medium mb-4 block">Concierge Service</span>
            <h2 className="font-heading text-4xl md:text-5xl text-charcoal mb-6">Personal Saree Styling</h2>
            <p className="text-charcoal/60 text-lg mb-10 leading-relaxed font-light">
              Tell us your budget & occasion. We’ll share curated picks from our exclusive store collection in minutes.
              <br className="hidden md:block" /> Experience the luxury of shopping from home using WhatsApp.
            </p>
            <a
              href="https://wa.me/919440653443?text=Hi%20Shyamala%20Sarees,%20I%20would%20like%20personal%20styling%20assistance."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-12 px-8 bg-charcoal text-white text-sm font-medium tracking-widest uppercase hover:bg-gold transition-colors duration-500 rounded-sm"
            >
              Chat on WhatsApp
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
