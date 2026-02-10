import { Bell, X, Zap, Coffee, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AlertnessChart, SmartRecommendationCard } from '../components';
import { useFlowState } from '../context/FlowStateContext';
import { estimateCaffeineAtSleep, getCurrentTimeString, timeToDecimalHours, CHART_START_HOUR } from '../lib/caffeine';

export default function DashboardPage() {
    const { t } = useTranslation();
    const {
        alertnessData,
        currentAlertness,
        intakeRecords,
        showNotification,
        setShowNotification,
        setShowIntakeModal,
        totalCaffeineToday,
        recommendation,
        smartRecommendations,
        dismissRecommendation,
        followRecommendation,
    } = useFlowState();

    // Filter records to show only those within the chart's 24h window (starting at CHART_START_HOUR)
    // The chart goes from CHART_START_HOUR today to CHART_START_HOUR tomorrow
    const visibleRecords = intakeRecords.filter(record => {
        const recordTime = timeToDecimalHours(record.time);
        const now = new Date();
        const currentHour = now.getHours() + now.getMinutes() / 60;

        // Determine the start time of the chart window relative to now
        // If current time < CHART_START_HOUR, we are in the "early morning" of the chart started yesterday
        // If current time >= CHART_START_HOUR, we are in the chart started today
        const isEarlyMorning = currentHour < CHART_START_HOUR;
        const chartStartTimestamp = new Date();
        chartStartTimestamp.setHours(CHART_START_HOUR, 0, 0, 0);

        if (isEarlyMorning) {
            // Chart started yesterday at 6:00 AM
            chartStartTimestamp.setDate(chartStartTimestamp.getDate() - 1);
        }

        // Compare record timestamp
        return record.timestamp >= chartStartTimestamp.getTime();
    });

    const onRecordClick = () => setShowIntakeModal(true);

    // Overdose warning limit (FDA suggestion: 400mg)
    const CAFFEINE_LIMIT = 400;
    const isOverLimit = totalCaffeineToday >= CAFFEINE_LIMIT;

    // Status Logic
    let statusText = t('dashboard.status.good');

    if (isOverLimit) {
        statusText = t('dashboard.status.overLimit');
    } else if (currentAlertness > 80) {
        statusText = t('dashboard.status.peak');
    } else if (currentAlertness < 40) {
        statusText = t('dashboard.status.low');
    }

    // Calculate Peak Time
    const getPeakTime = () => {
        if (!alertnessData || alertnessData.length === 0) return '--:--';
        const max = Math.max(...alertnessData.map(d => d.total));
        const peak = alertnessData.find(d => d.total === max);
        return peak ? peak.time : '--:--';
    };
    const peakTimeStr = getPeakTime();

    // Calculate Active Caffeine (approximate remaining in body now)
    const activeCaffeine = Math.round(intakeRecords.reduce((sum, record) => {
        return sum + estimateCaffeineAtSleep(record.amount, record.time, getCurrentTimeString());
    }, 0));

    return (
        <div className="dashboard-page pb-24 space-y-4 sm:space-y-6">
            {/* Header: Score & Status */}
            <div className="flex items-end justify-between px-4 pt-4 sm:pt-6">
                <div>
                    <div className="flex items-baseline gap-2 sm:gap-3">
                        <span className="text-7xl sm:text-8xl font-bold tracking-tighter text-primary leading-none">{Math.round(currentAlertness)}</span>
                        <span className="text-xs sm:text-sm font-bold text-secondary uppercase tracking-wider mb-2">{t('dashboard.currentAlertness')}</span>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1 mb-2">
                    <div className={`px-3 py-1.5 rounded-full flex items-center gap-2 border ${isOverLimit ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                        currentAlertness > 80 ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                            currentAlertness < 40 ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                                'bg-blue-500/10 text-blue-500 border-blue-500/20'
                        }`}>
                        <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
                        <span className="text-xs sm:text-sm font-bold">{statusText}</span>
                    </div>
                </div>
            </div>

            {/* Main Visual: Chart */}
            <div className="w-full px-0 sm:px-2">
                <div className="chart-container-clean h-[240px] sm:h-[280px]">
                    <AlertnessChart
                        data={alertnessData}
                        intakeRecords={visibleRecords}
                        showBaseline={true}
                        height={280}
                    />
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-3 px-4">
                <div className="card-soft !p-3 flex flex-col items-center justify-center gap-1 hover:bg-subtle transition-colors">
                    <Clock size={16} className="text-secondary mb-1" />
                    <span className="text-[10px] text-secondary uppercase font-bold tracking-wider">{t('dashboard.stats.peakTime')}</span>
                    <span className="text-lg font-bold text-primary">{peakTimeStr}</span>
                </div>
                <div className="card-soft !p-3 flex flex-col items-center justify-center gap-1 hover:bg-subtle transition-colors">
                    <Zap size={16} className="text-secondary mb-1" />
                    <span className="text-[10px] text-secondary uppercase font-bold tracking-wider">{t('dashboard.stats.activeCaffeine')}</span>
                    <span className="text-lg font-bold text-primary">{activeCaffeine}<span className="text-xs text-secondary ml-0.5">mg</span></span>
                </div>
                <div className="card-soft !p-3 flex flex-col items-center justify-center gap-1 hover:bg-subtle transition-colors">
                    <Coffee size={16} className="text-secondary mb-1" />
                    <span className="text-[10px] text-secondary uppercase font-bold tracking-wider">{t('dashboard.stats.dailyTotal')}</span>
                    <span className="text-lg font-bold text-primary">{totalCaffeineToday}<span className="text-xs text-secondary ml-0.5">mg</span></span>
                </div>
            </div>

            {/* Insight / Notification (Floating Pill) */}
            <div className="flex flex-col items-center gap-2 px-4">
                {/* Only show critical warnings or valid recommendations */}
                {isOverLimit && (
                    <div className="card-soft flex items-center gap-2 py-3 px-4 shadow-sm w-full bg-red-500/5 border-red-500/20">
                        <Bell size={16} className="text-red-500 flex-shrink-0" />
                        <span className="text-xs sm:text-sm font-bold text-red-500 truncate">制限超過 ({totalCaffeineToday}mg)</span>
                    </div>
                )}

                {!isOverLimit && recommendation && showNotification && (
                    <div
                        className="card-soft flex items-center gap-3 py-3 px-4 shadow-sm cursor-pointer w-full hover:bg-subtle transition-colors"
                        onClick={() => setShowNotification(false)}
                    >
                        <div className="p-1.5 bg-accent-primary/10 rounded-full text-accent-primary">
                            <Zap size={14} className="flex-shrink-0" />
                        </div>
                        <span className="text-xs sm:text-sm font-medium truncate flex-1">{t('dashboard.recommendation')}: {recommendation.time} ({recommendation.amount}mg)</span>
                        <X size={14} className="text-secondary ml-auto flex-shrink-0 hover:text-primary" />
                    </div>
                )}
            </div>

            {/* Smart Recommendation Card */}
            {smartRecommendations.length > 0 && (
                <div className="px-4 pb-4">
                    <SmartRecommendationCard
                        recommendation={smartRecommendations[0]}
                        onRecordNow={() => followRecommendation(smartRecommendations[0])}
                        onRemindLater={() => {
                            dismissRecommendation(smartRecommendations[0].id);
                            alert('30分後にリマインダーを設定しました（簡易実装）');
                        }}
                        onDismiss={() => dismissRecommendation(smartRecommendations[0].id)}
                    />
                </div>
            )}

            {/* Floating Action Button */}
            <button
                onClick={onRecordClick}
                className="fab-button"
                aria-label={t('intake.title')}
            >
                <Coffee size={24} className="sm:w-7 sm:h-7" />
            </button>
        </div>
    );
}
