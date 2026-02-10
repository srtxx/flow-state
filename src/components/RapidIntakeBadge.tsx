import { useTranslation } from 'react-i18next';
import { Zap } from 'lucide-react';

export default function RapidIntakeBadge() {
    const { t } = useTranslation();

    return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <Zap size={14} className="text-amber-500 fill-amber-500" />
            <span className="text-xs font-semibold text-amber-200">
                {t('alerts.rapidIntake.badge')}
            </span>
        </div>
    );
}
