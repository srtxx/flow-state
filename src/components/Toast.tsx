import { useEffect } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';

export interface ToastData {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
}

interface ToastProps {
    toast: ToastData;
    onDismiss: (id: string) => void;
}

function Toast({ toast, onDismiss }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss(toast.id);
        }, 3000);
        return () => clearTimeout(timer);
    }, [toast.id, onDismiss]);

    const bgColor = toast.type === 'success'
        ? 'bg-card/90 border-green-900/50 text-green-200'
        : toast.type === 'error'
            ? 'bg-card/90 border-red-900/50 text-red-200'
            : 'bg-card/90 border-blue-900/50 text-blue-200';

    const iconColor = toast.type === 'success'
        ? 'text-green-500'
        : toast.type === 'error'
            ? 'text-red-500'
            : 'text-blue-500';

    const Icon = toast.type === 'success' ? Check : toast.type === 'error' ? AlertCircle : AlertCircle;

    return (
        <div
            className={`toast-item flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-3 sm:py-4 rounded-xl sm:rounded-2xl border shadow-2xl backdrop-blur-md ${bgColor}`}
            style={{
                animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
        >
            <Icon size={18} className={`${iconColor} sm:w-5 sm:h-5 flex-shrink-0`} strokeWidth={2.5} />
            <span className="text-xs sm:text-sm font-bold tracking-wide flex-1 min-w-0 truncate">{toast.message}</span>
            <button
                onClick={() => onDismiss(toast.id)}
                className="ml-1 sm:ml-2 text-gray-400 hover:text-gray-300 transition-colors bg-transparent p-1 rounded-full hover:bg-white/10 flex-shrink-0"
            >
                <X size={14} className="sm:w-4 sm:h-4" />
            </button>
        </div>
    );
}

interface ToastContainerProps {
    toasts: ToastData[];
    onDismiss: (id: string) => void;
}

export default function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
    return (
        <div
            className="toast-container fixed top-4 sm:top-6 left-1/2 transform -translate-x-1/2 z-[300] flex flex-col gap-2 sm:gap-3 w-full max-w-[95%] sm:max-w-sm pointer-events-none px-2"
        >
            <div className="flex flex-col gap-2 sm:gap-3 pointer-events-auto">
                {toasts.map(toast => (
                    <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
                ))}
            </div>
        </div>
    );
}
