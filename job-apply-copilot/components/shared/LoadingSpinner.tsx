export default function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
    const sizes = {
        sm: 'w-4 h-4 border',
        md: 'w-6 h-6 border-2',
        lg: 'w-10 h-10 border-2',
    };

    return (
        <div className="flex items-center justify-center p-8">
            <div
                className={`${sizes[size]} rounded-full animate-spin`}
                style={{
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderTopColor: 'var(--color-brand-500)',
                }}
            />
        </div>
    );
}
