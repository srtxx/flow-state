import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { SleepData } from '../../types';
import { ArrowRight, Moon, Zap, Activity } from 'lucide-react';

interface OnboardingModalProps {
    isOpen: boolean;
    onComplete: (data: SleepData) => void;
}

export default function OnboardingModal({ isOpen, onComplete }: OnboardingModalProps) {
    const { t } = useTranslation();
    const [step, setStep] = useState(1);
    const [avgHours, setAvgHours] = useState(7);

    if (!isOpen) return null;

    const handleComplete = () => {
        onComplete({
            avgSleepHours: avgHours,
            lastSleepStart: '23:00',
            lastSleepEnd: '07:00',
            sleepQuality: 'good'
        });
    };

    return (
        <div className="fixed inset-0 bg-white z-[200] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
            <div className="max-w-sm w-full">
                {step === 1 ? (
                    <div className="flex flex-col items-center gap-6">
                        <div className="w-20 h-20 bg-black text-white rounded-3xl flex items-center justify-center mb-4 shadow-2xl">
                            <Activity size={40} />
                        </div>
                        <h1 className="text-4xl font-light tracking-tight">{t('onboarding.title')}</h1>
                        <p className="text-secondary leading-relaxed">
                            {t('onboarding.description')}
                        </p>
                        <div className="grid grid-cols-2 gap-4 w-full mt-8">
                            <div className="p-4 bg-gray-50 rounded-2xl flex flex-col items-center gap-2">
                                <Zap className="text-black" />
                                <span className="text-xs font-bold uppercase tracking-wider">{t('onboarding.boost')}</span>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-2xl flex flex-col items-center gap-2">
                                <Moon className="text-black" />
                                <span className="text-xs font-bold uppercase tracking-wider">{t('onboarding.recover')}</span>
                            </div>
                        </div>
                        <button
                            className="w-full bg-black text-white py-4 rounded-2xl font-bold mt-8 flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
                            onClick={() => setStep(2)}
                        >
                            {t('onboarding.getStarted')} <ArrowRight size={18} />
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-6 animate-in slide-in-from-right duration-300">
                        <h2 className="text-2xl font-bold">{t('onboarding.sleepGoal')}</h2>
                        <p className="text-secondary text-sm">{t('onboarding.sleepQuestion')}</p>

                        <div className="relative w-full py-8">
                            <p className="text-6xl font-light mb-4">{avgHours}<span className="text-xl text-gray-400 ml-1">h</span></p>
                            <input
                                type="range"
                                min="4"
                                max="10"
                                step="0.5"
                                value={avgHours}
                                onChange={(e) => setAvgHours(parseFloat(e.target.value))}
                                className="w-full accent-black h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        <button
                            className="w-full bg-black text-white py-4 rounded-2xl font-bold mt-4"
                            onClick={handleComplete}
                        >
                            {t('onboarding.start')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
