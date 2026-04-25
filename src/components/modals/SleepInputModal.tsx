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

                <div className="flex flex-col gap-6 sm:gap-8">
                    {/* Time Input Section */}
                    <div className="grid grid-cols-2 gap-4 sm:gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-secondary uppercase tracking-wider flex items-center gap-1.5 opacity-70">
                                <Moon size={12} className="text-indigo-400" /> {t('sleep.bedtime')}
                            </label>
                            <div className="relative group">
                                <input
                                    type="time"
                                    value={start}
                                    onChange={(e) => setStart(e.target.value)}
                                    style={{ colorScheme: 'dark' }}
                                    className="w-full bg-subtle text-2xl sm:text-3xl font-medium text-center py-4 rounded-2xl border border-transparent group-hover:border-white/10 focus:border-indigo-500/50 focus:bg-card focus:outline-none transition-all shadow-sm text-primary"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-secondary uppercase tracking-wider flex items-center gap-1.5 opacity-70">
                                <Sun size={12} className="text-orange-400" /> {t('sleep.wakeUp')}
                            </label>
                            <div className="relative group">
                                <input
                                    type="time"
                                    value={end}
                                    onChange={(e) => setEnd(e.target.value)}
                                    style={{ colorScheme: 'dark' }}
                                    className="w-full bg-subtle text-2xl sm:text-3xl font-medium text-center py-4 rounded-2xl border border-transparent group-hover:border-white/10 focus:border-orange-500/50 focus:bg-card focus:outline-none transition-all shadow-sm text-primary"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Quality Selection */}
                    <div>
                        <label className="text-xs font-bold text-secondary uppercase tracking-wider mb-3 block opacity-70">{t('sleep.quality')}</label>
                        <div className="grid grid-cols-3 gap-3">
                            {(['poor', 'fair', 'good'] as const).map((q) => (
                                <button
                                    key={q}
                                    className={`relative p-3 sm:p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-2 group overflow-hidden ${quality === q
                                        ? 'bg-accent-primary text-bg-app border-accent-primary shadow-[0_0_15px_rgba(255,255,255,0.1)] scale-[1.02]'
                                        : 'bg-subtle text-secondary border-transparent hover:bg-white/5 hover:border-white/10 hover:shadow-md'
                                        }`}
                                    onClick={() => setQuality(q)}
                                >
                                    <div className={`p-2 rounded-full transition-colors ${quality === q ? 'bg-black/10' : 'bg-white/5 group-hover:bg-white/10'}`}>
                                        <Star
                                            size={20}
                                            className={`transition-colors sm:w-6 sm:h-6 ${quality === q ? 'text-black fill-black' :
                                                q === 'good' ? 'text-green-400' :
                                                    q === 'fair' ? 'text-yellow-400' : 'text-red-400'
                                                }`}
                                        />
                                    </div>
                                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">{t(`sleep.${q}`)}</span>

                                    {/* Active Helper Text */}
                                    {quality === q && (
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-10 pointer-events-none" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-2 sm:mt-4">
                        <button
                            onClick={onClose}
                            className="btn-secondary flex-1"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            onClick={handleSave}
                            className="btn-primary flex-[2]"
                        >
                            {t('save')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
