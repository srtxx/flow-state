import { useTranslation } from 'react-i18next';
import { Clock, Moon, TrendingUp, Settings, Coffee, Heart } from 'lucide-react';
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
        <div className="page profile-page pb-24 pt-8">
            <div className="px-6 mb-8 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">{t('profile.title')}</h2>
                    <p className="text-secondary text-sm">{t('profile.subtitle')}</p>
                </div>
                <button
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    onClick={() => showToast('設定機能は開発中です', 'info')}
                >
                    <Settings className="text-secondary" size={24} />
                </button>
            </div>

            {/* Avoid After Card (High Priority) */}
            <div className="mx-4 mb-6 p-6 rounded-3xl bg-[#171717] text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <p className="text-xs font-bold tracking-widest text-gray-400 mb-2 uppercase">{t('profile.limitAfter')}</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-light tracking-tighter">{avoidAfterTime}</span>
                        <span className="text-sm text-gray-400 font-medium">PM</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-4 max-w-[80%] leading-relaxed">
                        {t('profile.limitDescription')}
                    </p>
                </div>
                <Clock
                    className="absolute -bottom-4 -right-4 text-white opacity-5"
                    size={140}
                    strokeWidth={1}
                />
            </div>

            {/* Sleep Section */}
            <div className="mx-4 mb-6">
                <h3 className="text-sm font-bold tracking-widest text-secondary mb-4 px-2 uppercase">{t('profile.sleepAnalysis')}</h3>
                <div className="card-soft">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                            <Moon size={18} className="text-gray-800" />
                            <span className="font-bold text-sm">{t('profile.lastNight')}</span>
                        </div>
                        <button
                            onClick={onSleepClick}
                            className="text-xs font-bold px-3 py-1 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                        >
                            {t('edit')}
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-6">
                        <div>
                            <p className="text-xs text-secondary mb-1 uppercase tracking-wider">{t('sleep.duration')}</p>
                            <p className="text-3xl font-light">{actualSleepHours.toFixed(1)}<span className="text-sm text-secondary ml-1">h</span></p>
                        </div>
                        <div>
                            <p className="text-xs text-secondary mb-1 uppercase tracking-wider">{t('sleep.target')}</p>
                            <p className="text-3xl font-light">{sleepData.avgSleepHours}<span className="text-sm text-secondary ml-1">h</span></p>
                        </div>
                    </div>

                    <div className={`p-4 rounded-xl text-sm ${isSleepSufficient ? 'bg-green-50 text-green-800' : 'bg-orange-50 text-orange-800'}`}>
                        {isSleepSufficient ? (
                            <div className="flex items-center gap-2">
                                <span className="font-bold">{t('profile.goodSleep')}</span>
                                <span>- {t('profile.readyMessage')}</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <span className="font-bold">{t('profile.sleepDebt')}</span>
                                <span>- {t('profile.recoveryMessage')}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="mx-4">
                <h3 className="text-sm font-bold tracking-widest text-secondary mb-4 px-2 uppercase">{t('profile.weeklyTrend')}</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="card-soft p-4">
                        <p className="text-xs text-secondary mb-2">{t('profile.avgAlertness')}</p>
                        <p className="text-2xl font-semibold">84</p>
                        <div className="flex items-center gap-1 text-green-600 text-xs mt-2 font-medium">
                            <TrendingUp size={12} />
                            <span>+5%</span>
                        </div>
                    </div>
                    <div className="card-soft p-4">
                        <p className="text-xs text-secondary mb-2">{t('profile.avgSleep')}</p>
                        <p className="text-2xl font-semibold">7.2<span className="text-sm text-secondary ml-1">h</span></p>
                        <div className="flex items-center gap-1 text-gray-400 text-xs mt-2">
                            <span>Stable</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Support Section */}
            <div className="mx-4 mt-6">
                <a
                    href="https://buymeacoffee.com/bulletlifew"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card-soft flex items-center justify-between p-5 hover:shadow-md transition-shadow cursor-pointer"
                    style={{ background: 'linear-gradient(135deg, #FFF9E6 0%, #FFFDF5 100%)', border: '1px solid #FFD93D' }}
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-400 rounded-full">
                            <Coffee size={20} className="text-yellow-900" />
                        </div>
                        <div>
                            <p className="font-bold text-sm text-gray-800">開発者をサポート</p>
                            <p className="text-xs text-gray-500">Buy Me a Coffee ☕</p>
                        </div>
                    </div>
                    <Heart size={18} className="text-pink-500" />
                </a>
            </div>
        </div>
    );
}
