import React from 'react';

export default function PhotoStandards() {
    return (
        <div className="min-h-screen bg-ivory text-charcoal py-20 px-6 font-sans">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <span className="text-gold uppercase tracking-[0.2em] text-sm font-semibold">Internal Guide</span>
                    <h1 className="font-heading text-5xl text-maroon mt-4 mb-6">Photography Standards</h1>
                    <p className="text-xl text-charcoal/70 font-light">
                        Guidelines for maintaining the "Royal Wedding Luxury" aesthetic.
                    </p>
                </div>

                <div className="grid gap-12">
                    {/* Section 1: Aspect Ratios */}
                    <section className="bg-white p-10 shadow-sm border-t-4 border-gold">
                        <h2 className="font-heading text-3xl text-maroon mb-6">1. Aspect Ratios</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            <div>
                                <div className="aspect-[4/5] bg-gray-100 flex items-center justify-center text-gray-400 mb-4 border border-dashed border-gray-300">
                                    4:5
                                </div>
                                <h3 className="font-bold text-lg mb-2">Product Cards</h3>
                                <p className="text-sm text-gray-600">Vertical portrait mode. Best for sarees on mannequins or models.</p>
                            </div>
                            <div>
                                <div className="aspect-video bg-gray-100 flex items-center justify-center text-gray-400 mb-4 border border-dashed border-gray-300">
                                    16:9
                                </div>
                                <h3 className="font-bold text-lg mb-2">Hero Banners</h3>
                                <p className="text-sm text-gray-600">Wide landscape. Leave "negative space" in the center for text overlay.</p>
                            </div>
                            <div>
                                <div className="aspect-square bg-gray-100 flex items-center justify-center text-gray-400 mb-4 border border-dashed border-gray-300">
                                    1:1
                                </div>
                                <h3 className="font-bold text-lg mb-2">Instagram / Grid</h3>
                                <p className="text-sm text-gray-600">Standard square format for social media integration.</p>
                            </div>
                        </div>
                    </section>

                    {/* Section 2: Vibe & Lighting */}
                    <section className="bg-white p-10 shadow-sm border-t-4 border-maroon">
                        <h2 className="font-heading text-3xl text-maroon mb-6">2. Vibe & Lighting</h2>
                        <ul className="space-y-4">
                            <li className="flex items-start">
                                <span className="text-gold text-2xl mr-4">•</span>
                                <div>
                                    <h4 className="font-bold">Natural Light</h4>
                                    <p className="text-gray-600">Shoot during "Golden Hour" (sunrise/sunset) or near a large window. Avoid harsh flash.</p>
                                </div>
                            </li>
                            <li className="flex items-start">
                                <span className="text-gold text-2xl mr-4">•</span>
                                <div>
                                    <h4 className="font-bold">Minimal Backgrounds</h4>
                                    <p className="text-gray-600">Use plain Ivory, Beige, or textured walls (stone/marble). No cluttered home backgrounds.</p>
                                </div>
                            </li>
                            <li className="flex items-start">
                                <span className="text-gold text-2xl mr-4">•</span>
                                <div>
                                    <h4 className="font-bold">Detail Shots</h4>
                                    <p className="text-gray-600">Capture close-ups of the Zari work (gold threads) and borders.</p>
                                </div>
                            </li>
                        </ul>
                    </section>

                    {/* Section 3: Do's and Don'ts */}
                    <section className="bg-maroon text-ivory p-10 shadow-sm">
                        <h2 className="font-heading text-3xl text-gold mb-6">3. Quick Checklist</h2>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="font-bold text-xl mb-4 border-b border-white/20 pb-2">✅ Do</h3>
                                <ul className="list-disc list-inside space-y-2 text-white/80">
                                    <li>Steam/Iron sarees before shooting.</li>
                                    <li>Use a tripod for sharpness.</li>
                                    <li>Keep the camera lens clean.</li>
                                    <li>Center the subject.</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-bold text-xl mb-4 border-b border-white/20 pb-2">❌ Don't</h3>
                                <ul className="list-disc list-inside space-y-2 text-white/80">
                                    <li>Don't use filters (let the product shine).</li>
                                    <li>Don't shoot in dark rooms.</li>
                                    <li>Don't cut off the borders in wide shots.</li>
                                </ul>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
