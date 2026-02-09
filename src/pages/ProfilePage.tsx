import { useTranslation } from 'react-i18next';
import { Clock, Moon, Settings, Coffee, Heart } from 'lucide-react';
import { useFlowState } from '../context/FlowStateContext';

export default function ProfilePage() {
    const { t } = useTranslation();
    const {
        sleepData,
        actualSleepHours,
        avoidAfterTime,
        setShowSleepInput,
        showToast
    } = useFlowState();

    const onSleepClick = () => setShowSleepInput(true);
    const isSleepSufficient = actualSleepHours >= sleepData.avgSleepHours - 1;



    return (
        <div className="page profile-page pt-4 sm:pt-6 flex flex-col h-full box-border">
            <div className="px-4 sm:px-6 mb-2 flex justify-end items-center gap-2 flex-shrink-0">
                <button
                    className="p-2 rounded-full hover:bg-subtle transition-colors flex-shrink-0 text-secondary hover:text-primary"
                    onClick={() => showToast(t('settings.inDevelopment', '設定機能は開発中です'), 'info')}
                >
                    <Settings size={20} />
                </button>
            </div>

            <div className="flex flex-col flex-1 px-4 gap-3 min-h-0">
                {/* Sleep Section (First Priority) - Flex 3 */}
                <div className="flex-[3] min-h-0 flex flex-col">
                    <h3 className="text-xs font-bold tracking-widest text-secondary mb-1 px-2 uppercase flex-shrink-0">{t('profile.sleepAnalysis')}</h3>
                    <div className="card-soft !p-3 h-full flex flex-col justify-between mb-0">
                        <div className="flex justify-between items-center mb-2 flex-shrink-0">
                            <div className="flex items-center gap-2">
                                <Moon size={14} className="text-secondary" />
                                <span className="font-bold text-xs text-primary">{t('profile.lastNight')}</span>
                            </div>
                            <button
                                onClick={onSleepClick}
                                className="text-[10px] font-bold px-2.5 py-1 bg-subtle rounded-full text-secondary hover:text-primary transition-colors hover:bg-white/5 border border-white/5"
                            >
                                {t('edit')}
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-2 flex-1 items-center">
                            <div>
                                <p className="text-[10px] text-secondary mb-0.5 uppercase tracking-wider">{t('sleep.duration')}</p>
                                <p className="text-lg sm:text-xl font-light text-primary">{actualSleepHours.toFixed(1)}<span className="text-[10px] sm:text-xs text-secondary ml-0.5">時間</span></p>
                            </div>
                            <div>
                                <p className="text-[10px] text-secondary mb-0.5 uppercase tracking-wider">{t('sleep.target')}</p>
                                <p className="text-lg sm:text-xl font-light text-primary">{sleepData.avgSleepHours}<span className="text-[10px] sm:text-xs text-secondary ml-0.5">時間</span></p>
                            </div>
                        </div>

                        <div className={`p-2 rounded-lg text-xs border flex-shrink-0 ${isSleepSufficient ? 'bg-green-500/5 text-green-400 border-green-500/20' : 'bg-orange-500/5 text-orange-400 border-orange-500/20'}`}>
                            {isSleepSufficient ? (
                                <div className="flex items-center gap-2">
                                    <span className="font-bold">{t('profile.goodSleep')}</span>
                                    <span className="hidden sm:inline">- {t('profile.readyMessage')}</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <span className="font-bold">{t('profile.sleepDebt')}</span>
                                    <span className="hidden sm:inline">- {t('profile.recoveryMessage')}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Avoid After Card (Second Priority) - Flex 3 */}
                <div className="flex-[3] min-h-0 flex flex-col">
                    <div className="p-3 rounded-2xl bg-card border border-white/10 shadow-lg relative overflow-hidden h-full flex flex-col justify-center">
                        <div className="relative z-10">
                            <p className="text-[10px] font-bold tracking-widest text-secondary mb-1 uppercase">{t('profile.limitAfter')}</p>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-3xl font-light tracking-tighter text-primary">{avoidAfterTime}</span>
                                <span className="text-xs text-secondary font-medium">PM</span>
                            </div>
                            <p className="text-[10px] text-secondary mt-1 max-w-[85%] leading-relaxed opacity-80">
                                {t('profile.limitDescription')}
                            </p>
                        </div>
                        <Clock
                            className="absolute -bottom-2 -right-2 text-white opacity-[0.03]"
                            size={100}
                            strokeWidth={1}
                        />
                    </div>
                </div>

                {/* Support Section (Third Priority) - Flex 1 */}
                <div className="flex-[1] min-h-0 flex flex-col mb-4">
                    <a
                        href="https://buymeacoffee.com/bulletlifew"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="card-soft flex items-center justify-between p-4 hover:bg-subtle transition-colors cursor-pointer group border-yellow-400/30 h-full mb-0"
                    >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="p-2 bg-yellow-400/10 rounded-full flex-shrink-0 text-yellow-400 group-hover:bg-yellow-400 group-hover:text-yellow-900 transition-colors">
                                <Coffee size={18} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="font-bold text-xs sm:text-sm text-primary truncate">{t('profile.support.title')}</p>
                                <p className="text-[10px] sm:text-xs text-secondary truncate">{t('profile.support.subtitle')}</p>
                            </div>
                        </div>
                        <Heart size={16} className="text-pink-500/70 flex-shrink-0 ml-2 group-hover:text-pink-500" />
                    </a>
                </div>
            </div>

        </div>
    );
}
