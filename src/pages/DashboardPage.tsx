import { Bell, X, Zap, Coffee } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AlertnessChart } from '../components';
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
            <div className="score-display-large">
                <span className="score-value-large">{currentAlertness}</span>
                <span className="score-label-small">{t('dashboard.currentAlertness')}</span>

                <div className="status-pill">
                    <div className="status-dot" style={{ backgroundColor: statusColor }} />
                    <span>{statusText}</span>
                </div>
            </div>

            {/* Insight / Notification (Floating Pill) */}
            <div className="flex flex-col items-center gap-2 mb-4">
                {/* Only show critical warnings or valid recommendations */}
                {isOverLimit && (
                    <div className="card-soft flex items-center gap-2 py-2 px-4 shadow-sm">
                        <Bell size={14} color="var(--status-critical)" />
                        <span className="text-sm font-bold text-secondary">制限超過 ({totalCaffeineToday}mg)</span>
                    </div>
                )}

                {!isOverLimit && recommendation && showNotification && (
                    <div
                        className="card-soft flex items-center gap-2 py-2 px-4 shadow-sm cursor-pointer"
                        onClick={() => setShowNotification(false)}
                    >
                        <Zap size={14} color="var(--accent-primary)" />
                        <span className="text-sm">{t('dashboard.recommendation')}: {recommendation.time} ({recommendation.amount}mg)</span>
                        <X size={12} className="text-secondary ml-2" />
                    </div>
                )}
            </div>

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
                <Coffee size={28} />
            </button>
        </div>
    );
}
