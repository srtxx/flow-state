import { Bell, X, Zap, Coffee } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AlertnessChart, SmartRecommendationCard } from '../components';
import { useFlowState } from '../context/FlowStateContext';

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

    const onRecordClick = () => setShowIntakeModal(true);

    // Overdose warning limit (FDA suggestion: 400mg)
    const CAFFEINE_LIMIT = 400;
    const isOverLimit = totalCaffeineToday >= CAFFEINE_LIMIT;

    // Status Logic
    let statusText = t('dashboard.status.good');
    let statusColor = "var(--status-good)";

    if (isOverLimit) {
        statusText = t('dashboard.status.overLimit');
        statusColor = "var(--status-critical)";
    } else if (currentAlertness > 80) {
        statusText = t('dashboard.status.peak');
        statusColor = "var(--status-good)";
    } else if (currentAlertness < 40) {
        statusText = t('dashboard.status.low');
        statusColor = "var(--status-warning)";
    }

    return (
        <div className="dashboard-page">
            {/* Hero Section */}
            <div className="score-display-large px-2">
                <span className="score-value-large">{currentAlertness}</span>
                <span className="score-label-small">{t('dashboard.currentAlertness')}</span>

                <div className="status-pill">
                    <div className="status-dot" style={{ backgroundColor: statusColor }} />
                    <span className="text-xs sm:text-sm">{statusText}</span>
                </div>

                {/* Rapid Intake Badge */}
                {/* TODO: Implement rapid intake alert feature
                {rapidIntakeAlert && (
                    <div className="mt-3">
                        <RapidIntakeBadge />
                    </div>
                )}
                */}
            </div>

            {/* Insight / Notification (Floating Pill) */}
            <div className="flex flex-col items-center gap-2 mb-4 px-2">
                {/* Only show critical warnings or valid recommendations */}
                {isOverLimit && (
                    <div className="card-soft flex items-center gap-2 py-2 px-3 sm:px-4 shadow-sm max-w-full">
                        <Bell size={14} color="var(--status-critical)" className="flex-shrink-0" />
                        <span className="text-xs sm:text-sm font-bold text-secondary truncate">制限超過 ({totalCaffeineToday}mg)</span>
                    </div>
                )}

                {!isOverLimit && recommendation && showNotification && (
                    <div
                        className="card-soft flex items-center gap-2 py-2 px-3 sm:px-4 shadow-sm cursor-pointer max-w-full"
                        onClick={() => setShowNotification(false)}
                    >
                        <Zap size={14} color="var(--accent-primary)" className="flex-shrink-0" />
                        <span className="text-xs sm:text-sm truncate">{t('dashboard.recommendation')}: {recommendation.time} ({recommendation.amount}mg)</span>
                        <X size={12} className="text-secondary ml-auto flex-shrink-0" />
                    </div>
                )}
            </div>

            {/* Smart Recommendation Card */}
            {smartRecommendations.length > 0 && (
                <div className="px-2">
                    <SmartRecommendationCard
                        recommendation={smartRecommendations[0]}
                        onRecordNow={() => followRecommendation(smartRecommendations[0])}
                        onRemindLater={() => {
                            // 簡易実装: 30分後にリマインド（今回はトースト通知のみ）
                            dismissRecommendation(smartRecommendations[0].id);
                            alert('30分後にリマインダーを設定しました（簡易実装）');
                        }}
                        onDismiss={() => dismissRecommendation(smartRecommendations[0].id)}
                    />
                </div>
            )}

            {/* Main Visual: Chart */}
            <div className="main-chart-container">
                <div className="chart-container-clean">
                    <AlertnessChart
                        data={alertnessData}
                        intakeRecords={intakeRecords}
                        showBaseline={true}
                        height={280}
                    />
                </div>
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
