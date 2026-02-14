import { useTranslation } from 'react-i18next';
import { Shield, ArrowLeft } from 'lucide-react';

interface LegalPageProps {
    onBack: () => void;
}

export function PrivacyPolicyPage({ onBack }: LegalPageProps) {
    const { t } = useTranslation();

    return (
        <div className="page legal-page pt-4 pb-24 px-4 sm:px-6 overflow-y-auto">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-secondary hover:text-primary transition-colors mb-6"
            >
                <ArrowLeft size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">{t('legal.back')}</span>
            </button>

            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-accent-primary/10 rounded-full">
                    <Shield size={20} className="text-accent-primary" />
                </div>
                <h1 className="text-xl font-bold text-primary">{t('legal.privacy.title')}</h1>
            </div>

            <div className="space-y-6 text-sm text-secondary leading-relaxed">
                <section>
                    <h2 className="text-base font-bold text-primary mb-2">{t('legal.privacy.aboutApp')}</h2>
                    <p>{t('legal.privacy.aboutAppBody')}</p>
                </section>

                <section>
                    <h2 className="text-base font-bold text-primary mb-2">{t('legal.privacy.dataCollection')}</h2>
                    <p>{t('legal.privacy.dataCollectionBody')}</p>
                </section>

                <section>
                    <h2 className="text-base font-bold text-primary mb-2">{t('legal.privacy.cookies')}</h2>
                    <p>{t('legal.privacy.cookiesBody')}</p>
                </section>

                <section>
                    <h2 className="text-base font-bold text-primary mb-2">{t('legal.privacy.ads')}</h2>
                    <p>{t('legal.privacy.adsBody')}</p>
                </section>

                <section>
                    <h2 className="text-base font-bold text-primary mb-2">{t('legal.privacy.amazon')}</h2>
                    <p>{t('legal.privacy.amazonBody')}</p>
                </section>

                <section>
                    <h2 className="text-base font-bold text-primary mb-2">{t('legal.privacy.contact')}</h2>
                    <p>{t('legal.privacy.contactBody')}</p>
                </section>

                <p className="text-xs text-secondary/50 pt-4 border-t border-white/5">
                    {t('legal.lastUpdated')}: 2026-02-14
                </p>
            </div>
        </div>
    );
}

export function TermsPage({ onBack }: LegalPageProps) {
    const { t } = useTranslation();

    return (
        <div className="page legal-page pt-4 pb-24 px-4 sm:px-6 overflow-y-auto">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-secondary hover:text-primary transition-colors mb-6"
            >
                <ArrowLeft size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">{t('legal.back')}</span>
            </button>

            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-accent-primary/10 rounded-full">
                    <Shield size={20} className="text-accent-primary" />
                </div>
                <h1 className="text-xl font-bold text-primary">{t('legal.terms.title')}</h1>
            </div>

            <div className="space-y-6 text-sm text-secondary leading-relaxed">
                <section>
                    <h2 className="text-base font-bold text-primary mb-2">{t('legal.terms.usage')}</h2>
                    <p>{t('legal.terms.usageBody')}</p>
                </section>

                <section>
                    <h2 className="text-base font-bold text-primary mb-2">{t('legal.terms.disclaimer')}</h2>
                    <p>{t('legal.terms.disclaimerBody')}</p>
                </section>

                <section>
                    <h2 className="text-base font-bold text-primary mb-2">{t('legal.terms.ip')}</h2>
                    <p>{t('legal.terms.ipBody')}</p>
                </section>

                <section>
                    <h2 className="text-base font-bold text-primary mb-2">{t('legal.terms.changes')}</h2>
                    <p>{t('legal.terms.changesBody')}</p>
                </section>

                <p className="text-xs text-secondary/50 pt-4 border-t border-white/5">
                    {t('legal.lastUpdated')}: 2026-02-14
                </p>
            </div>
        </div>
    );
}
