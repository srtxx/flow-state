import { useTranslation } from 'react-i18next';
import { Clock, Moon, TrendingUp, TrendingDown, Minus, Settings, Coffee, Heart } from 'lucide-react';
import { useFlowState } from '../context/FlowStateContext';

export default function ProfilePage() {
    const { t } = useTranslation();
    const {
        sleepData,
        actualSleepHours,
        avoidAfterTime,
        setShowSleepInput,
        showToast,
        weeklyStats
    } = useFlowState();

    const onSleepClick = () => setShowSleepInput(true);
    const isSleepSufficient = actualSleepHours >= sleepData.avgSleepHours - 1;

    // Determine trend icon and color
    const getTrendDisplay = (change: number | null) => {
        if (change === null) return null;

        if (change > 0) {
            return {
                icon: <TrendingUp size={12} />,
                color: 'text-green-600',
                text: `+${change}`
            };
        } else if (change < 0) {
            return {
                icon: <TrendingDown size={12} />,
                color: 'text-red-600',
                text: `${change}`
            };
        } else {
            return {
                icon: <Minus size={12} />,
                color: 'text-gray-400',
                text: '0'
            };
        }
    };

    const trendDisplay = getTrendDisplay(weeklyStats.weeklyChange);

    return (
        <div className="page profile-page pb-24 pt-4 sm:pt-6">
            <div className="px-4 sm:px-6 mb-6 sm:mb-8 flex justify-between items-center gap-2">
                <div className="min-w-0 flex-1">
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight truncate text-primary">{t('profile.title')}</h2>
                    <p className="text-secondary text-xs sm:text-sm truncate">{t('profile.subtitle')}</p>
                </div>
                <button
                    className="p-2 rounded-full hover:bg-subtle transition-colors flex-shrink-0 text-secondary hover:text-primary"
                    onClick={() => showToast('設定機能は開発中です', 'info')}
                >
                    <Settings size={20} />
                </button>
            </div>

            {/* Sleep Section (First Priority) */}
            <div className="mx-4 mb-6">
                <h3 className="text-sm font-bold tracking-widest text-secondary mb-4 px-2 uppercase">{t('profile.sleepAnalysis')}</h3>
                <div className="card-soft">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                            <Moon size={16} className="text-secondary" />
                            <span className="font-bold text-xs sm:text-sm text-primary">{t('profile.lastNight')}</span>
                        </div>
                        <button
                            onClick={onSleepClick}
                            className="text-xs font-bold px-3 py-1.5 bg-subtle rounded-full text-secondary hover:text-primary transition-colors hover:bg-white/5 border border-white/5"
                        >
                            {t('edit')}
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-6">
                        <div>
                            <p className="text-xs text-secondary mb-1 uppercase tracking-wider">{t('sleep.duration')}</p>
                            <p className="text-2xl sm:text-3xl font-light text-primary">{actualSleepHours.toFixed(1)}<span className="text-xs sm:text-sm text-secondary ml-1">h</span></p>
                        </div>
                        <div>
                            <p className="text-xs text-secondary mb-1 uppercase tracking-wider">{t('sleep.target')}</p>
                            <p className="text-2xl sm:text-3xl font-light text-primary">{sleepData.avgSleepHours}<span className="text-xs sm:text-sm text-secondary ml-1">h</span></p>
                        </div>
                    </div>

                    <div className={`p-4 rounded-xl text-xs sm:text-sm border ${isSleepSufficient ? 'bg-green-500/5 text-green-400 border-green-500/20' : 'bg-orange-500/5 text-orange-400 border-orange-500/20'}`}>
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

            {/* Avoid After Card (Second Priority) */}
            <div className="mx-4 mb-6 p-6 rounded-3xl bg-card border border-white/10 shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <p className="text-xs font-bold tracking-widest text-secondary mb-2 uppercase">{t('profile.limitAfter')}</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-light tracking-tighter text-primary">{avoidAfterTime}</span>
                        <span className="text-sm text-secondary font-medium">PM</span>
                    </div>
                    <p className="text-xs text-secondary mt-4 max-w-[85%] leading-relaxed opacity-80">
                        {t('profile.limitDescription')}
                    </p>
                </div>
                <Clock
                    className="absolute -bottom-4 -right-4 text-white opacity-[0.03]"
                    size={140}
                    strokeWidth={1}
                />
            </div>

            {/* Support Section (Third Priority) */}
            <div className="mx-4 mb-6">
                <a
                    href="https://buymeacoffee.com/bulletlifew"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card-soft flex items-center justify-between p-4 hover:bg-subtle transition-colors cursor-pointer group border-yellow-400/30"
                >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="p-2 bg-yellow-400/10 rounded-full flex-shrink-0 text-yellow-400 group-hover:bg-yellow-400 group-hover:text-yellow-900 transition-colors">
                            <Coffee size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-bold text-xs sm:text-sm text-primary truncate">開発者をサポート</p>
                            <p className="text-[10px] sm:text-xs text-secondary truncate">Buy Me a Coffee ☕</p>
                        </div>
                    </div>
                    <Heart size={16} className="text-pink-500/70 flex-shrink-0 ml-2 group-hover:text-pink-500" />
                </a>
            </div>

            {/* Stats Overview (Bottom) */}
            <div className="mx-4">
                <h3 className="text-sm font-bold tracking-widest text-secondary mb-4 px-2 uppercase">{t('profile.weeklyTrend')}</h3>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="card-soft p-4">
                        <p className="text-xs text-secondary mb-2 truncate">{t('profile.avgAlertness')}</p>
                        {weeklyStats.thisWeekAvg !== null ? (
                            <>
                                <p className="text-xl sm:text-2xl font-semibold text-primary">{weeklyStats.thisWeekAvg}</p>
                                {trendDisplay && (
                                    <div className={`flex items-center gap-1 text-xs mt-2 font-medium ${trendDisplay.color}`}>
                                        {trendDisplay.icon}
                                        <span>{trendDisplay.text}</span>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-xs sm:text-sm text-secondary mt-2">
                                <p>データ不足</p>
                                <p className="text-[10px] sm:text-xs mt-1 opacity-60">数日使用すると表示されます</p>
                            </div>
                        )}
                    </div>
                    <div className="card-soft p-4">
                        <p className="text-xs text-secondary mb-2 truncate">{t('profile.avgSleep')}</p>
                        {weeklyStats.daysTracked > 0 ? (
                            <>
                                <p className="text-xl sm:text-2xl font-semibold text-primary">{actualSleepHours.toFixed(1)}<span className="text-xs sm:text-sm text-secondary ml-1">h</span></p>
                                <div className="flex items-center gap-1 text-secondary text-xs mt-2 opacity-80">
                                    <span className="truncate">{weeklyStats.daysTracked}日間追跡中</span>
                                </div>
                            </>
                        ) : (
                            <div className="text-xs sm:text-sm text-secondary mt-2">
                                <p>データ不足</p>
                                <p className="text-[10px] sm:text-xs mt-1 opacity-60">数日使用すると表示されます</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
