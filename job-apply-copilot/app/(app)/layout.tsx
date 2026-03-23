import Sidebar from '@/components/shared/Sidebar';
import Navbar from '@/components/shared/Navbar';
import { ToastProvider } from '@/components/shared/Toast';

// All authenticated pages require Supabase env vars at runtime
export const dynamic = 'force-dynamic';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <ToastProvider>
            <div className="min-h-screen grid-bg">
                <Sidebar />
                <div style={{ marginLeft: 240 }}>
                    <Navbar />
                    <main className="p-8">{children}</main>
                </div>
            </div>
        </ToastProvider>
    );
}
