"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            router.push("/");
            router.refresh();
        } catch (err: any) {
            setError(err.message || "Failed to login");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
            {/* Left: Branding */}
            <div className="bg-[#800000] text-white p-12 flex flex-col justify-between relative overflow-hidden">
                <div className="z-10">
                    <h1 className="font-heading text-4xl font-bold mb-2">SHYAMALA</h1>
                    <p className="text-white/80 tracking-widest text-xs">PREMIUM SILKS</p>
                </div>

                <div className="z-10 relative">
                    <blockquote className="font-heading text-3xl leading-relaxed mb-6">
                        "Experience the timeless elegance of handwoven traditions."
                    </blockquote>
                    <p className="opacity-70">Log in to view your curated collection.</p>
                </div>

                {/* Decorative Circle */}
                <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
            </div>

            {/* Right: Form */}
            <div className="bg-[#FDFBF7] flex items-center justify-center p-8">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center md:hidden">
                        <h2 className="font-heading text-2xl font-bold text-[#800000]">Welcome Back</h2>
                    </div>

                    <div className="bg-white p-8 rounded-xl shadow-sm border border-[#E5E0D8]">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 font-heading">Sign In</h2>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-6 border border-red-100">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#800000] focus:border-transparent outline-none transition-all"
                                    placeholder="you@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#800000] focus:border-transparent outline-none transition-all"
                                    placeholder="••••••••"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#800000] text-white font-bold py-3 px-4 rounded-lg hover:bg-[#600000] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Signing in..." : "Sign In"}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                            <p className="text-gray-600">
                                Don't have an account?{" "}
                                <Link href="/signup" className="text-[#800000] font-bold hover:underline">
                                    Sign up
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
