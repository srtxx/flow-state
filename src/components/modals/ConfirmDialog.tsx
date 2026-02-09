import { useTranslation } from 'react-i18next';
import { AlertTriangle, Check, X } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message: string;
    isDestructive?: boolean;
    confirmText?: string;
}

export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    isDestructive = false,
    confirmText
}: ConfirmDialogProps) {
    const { t } = useTranslation();

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            {/* Note: Stop propagation to prevent closing when clicking content */}
            <div
                className="modal-content w-full max-w-[300px] sm:max-w-[320px] mx-auto rounded-3xl p-5 sm:p-6 mb-auto mt-[25vh] sm:mt-[30vh]"
                style={{ borderRadius: '24px' /* Override bottom-sheet radius */ }}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex flex-col items-center text-center">
                    {/* Icon */}
                    <div className={`p-3 sm:p-4 rounded-full mb-3 sm:mb-4 ${isDestructive ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-800'}`}>
                        {isDestructive ? <AlertTriangle size={28} className="sm:w-8 sm:h-8" /> : <AlertTriangle size={28} className="sm:w-8 sm:h-8" />}
                    </div>

                    {/* Title */}
                    {title && (
                        <h3 className="text-base sm:text-lg font-bold mb-2">{title}</h3>
                    )}

                    {/* Message */}
                    <p className="text-secondary text-sm sm:text-base mb-6 sm:mb-8 leading-relaxed">
                        {message}
                    </p>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full">
                        <button
                            onClick={onClose}
                            className="btn-secondary py-2.5 sm:py-3 text-xs sm:text-sm"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`btn-primary py-2.5 sm:py-3 text-xs sm:text-sm ${isDestructive ? 'bg-red-500 shadow-red-200' : ''}`}
                            style={isDestructive ? { background: '#EF4444', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' } : {}}
                        >
                            {isDestructive && <X size={16} className="sm:w-[18px] sm:h-[18px]" />}
                            {!isDestructive && <Check size={16} className="sm:w-[18px] sm:h-[18px]" />}
                            <span>{confirmText || t('confirm')}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
