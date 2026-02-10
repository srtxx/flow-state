import { Bell, X, Zap, Coffee } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AlertnessChart } from '../components';
import { useFlowState } from '../context/FlowStateContext';
import { estimateCaffeineAtSleep, getCurrentTimeString, CHART_START_HOUR } from '../lib/caffeine';

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
        followRecommendation,
    } = useFlowState();

    // Filter records to show only those within the chart's 24h window (starting at CHART_START_HOUR)
    // The chart goes from CHART_START_HOUR today to CHART_START_HOUR tomorrow
    const visibleRecords = intakeRecords.filter(record => {
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


    // Calculate Active Caffeine (approximate remaining in body now)
    // Only consider records from the last 24 hours (caffeine half-life is ~5 hours, so 24h is safe)
    const last24Hours = Date.now() - (24 * 60 * 60 * 1000);
    const recentRecords = intakeRecords.filter(r => r.timestamp >= last24Hours);
    const activeCaffeine = Math.round(recentRecords.reduce((sum, record) => {
        return sum + estimateCaffeineAtSleep(record.amount, record.time, getCurrentTimeString());
    }, 0));

    // Get current recommendation to display
    const currentRecommendation = smartRecommendations.length > 0 ? smartRecommendations[0] : null;

    return (
        <div className="dashboard-page pb-24 space-y-4 sm:space-y-6">
            {/* Header: Score & Status */}
            <div className="flex flex-wrap items-end justify-between px-4 pt-4 sm:pt-6 gap-y-4">
                <div>
                    <div className="flex items-baseline gap-2 sm:gap-3">
                        <span className="text-6xl sm:text-7xl md:text-8xl font-bold tracking-tighter text-primary leading-none">{Math.round(currentAlertness)}</span>
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
                {/* Recommendation Tile (Replacing Peak Time) */}
                <button
                    className={`card-soft !p-3 flex flex-col items-center justify-center gap-1 transition-colors ${currentRecommendation
                        ? 'bg-accent-primary/5 hover:bg-accent-primary/10 border-accent-primary/20 cursor-pointer'
                        : 'opacity-50 cursor-default'
                        }`}
                    onClick={() => currentRecommendation && followRecommendation(currentRecommendation)}
                    disabled={!currentRecommendation}
                >
                    <Zap size={16} className={currentRecommendation ? "text-accent-primary mb-1" : "text-secondary mb-1"} />
                    <span className="text-[10px] text-secondary uppercase font-bold tracking-wider">{t('dashboard.recommendation')}</span>
                    <span className={`text-lg font-bold ${currentRecommendation ? "text-accent-primary" : "text-secondary"}`}>
                        {currentRecommendation ? currentRecommendation.recommendedTime : '--:--'}
                    </span>
                    {currentRecommendation && (
                        <span className="text-[10px] text-secondary font-medium">{currentRecommendation.recommendedAmount}mg</span>
                    )}
                </button>

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
