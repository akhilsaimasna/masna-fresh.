export default function ShippingPolicyPage() {
    return (
        <div className="min-h-screen bg-white pt-32 pb-20">
            <div className="max-w-3xl mx-auto px-6">
                <h1 className="font-heading text-4xl text-[#800000] mb-2">Shipping Policy</h1>
                <p className="text-[#B08D57] text-sm uppercase tracking-widest mb-10">మా డెలివరీ వివరాలు</p>

                <div className="space-y-10 text-gray-700 leading-relaxed">

                    <section>
                        <h2 className="font-heading text-xl font-bold text-gray-900 mb-3">📦 Order Processing</h2>
                        <p>All orders are processed within <strong>1–3 business days</strong> after your WhatsApp order is confirmed. You will receive updates directly on WhatsApp once your saree is packed and dispatched.</p>
                    </section>

                    <section>
                        <h2 className="font-heading text-xl font-bold text-gray-900 mb-3">🚚 Delivery Time</h2>
                        <ul className="space-y-2 list-disc pl-5">
                            <li><strong>Within Telangana & Andhra Pradesh:</strong> 2–4 business days</li>
                            <li><strong>Rest of India:</strong> 4–7 business days</li>
                            <li><strong>International Orders:</strong> 10–20 business days (varies by location)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="font-heading text-xl font-bold text-gray-900 mb-3">💸 Shipping Charges</h2>
                        <ul className="space-y-2 list-disc pl-5">
                            <li><strong>Free shipping</strong> on orders above ₹2,000 within India</li>
                            <li>Orders below ₹2,000: ₹80–₹150 depending on location</li>
                            <li>International shipping charges will be communicated via WhatsApp</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="font-heading text-xl font-bold text-gray-900 mb-3">📍 Tracking Your Order</h2>
                        <p>Once your order is shipped, we will send you the tracking number directly on WhatsApp. You can use it to track your package on the courier partner's website.</p>
                    </section>

                    <section>
                        <h2 className="font-heading text-xl font-bold text-gray-900 mb-3">📞 Questions?</h2>
                        <p>Reach us anytime on WhatsApp at <a href="https://wa.me/919440653443" className="text-[#800000] font-bold underline">+91 9440653443</a>. We're happy to help!</p>
                    </section>

                </div>

                <div className="mt-14 pt-8 border-t border-gray-100 text-xs text-gray-400 text-center">
                    Shyamala Sarees · Kalwakurthy, Telangana 509324
                </div>
            </div>
        </div>
    );
}
