import { useTranslation } from 'react-i18next';
import { AlertTriangle, X } from 'lucide-react';
import type { RapidIntakeAlert } from '../types';

interface RapidIntakeAlertDialogProps {
    alert: RapidIntakeAlert;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function RapidIntakeAlertDialog({ alert, onConfirm, onCancel }: RapidIntakeAlertDialogProps) {
    const { t } = useTranslation();

    const isCritical = alert.level === 'critical';
    const bgColor = isCritical ? 'bg-red-500/10' : 'bg-amber-500/10';
    const borderColor = isCritical ? 'border-red-500/20' : 'border-amber-500/20';
    const iconBgColor = isCritical ? 'bg-red-500/20' : 'bg-amber-500/20';
    const iconColor = isCritical ? 'text-red-400' : 'text-amber-400';
    const textColor = isCritical ? 'text-red-200' : 'text-amber-200';
    const buttonColor = isCritical ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700';

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-content max-w-md bg-card border border-white/10" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="modal-header mb-4">
                    <h2 className="modal-title flex items-center gap-2 text-primary">
                        <AlertTriangle size={24} className={iconColor} />
                        {t('alerts.rapidIntake.title')}
                    </h2>
                    <button onClick={onCancel} className="btn-close">
                        <X size={20} />
                    </button>
                </div>

                {/* Main Message */}
                <div className={`${bgColor} border-2 ${borderColor} rounded-2xl p-4 mb-4`}>
                    <div className="flex items-start gap-3">
                        <div className={`p-2 ${iconBgColor} rounded-full ${iconColor} flex-shrink-0 mt-0.5`}>
                            <AlertTriangle size={20} />
                        </div>
                        <div className="flex-1">
                            <p className={`text-sm font-semibold ${textColor} leading-relaxed`}>
                                {t(alert.level === 'critical' ? 'alerts.rapidIntake.critical' : 'alerts.rapidIntake.warning', {
                                    amount: alert.totalAmount
                                })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Risks Section */}
                <div className="mb-4">
                    <h3 className="text-sm font-bold text-primary mb-2">
                        {t('alerts.rapidIntake.risks.title')}
                    </h3>
                    <ul className="space-y-1.5">
                        <li className="text-sm text-secondary flex items-start">
                            <span className="mr-2">•</span>
                            <span>{t('alerts.rapidIntake.risks.heartRate')}</span>
                        </li>
                        <li className="text-sm text-secondary flex items-start">
                            <span className="mr-2">•</span>
                            <span>{t('alerts.rapidIntake.risks.anxiety')}</span>
                        </li>
                        <li className="text-sm text-secondary flex items-start">
                            <span className="mr-2">•</span>
                            <span>{t('alerts.rapidIntake.risks.tremor')}</span>
                        </li>
                        <li className="text-sm text-secondary flex items-start">
                            <span className="mr-2">•</span>
                            <span>{t('alerts.rapidIntake.risks.concentration')}</span>
                        </li>
                    </ul>
                </div>

                {/* Recommendations Section */}
                <div className="mb-6">
                    <h3 className="text-sm font-bold text-primary mb-2">
                        {t('alerts.rapidIntake.recommendations.title')}
                    </h3>
                    <ul className="space-y-1.5">
                        {alert.recommendations.map((rec, index) => (
                            <li key={index} className="text-sm text-secondary flex items-start">
                                <span className="mr-2">✓</span>
                                <span>{rec}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-3 bg-subtle text-text-primary rounded-xl font-semibold hover:bg-white/10 transition-colors"
                    >
                        {t('alerts.rapidIntake.cancelRecord')}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 px-4 py-3 ${buttonColor} text-white rounded-xl font-semibold transition-colors`}
                    >
                        {t('alerts.rapidIntake.understandAndRecord')}
                    </button>
                </div>
            </div>
        </div>
    );
}
