import { Target, Star, BarChart3, Lightbulb, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { SmartRecommendation } from '../types';

interface SmartRecommendationCardProps {
    recommendation: SmartRecommendation;
    onRecordNow: () => void;
    onRemindLater: () => void;
    onDismiss: () => void;
}

export default function SmartRecommendationCard({
    recommendation,
    onRecordNow,
    onRemindLater,
    onDismiss
}: SmartRecommendationCardProps) {
    const { t } = useTranslation();

    const {
        recommendedTime,
        recommendedAmount,
        reasons,
        predictedEffect,

        type
    } = recommendation;

    const { currentAlertness, predictedAlertness, improvement } = predictedEffect;

    // プログレスバーの幅を計算
    const currentWidth = `${currentAlertness}%`;
    const predictedWidth = `${predictedAlertness}%`;


    // 推奨タイプのラベルを取得
    const getTypeLabel = () => {
        switch (type) {
            case 'afternoon_dip':
                return t('smartRecommendation.types.afternoonDip');
            case 'performance_max':
                return t('smartRecommendation.types.performanceMax');
            default:
                return t('smartRecommendation.types.general');
        }
    };

    return (
        <article
            className="card-soft"
            style={{
                marginBottom: '1rem',
                animation: 'fadeIn 0.3s ease-out',
                transition: 'all var(--transition-base)'
            }}
            aria-label={t('smartRecommendation.title')}
        >
            {/* ヘッダー */}
            <header className="flex items-center gap-2 mb-4">
                <Target size={20} className="text-secondary" aria-hidden="true" />
                <h2 className="text-lg font-bold flex-1">
                    {t('smartRecommendation.title')}
                </h2>
                <button
                    onClick={onDismiss}
                    className="btn-close"
                    aria-label={t('smartRecommendation.actions.dismiss')}
                >
                    <X size={16} />
                </button>
            </header>

            {/* タイプバッジ */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-subtle rounded-full text-xs mb-3">
                <span className="opacity-60">{getTypeLabel()}</span>
            </div>

            {/* 推奨タイミングと量 */}
            <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                    <Star size={18} className="text-accent-primary flex-shrink-0" aria-hidden="true" />
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm text-secondary">
                            {t('smartRecommendation.optimalTiming')}
                        </span>
                        <span className="text-xl font-bold">
                            {recommendedTime}
                        </span>
                    </div>
                </div>
                <div className="text-sm ml-7">
                    <span className="text-secondary">
                        {t('smartRecommendation.recommendedAmount')}:
                    </span>
                    {' '}
                    <span className="font-semibold">{recommendedAmount}mg</span>
                </div>
            </div>

            {/* 予測効果 */}
            <section className="mb-4" aria-labelledby="predicted-effect-heading">
                <div className="flex items-center gap-2 mb-2">
                    <BarChart3 size={18} className="text-secondary flex-shrink-0" aria-hidden="true" />
                    <h3 id="predicted-effect-heading" className="text-sm font-semibold">
                        {t('smartRecommendation.predictedEffect')}
                    </h3>
                </div>

                {/* プログレスバー */}
                <div className="ml-7 space-y-2">
                    {/* 現在の覚醒度 */}
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-secondary">
                                {t('smartRecommendation.current')}
                            </span>
                            <span className="font-semibold">{currentAlertness}</span>
                        </div>
                        <div className="w-full h-1.5 bg-subtle rounded-full overflow-hidden">
                            <div
                                className="h-full bg-text-tertiary rounded-full transition-all duration-300"
                                style={{ width: currentWidth }}
                                role="progressbar"
                                aria-valuenow={currentAlertness}
                                aria-valuemin={0}
                                aria-valuemax={100}
                            />
                        </div>
                    </div>

                    {/* 予測される覚醒度 */}
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-secondary">
                                {t('smartRecommendation.predicted')}
                            </span>
                            <span className="font-semibold">
                                {predictedAlertness}
                                <span
                                    className="ml-1.5"
                                    style={{ color: 'var(--status-good)' }}
                                >
                                    (+{improvement})
                                </span>
                            </span>
                        </div>
                        <div className="w-full h-1.5 bg-subtle rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-300"
                                style={{
                                    width: predictedWidth,
                                    background: 'linear-gradient(90deg, var(--status-good) 0%, rgba(16, 185, 129, 0.6) 100%)'
                                }}
                                role="progressbar"
                                aria-valuenow={predictedAlertness}
                                aria-valuemin={0}
                                aria-valuemax={100}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* 理由 */}
            <section className="mb-4" aria-labelledby="reasons-heading">
                <div className="flex items-center gap-2 mb-2">
                    <Lightbulb size={18} className="text-secondary flex-shrink-0" aria-hidden="true" />
                    <h3 id="reasons-heading" className="text-sm font-semibold">
                        {t('smartRecommendation.reasons')}
                    </h3>
                </div>
                <ul className="ml-7 space-y-2">
                    {reasons.map((reason, index) => (
                        <li key={index} className="text-sm text-secondary flex items-start gap-2">
                            <span className="text-accent-primary mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-accent-primary" aria-hidden="true" />
                            <span className="leading-relaxed">{reason}</span>
                        </li>
                    ))}
                </ul>
            </section>

            {/* アクションボタン */}
            <div className="flex gap-2">
                <button
                    onClick={onRecordNow}
                    className="btn-primary flex-1"
                    aria-label={t('smartRecommendation.actions.recordNow')}
                >
                    {t('smartRecommendation.actions.recordNow')}
                </button>
                <button
                    onClick={onRemindLater}
                    className="btn-ghost px-4"
                    aria-label={t('smartRecommendation.actions.remindLater')}
                >
                    {t('smartRecommendation.actions.remindLater')}
                </button>
            </div>

            {/* アニメーション定義 */}
            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </article>
    );
}
