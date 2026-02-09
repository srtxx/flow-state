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
        <div className="fixed inset-0 bg-white z-[200] flex flex-col items-center justify-center p-6 sm:p-8 text-center animate-in fade-in duration-500">
            <div className="max-w-sm w-full">
                {step === 1 ? (
                    <div className="flex flex-col items-center gap-6 sm:gap-8">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-black text-white rounded-[2rem] flex items-center justify-center mb-4 sm:mb-6 shadow-2xl hover:scale-105 transition-transform duration-500">
                            <Activity size={40} className="sm:w-12 sm:h-12" strokeWidth={2.5} />
                        </div>
                        <h1 className="text-5xl sm:text-6xl font-bold tracking-tighter leading-tight bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent pb-1">
                            {t('onboarding.title')}
                        </h1>
                        <p className="text-base sm:text-lg text-secondary leading-relaxed px-4 font-medium max-w-md">
                            {t('onboarding.description')}
                        </p>
                        <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full mt-6 sm:mt-8">
                            <div className="p-3 sm:p-4 bg-gray-50 rounded-2xl flex flex-col items-center gap-2">
                                <Zap className="text-black w-5 h-5 sm:w-6 sm:h-6" />
                                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">{t('onboarding.boost')}</span>
                            </div>
                            <div className="p-3 sm:p-4 bg-gray-50 rounded-2xl flex flex-col items-center gap-2">
                                <Moon className="text-black w-5 h-5 sm:w-6 sm:h-6" />
                                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">{t('onboarding.recover')}</span>
                            </div>
                        </div>
                        <button
                            className="w-full bg-black text-white py-3.5 sm:py-4 rounded-2xl font-bold mt-6 sm:mt-8 flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform text-sm sm:text-base"
                            onClick={() => setStep(2)}
                        >
                            {t('onboarding.getStarted')} <ArrowRight size={16} className="sm:w-[18px] sm:h-[18px]" />
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4 sm:gap-6 animate-in slide-in-from-right duration-300">
                        <h2 className="text-xl sm:text-2xl font-bold">{t('onboarding.sleepGoal')}</h2>


                        <div className="relative w-full py-4 sm:py-6">
                            <div className="mb-8">
                                <p className="text-7xl sm:text-8xl font-bold tracking-tighter text-primary flex items-baseline justify-center">
                                    {avgHours}
                                    <span className="text-lg sm:text-2xl text-secondary font-medium ml-2 tracking-normal">h</span>
                                </p>
                            </div>

                            <div className="relative px-2">
                                <input
                                    type="range"
                                    min="4"
                                    max="10"
                                    step="0.5"
                                    value={avgHours}
                                    onChange={(e) => setAvgHours(parseFloat(e.target.value))}
                                    className="w-full accent-black h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="flex justify-between mt-3 text-[10px] sm:text-xs text-secondary font-medium px-1">
                                    <span>4h</span>
                                    <span>5h</span>
                                    <span>6h</span>
                                    <span>7h</span>
                                    <span>8h</span>
                                    <span>9h</span>
                                    <span>10h</span>
                                </div>
                            </div>
                        </div>

                        <button
                            className="w-full bg-black text-white py-3.5 sm:py-4 rounded-2xl font-bold mt-3 sm:mt-4 text-sm sm:text-base"
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
