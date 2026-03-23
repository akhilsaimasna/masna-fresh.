'use client';

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
}

interface ToastContextType {
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => { } });

export function useToast() {
    return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback(
        (message: string, type: 'success' | 'error' | 'info' = 'success') => {
            const id = Math.random().toString(36).slice(2);
            setToasts((prev) => [...prev, { id, message, type }]);
        },
        []
    );

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

function ToastItem({
    toast,
    onDismiss,
}: {
    toast: Toast;
    onDismiss: (id: string) => void;
}) {
    useEffect(() => {
        const timer = setTimeout(() => onDismiss(toast.id), 4000);
        return () => clearTimeout(timer);
    }, [toast.id, onDismiss]);

    const bgColor =
        toast.type === 'success'
            ? 'rgba(16, 185, 129, 0.9)'
            : toast.type === 'error'
                ? 'rgba(239, 68, 68, 0.9)'
                : 'rgba(51, 128, 255, 0.9)';

    const Icon = toast.type === 'error' ? AlertCircle : CheckCircle;

    return (
        <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-white text-sm font-medium"
            style={{
                background: bgColor,
                backdropFilter: 'blur(10px)',
                animation: 'slideInRight 0.3s ease-out',
                minWidth: 280,
            }}
        >
            <Icon size={16} />
            <span className="flex-1">{toast.message}</span>
            <button
                onClick={() => onDismiss(toast.id)}
                className="opacity-60 hover:opacity-100 transition-opacity"
            >
                <X size={14} />
            </button>
        </div>
    );
}
