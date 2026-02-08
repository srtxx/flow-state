import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Moon, Sun, Star } from 'lucide-react';
import type { SleepData } from '../../types';

interface SleepInputModalProps {
    isOpen: boolean;
    onClose: () => void;
    sleepData: SleepData;
    onSave: (data: SleepData) => void;
}

export default function SleepInputModal({ isOpen, onClose, sleepData, onSave }: SleepInputModalProps) {
    const { t } = useTranslation();
    const [start, setStart] = useState(sleepData.lastSleepStart);
    const [end, setEnd] = useState(sleepData.lastSleepEnd);
    const [quality, setQuality] = useState(sleepData.sleepQuality);

    useEffect(() => {
        if (isOpen) {
            setStart(sleepData.lastSleepStart);
            setEnd(sleepData.lastSleepEnd);
            setQuality(sleepData.sleepQuality);
        }
    }, [isOpen, sleepData]);

    // ESC key to close modal
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave({
            ...sleepData,
            lastSleepStart: start,
            lastSleepEnd: end,
            sleepQuality: quality
        });
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">{t('sleep.title')}</h2>
                    <button onClick={onClose} className="btn-close">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex flex-col gap-5 sm:gap-6">
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div>
                            <label className="text-xs font-bold text-secondary uppercase tracking-wider mb-2 flex items-center gap-1">
                                <Moon size={12} className="sm:w-[14px] sm:h-[14px]" /> {t('sleep.bedtime')}
                            </label>
                            <input
                                type="time"
                                value={start}
                                onChange={(e) => setStart(e.target.value)}
                                className="input-soft text-lg sm:text-xl font-light text-center"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-secondary uppercase tracking-wider mb-2 flex items-center gap-1">
                                <Sun size={12} className="sm:w-[14px] sm:h-[14px]" /> {t('sleep.wakeUp')}
                            </label>
                            <input
                                type="time"
                                value={end}
                                onChange={(e) => setEnd(e.target.value)}
                                className="input-soft text-lg sm:text-xl font-light text-center"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-secondary uppercase tracking-wider mb-3 block">{t('sleep.quality')}</label>
                        <div className="flex gap-2">
                            {(['poor', 'fair', 'good'] as const).map((q) => (
                                <button
                                    key={q}
                                    className={`flex-1 p-2.5 sm:p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${quality === q
                                        ? 'bg-black text-white border-black shadow-md transform scale-105'
                                        : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'
                                        }`}
                                    onClick={() => setQuality(q)}
                                >
                                    <Star size={18} fill={quality === q ? "white" : "none"} className="sm:w-5 sm:h-5" />
                                    <span className="text-[10px] sm:text-xs font-bold uppercase">{t(`sleep.${q}`)}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 mt-2 sm:mt-4">
                        <button onClick={onClose} className="btn-secondary flex-1">
                            {t('cancel')}
                        </button>
                        <button onClick={handleSave} className="btn-primary flex-1">
                            {t('save')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
