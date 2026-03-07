"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error: signUpError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                        phone: formData.phone,
                    },
                },
            });

            if (signUpError) throw signUpError;

            // Automatically sign in or show success (Supabase defaults to "check email" if confirm enabled)
            // For this demo, assuming auto-confirm or user manually confirms. 
            // Ideally redirect to a "Verify Email" page or Home if disabled email confirm.

            router.push("/");
            router.refresh();

        } catch (err: any) {
            setError(err.message || "Failed to create account");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
            {/* Left: Branding */}
            <div className="bg-[#1a1a1a] text-white p-12 flex flex-col justify-between relative overflow-hidden">
                <div className="z-10">
                    <h1 className="font-heading text-4xl font-bold mb-2">SHYAMALA</h1>
                    <p className="text-white/60 tracking-widest text-xs">EST. 2024</p>
                </div>

                <div className="z-10 relative">
                    <blockquote className="font-heading text-3xl leading-relaxed mb-6 text-[#D4AF37]">
                        "Join our exclusive community of silk connoisseurs."
                    </blockquote>
                    <p className="opacity-70">Create an account to track orders and get exclusive offers.</p>
                </div>

                {/* Decorative Circle */}
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#800000]/20 rounded-full blur-3xl"></div>
            </div>

            {/* Right: Form */}
            <div className="bg-[#FDFBF7] flex items-center justify-center p-8">
                <div className="w-full max-w-md space-y-8">

                    <div className="bg-white p-8 rounded-xl shadow-sm border border-[#E5E0D8]">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 font-heading">Create Account</h2>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-6 border border-red-100">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSignup} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    required
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all"
                                    placeholder="Seetha Rama"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    required
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all"
                                    placeholder="+91 98765 43210"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all"
                                    placeholder="you@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    minLength={6}
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all"
                                    placeholder="••••••••"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#1a1a1a] text-white font-bold py-3 px-4 rounded-lg hover:bg-black transition-colors md:mt-4"
                            >
                                {loading ? "Creating Account..." : "Create Account"}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                            <p className="text-gray-600">
                                Already have an account?{" "}
                                <Link href="/login" className="text-[#800000] font-bold hover:underline">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
