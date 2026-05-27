import Link from 'next/link';
import { ArrowRight, ShieldCheck, Zap, UserCheck, Bot } from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="min-h-screen grid-bg relative overflow-hidden flex flex-col">
            {/* Header */}
            <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 md:py-6">
                <div className="flex items-center gap-3">
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{
                            background: 'linear-gradient(135deg, var(--color-brand-600), var(--color-brand-500))',
                        }}
                    >
                        <span className="text-sm">🦾</span>
                    </div>
                    <span className="font-bold text-lg gradient-text">Job Copilot</span>
                </div>
                <nav className="flex items-center gap-4">
                    <Link
                        href="/login"
                        className="text-sm font-medium transition-colors hover:text-white"
                        style={{ color: 'rgba(255,255,255,0.7)' }}
                    >
                        Sign in
                    </Link>
                    <Link href="/signup" className="btn-primary py-2 px-4 shadow-none hover:shadow-lg">
                        Get Started
                    </Link>
                </nav>
            </header>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col items-center justify-center pt-32 pb-20 px-4 z-10 relative">
                {/* Decorative glow orbs */}
                <div
                    className="glow-orb"
                    style={{
                        width: 800,
                        height: 800,
                        background: 'var(--color-brand-600)',
                        top: '10%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        opacity: 0.15,
                    }}
                />

                <div className="max-w-4xl mx-auto text-center relative z-20">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8 text-xs font-medium"
                        style={{
                            background: 'rgba(51, 128, 255, 0.1)',
                            border: '1px solid rgba(51, 128, 255, 0.2)',
                            color: 'var(--color-brand-300)'
                        }}>
                        <SparkleIcon />
                        <span>AI-Powered, Human-Approved</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
                        Apply smarter.<br />
                        <span className="gradient-text">Never lose control.</span>
                    </h1>

                    <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.6)' }}>
                        Job Copilot finds the perfect roles, scores your fit, and builds tailored application kits.
                        Every submission waits for your final approval.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/signup" className="btn-primary text-base px-8 py-4 w-full sm:w-auto text-center shadow-lg shadow-brand-500/20">
                            Start Your Search
                            <ArrowRight size={18} />
                        </Link>
                        <Link href="/login" className="btn-ghost text-base px-8 py-4 w-full sm:w-auto text-center border-white/10 hover:border-white/20">
                            Sign in to Account
                        </Link>
                    </div>
                </div>
            </main>

            {/* Features Section */}
            <section className="py-24 relative z-10" style={{ background: 'rgba(2, 6, 23, 0.4)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Why Job Copilot?</h2>
                        <p style={{ color: 'rgba(255,255,255,0.5)' }}>Built for compliance, trust, and speed.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="glass-card p-8">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ background: 'rgba(51, 128, 255, 0.1)', border: '1px solid rgba(51, 128, 255, 0.2)' }}>
                                <Bot size={24} style={{ color: 'var(--color-brand-400)' }} />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">AI Resume Parsing</h3>
                            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
                                Upload your PDF or DOCX. Our AI extracts your skills, tools, and experience to build a structured profile instantly.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="glass-card p-8">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                <Zap size={24} style={{ color: 'var(--color-accent-400)' }} />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Intelligent Matching</h3>
                            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
                                We scour public APIs for relevant roles and score them against your resume. See exactly why you match, and where your gaps are.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="glass-card p-8">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                                <UserCheck size={24} style={{ color: 'var(--color-warning-500)' }} />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Human-in-the-Loop</h3>
                            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
                                No stealth scraping or ghost applying. Complete control over what gets submitted. Every action requires your explicit approval.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'var(--color-surface-950)' }}>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    &copy; {new Date().getFullYear()} Job Copilot. All rights reserved.
                </p>
            </footer>
        </div>
    );
}

function SparkleIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            <path d="M5 3v4" />
            <path d="M19 17v4" />
            <path d="M3 5h4" />
            <path d="M17 19h4" />
        </svg>
    )
}
