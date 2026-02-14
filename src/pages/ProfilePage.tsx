import { useTranslation } from 'react-i18next';
import { Clock, Moon, Settings, Coffee, Heart, Shield, FileText } from 'lucide-react';
import { useFlowState } from '../context/FlowStateContext';

interface ProfilePageProps {
    onShowLegal?: (page: 'privacy' | 'terms') => void;
}

export default function ProfilePage({ onShowLegal }: ProfilePageProps) {
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
        <div className="page profile-page pt-6 sm:pt-8 flex flex-col h-full box-border pb-24">
            <div className="px-4 sm:px-6 mb-4 flex justify-end items-center gap-2 flex-shrink-0">
                <button
                    className="p-2 rounded-full hover:bg-subtle transition-colors flex-shrink-0 text-secondary hover:text-primary"
                    onClick={() => showToast(t('settings.inDevelopment', '設定機能は開発中です'), 'info')}
                >
                    <Settings size={20} />
                </button>
            </div>

            <div className="flex-1 px-4 sm:px-6 pb-24 min-h-0 overflow-y-auto">
                <div className="flex flex-col gap-4 sm:gap-6">
                    {/* Sleep Section (First Priority) */}
                    <div className="flex flex-col">
                        <h3 className="text-xs font-bold tracking-widest text-secondary mb-2 px-2 uppercase">{t('profile.sleepAnalysis')}</h3>
                        <div className="card-soft !p-5 flex flex-col gap-6 relative overflow-hidden group">
                            {/* Background Icon */}
                            <Moon
                                className="absolute -top-4 -right-4 text-primary opacity-[0.03] rotate-12 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-6"
                                size={120}
                                strokeWidth={1}
                            />

                            <div className="flex justify-between items-center relative z-10">
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                                    <span className="font-bold text-xs text-secondary tracking-wider uppercase">{t('profile.lastNight')}</span>
                                </div>
                                <button
                                    onClick={onSleepClick}
                                    className="text-[10px] font-bold px-3 py-1.5 bg-subtle rounded-full text-secondary hover:text-primary transition-colors hover:bg-white/5 border border-white/5"
                                >
                                    {t('edit')}
                                </button>
                            </div>

                            <div className="flex flex-col gap-2 relative z-10">
                                <div className="flex items-baseline justify-between px-1">
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-4xl sm:text-5xl font-light text-primary leading-none tracking-tight">
                                            {actualSleepHours.toFixed(1)}
                                        </p>
                                        <p className="text-sm text-secondary font-normal opacity-70">/ {sleepData.avgSleepHours} h</p>
                                    </div>
                                    <div className={`text-xs font-bold px-2 py-1 rounded-lg ${isSleepSufficient ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'}`}>
                                        {Math.round((actualSleepHours / sleepData.avgSleepHours) * 100)}%
                                    </div>
                                </div>

                                {/* Visual Bar */}
                                <div className="h-2 w-full bg-subtle rounded-full overflow-hidden relative mt-2">
                                    <div
                                        className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out ${isSleepSufficient ? 'bg-gradient-to-r from-green-500 to-emerald-400 shadow-[0_0_10px_rgba(34,197,94,0.4)]' : 'bg-gradient-to-r from-orange-500 to-amber-400 shadow-[0_0_10px_rgba(249,115,22,0.4)]'}`}
                                        style={{ width: `${Math.min(100, (actualSleepHours / sleepData.avgSleepHours) * 100)}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className={`p-3 rounded-xl text-xs border relative z-10 backdrop-blur-sm ${isSleepSufficient ? 'bg-green-500/5 text-green-300 border-green-500/10' : 'bg-orange-500/5 text-orange-300 border-orange-500/10'}`}>
                                {isSleepSufficient ? (
                                    <div className="flex items-center gap-2.5">
                                        <Heart size={14} className="text-green-400 fill-green-400/20" />
                                        <span className="font-bold">{t('profile.goodSleep')}</span>
                                        <span className="opacity-80 hidden sm:inline">- {t('profile.readyMessage')}</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2.5">
                                        <Settings size={14} className="text-orange-400" />
                                        <span className="font-bold">{t('profile.sleepDebt')}</span>
                                        <span className="opacity-80 hidden sm:inline">- {t('profile.recoveryMessage')}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Avoid After Card (Second Priority) */}
                    <div className="flex flex-col">
                        <div className="p-5 rounded-2xl bg-card border border-white/10 shadow-lg relative overflow-hidden h-full flex flex-col justify-center min-h-[160px] group transition-all duration-300 hover:border-white/20">
                            <div className="relative z-10">
                                <p className="text-[10px] font-bold tracking-widest text-secondary mb-2 uppercase">{t('profile.limitAfter')}</p>
                                <div className="flex items-baseline gap-1.5 mb-2">
                                    <span className="text-4xl sm:text-5xl font-light tracking-tighter text-primary">{avoidAfterTime}</span>
                                    <span className="text-sm text-secondary font-medium">PM</span>
                                </div>
                                <p className="text-[10px] text-secondary max-w-[90%] leading-relaxed opacity-80">
                                    {t('profile.limitDescription')}
                                </p>
                            </div>
                            <Clock
                                className="absolute -bottom-2 -right-2 text-white opacity-[0.03] transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-12"
                                size={100}
                                strokeWidth={1}
                            />
                        </div>
                    </div>

                    {/* Support Section (Third Priority) */}
                    <div className="flex flex-col">
                        <a
                            href="https://buymeacoffee.com/bulletlifew"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="card-soft flex items-center justify-between p-4 hover:bg-subtle transition-all cursor-pointer group border-yellow-400/30 h-full min-h-[100px] hover:border-yellow-400/50 hover:shadow-[0_0_20px_rgba(250,204,21,0.1)] relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="flex flex-col h-full justify-between relative z-10 w-full">
                                <div className="flex justify-between items-start w-full mb-4">
                                    <div className="p-2.5 bg-yellow-400/10 rounded-full text-yellow-400 group-hover:bg-yellow-400 group-hover:text-yellow-900 transition-colors">
                                        <Coffee size={20} />
                                    </div>
                                    <Heart size={16} className="text-pink-500/70 group-hover:text-pink-500 transition-colors" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-primary mb-1">{t('profile.support.title')}</p>
                                    <p className="text-[10px] text-secondary group-hover:text-primary/80 transition-colors">{t('profile.support.subtitle')}</p>
                                </div>
                            </div>
                        </a>
                    </div>

                    {/* Legal Links */}
                    <div className="flex flex-col gap-2 mt-2">
                        <h3 className="text-xs font-bold tracking-widest text-secondary mb-1 px-2 uppercase">{t('legal.section')}</h3>
                        <button
                            onClick={() => onShowLegal?.('privacy')}
                            className="card-soft flex items-center gap-3 p-3.5 hover:bg-subtle transition-colors text-left"
                        >
                            <Shield size={16} className="text-secondary flex-shrink-0" />
                            <span className="text-xs font-medium text-primary">{t('legal.privacy.title')}</span>
                        </button>
                        <button
                            onClick={() => onShowLegal?.('terms')}
                            className="card-soft flex items-center gap-3 p-3.5 hover:bg-subtle transition-colors text-left"
                        >
                            <FileText size={16} className="text-secondary flex-shrink-0" />
                            <span className="text-xs font-medium text-primary">{t('legal.terms.title')}</span>
                        </button>
                    </div>

                    {/* Amazon Associate Disclosure */}
                    <div className="mt-2 px-2 pb-4">
                        <p className="text-[9px] text-secondary/40 leading-relaxed text-center">
                            {t('legal.amazonDisclosure')}
                        </p>
                    </div>
                </div>
            </div>

        </div>
    );
}
