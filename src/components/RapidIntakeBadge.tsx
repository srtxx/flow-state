import { useTranslation } from 'react-i18next';
import { Zap } from 'lucide-react';

export default function RapidIntakeBadge() {
    const { t } = useTranslation();

    return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-lg">
            <Zap size={14} className="text-amber-600 fill-amber-600" />
            <span className="text-xs font-semibold text-amber-700">
                {t('alerts.rapidIntake.badge')}
            </span>
        </div>
    );
}
