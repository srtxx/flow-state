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
        <div className="page profile-page pb-24 pt-8">
            <div className="px-4 sm:px-6 mb-6 sm:mb-8 flex justify-between items-center gap-2">
                <div className="min-w-0 flex-1">
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight truncate">{t('profile.title')}</h2>
                    <p className="text-secondary text-xs sm:text-sm truncate">{t('profile.subtitle')}</p>
                </div>
                <button
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
                    onClick={() => showToast('設定機能は開発中です', 'info')}
                >
                    <Settings className="text-secondary" size={20} />
                </button>
            </div>

            {/* Avoid After Card (High Priority) */}
            <div className="mx-4 mb-6 p-5 sm:p-6 rounded-3xl bg-[#171717] text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <p className="text-xs font-bold tracking-widest text-gray-400 mb-2 uppercase">{t('profile.limitAfter')}</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl sm:text-5xl font-light tracking-tighter">{avoidAfterTime}</span>
                        <span className="text-sm text-gray-400 font-medium">PM</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-3 sm:mt-4 max-w-[85%] sm:max-w-[80%] leading-relaxed">
                        {t('profile.limitDescription')}
                    </p>
                </div>
                <Clock
                    className="absolute -bottom-4 -right-4 text-white opacity-5"
                    size={120}
                    strokeWidth={1}
                />
            </div>

            {/* Sleep Section */}
            <div className="mx-4 mb-6">
                <h3 className="text-sm font-bold tracking-widest text-secondary mb-4 px-2 uppercase">{t('profile.sleepAnalysis')}</h3>
                <div className="card-soft">
                    <div className="flex justify-between items-center mb-5 sm:mb-6">
                        <div className="flex items-center gap-2">
                            <Moon size={16} className="text-gray-800 sm:w-[18px] sm:h-[18px]" />
                            <span className="font-bold text-xs sm:text-sm">{t('profile.lastNight')}</span>
                        </div>
                        <button
                            onClick={onSleepClick}
                            className="text-xs font-bold px-2.5 sm:px-3 py-1 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                        >
                            {t('edit')}
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-6 sm:gap-8 mb-5 sm:mb-6">
                        <div>
                            <p className="text-xs text-secondary mb-1 uppercase tracking-wider">{t('sleep.duration')}</p>
                            <p className="text-2xl sm:text-3xl font-light">{actualSleepHours.toFixed(1)}<span className="text-xs sm:text-sm text-secondary ml-1">h</span></p>
                        </div>
                        <div>
                            <p className="text-xs text-secondary mb-1 uppercase tracking-wider">{t('sleep.target')}</p>
                            <p className="text-2xl sm:text-3xl font-light">{sleepData.avgSleepHours}<span className="text-xs sm:text-sm text-secondary ml-1">h</span></p>
                        </div>
                    </div>

                    <div className={`p-3 sm:p-4 rounded-xl text-xs sm:text-sm ${isSleepSufficient ? 'bg-green-50 text-green-800' : 'bg-orange-50 text-orange-800'}`}>
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

            {/* Stats Overview */}
            <div className="mx-4">
                <h3 className="text-sm font-bold tracking-widest text-secondary mb-4 px-2 uppercase">{t('profile.weeklyTrend')}</h3>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="card-soft p-3 sm:p-4">
                        <p className="text-xs text-secondary mb-2 truncate">{t('profile.avgAlertness')}</p>
                        {weeklyStats.thisWeekAvg !== null ? (
                            <>
                                <p className="text-xl sm:text-2xl font-semibold">{weeklyStats.thisWeekAvg}</p>
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
                                <p className="text-[10px] sm:text-xs mt-1">数日使用すると表示されます</p>
                            </div>
                        )}
                    </div>
                    <div className="card-soft p-3 sm:p-4">
                        <p className="text-xs text-secondary mb-2 truncate">{t('profile.avgSleep')}</p>
                        {weeklyStats.daysTracked > 0 ? (
                            <>
                                <p className="text-xl sm:text-2xl font-semibold">{actualSleepHours.toFixed(1)}<span className="text-xs sm:text-sm text-secondary ml-1">h</span></p>
                                <div className="flex items-center gap-1 text-gray-400 text-xs mt-2">
                                    <span className="truncate">{weeklyStats.daysTracked}日間追跡中</span>
                                </div>
                            </>
                        ) : (
                            <div className="text-xs sm:text-sm text-secondary mt-2">
                                <p>データ不足</p>
                                <p className="text-[10px] sm:text-xs mt-1">数日使用すると表示されます</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Support Section */}
            <div className="mx-4 mt-6">
                <a
                    href="https://buymeacoffee.com/bulletlifew"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card-soft flex items-center justify-between p-4 sm:p-5 hover:shadow-md transition-shadow cursor-pointer"
                    style={{ background: 'linear-gradient(135deg, #FFF9E6 0%, #FFFDF5 100%)', border: '1px solid #FFD93D' }}
                >
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <div className="p-2 bg-yellow-400 rounded-full flex-shrink-0">
                            <Coffee size={18} className="text-yellow-900 sm:w-5 sm:h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-bold text-xs sm:text-sm text-gray-800 truncate">開発者をサポート</p>
                            <p className="text-[10px] sm:text-xs text-gray-500 truncate">Buy Me a Coffee ☕</p>
                        </div>
                    </div>
                    <Heart size={16} className="text-pink-500 flex-shrink-0 ml-2 sm:w-[18px] sm:h-[18px]" />
                </a>
            </div>
        </div>
    );
}
