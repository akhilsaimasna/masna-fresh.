import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-[#1B1B1B] text-white pt-16 pb-8 border-t border-[#B08D57]/20">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-center md:text-left">
                    {/* Brand Info */}
                    <div>
                        <h4 className="font-heading text-2xl font-bold mb-6 text-white">Shyamala Sarees</h4>
                        <h4 className="font-heading text-2xl font-bold mb-6 text-white">Shyamala Sarees</h4>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6 font-light">
                            మా ఇంటి నుంచే మీ ఇంటికి. <br />
                            సంప్రదాయం మరియు నమ్మకం మా ప్రత్యేకత.
                        </p>
                        <div className="flex justify-center md:justify-start space-x-4">
                            {/* Social Placeholders */}
                            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#B08D57] transition-colors cursor-pointer">
                                <span className="sr-only">Instagram</span>
                            </div>
                            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#B08D57] transition-colors cursor-pointer">
                                <span className="sr-only">Facebook</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h5 className="text-[#B08D57] font-bold uppercase tracking-widest text-xs mb-6">Collections</h5>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li className="hover:text-[#B08D57] cursor-pointer transition-colors"><Link href="/products">New Arrivals</Link></li>
                            <li className="hover:text-[#B08D57] cursor-pointer transition-colors"><Link href="/products?cat=bridal">Bridal Kanjivaram</Link></li>
                            <li className="hover:text-[#B08D57] cursor-pointer transition-colors"><Link href="/products?cat=silk">Soft Silk</Link></li>
                        </ul>
                    </div>

                    {/* Policies */}
                    <div>
                        <h5 className="text-[#B08D57] font-bold uppercase tracking-widest text-xs mb-6">Support</h5>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li className="hover:text-[#B08D57] cursor-pointer transition-colors">Shipping Policy</li>
                            <li className="hover:text-[#B08D57] cursor-pointer transition-colors">Returns & Exchange</li>
                            <li className="hover:text-[#B08D57] cursor-pointer transition-colors">Terms of Service</li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h5 className="text-[#B08D57] font-bold uppercase tracking-widest text-xs mb-6">Visit Us</h5>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li className="flex flex-col mb-4">
                                <span className="text-white font-medium mb-1">Store Address</span>
                                Kalwakurthy, Telangana 509324
                            </li>
                            <li className="flex flex-col">
                                <span className="text-white font-medium mb-1">WhatsApp Contact</span>
                                <a href="https://wa.me/919440653443" className="hover:text-[#B08D57] transition-colors">
                                    +91 9440653443
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 mt-16 pt-8 text-center text-xs text-gray-500">
                    <p>© {new Date().getFullYear()} Shyamala Sarees. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
