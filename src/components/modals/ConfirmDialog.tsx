import { useTranslation } from 'react-i18next';
import { AlertTriangle, Check, X } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message: string;
    isDestructive?: boolean;
}

export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    isDestructive = false
}: ConfirmDialogProps) {
    const { t } = useTranslation();

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            {/* Note: Stop propagation to prevent closing when clicking content */}
            <div
                className="modal-content w-full max-w-[320px] mx-auto rounded-3xl p-6 mb-auto mt-[30vh]"
                style={{ borderRadius: '24px' /* Override bottom-sheet radius */ }}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex flex-col items-center text-center">
                    {/* Icon */}
                    <div className={`p-4 rounded-full mb-4 ${isDestructive ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-800'}`}>
                        {isDestructive ? <AlertTriangle size={32} /> : <AlertTriangle size={32} />}
                    </div>

                    {/* Title */}
                    {title && (
                        <h3 className="text-lg font-bold mb-2">{title}</h3>
                    )}

                    {/* Message */}
                    <p className="text-secondary mb-8 leading-relaxed">
                        {message}
                    </p>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-3 w-full">
                        <button
                            onClick={onClose}
                            className="btn-secondary py-3 text-sm"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`btn-primary ${isDestructive ? 'bg-red-500 shadow-red-200' : ''}`}
                            style={isDestructive ? { background: '#EF4444', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' } : {}}
                        >
                            {isDestructive && <X size={18} />}
                            {!isDestructive && <Check size={18} />}
                            <span>{t('confirm')}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
