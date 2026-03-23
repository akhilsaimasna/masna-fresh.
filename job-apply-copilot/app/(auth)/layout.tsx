export const dynamic = 'force-dynamic';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden grid-bg">
            {/* Decorative glow orbs */}
            <div
                className="glow-orb"
                style={{
                    width: 600,
                    height: 600,
                    background: 'var(--color-brand-600)',
                    top: '-20%',
                    right: '-10%',
                }}
            />
            <div
                className="glow-orb"
                style={{
                    width: 400,
                    height: 400,
                    background: 'var(--color-accent-500)',
                    bottom: '-10%',
                    left: '-5%',
                }}
            />

            <div className="relative z-10 w-full max-w-md px-4">{children}</div>
        </div>
    );
}
