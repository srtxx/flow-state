import { useTranslation } from 'react-i18next';
import { Trash2, Coffee, PlusCircle } from 'lucide-react';
import { useFlowState } from '../context/FlowStateContext';
import { DRINK_OPTIONS } from '../lib/caffeine';
import './JournalPage.css';

export default function JournalPage() {
    const { t } = useTranslation();
    const { intakeRecords, deleteIntake, setShowIntakeModal } = useFlowState();

    // Sort logic
    // Sort logic - Show only today's records (reverse chronological)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayRecords = intakeRecords.filter(r => r.timestamp >= todayStart.getTime());
    const sortedRecords = [...todayRecords].sort((a, b) => a.timestamp - b.timestamp);
    const totalCaffeine = todayRecords.reduce((sum, record) => sum + record.amount, 0);

    return (
        <div className="page journal-page pb-24 flex flex-col relative w-full">
            {/* Header / Summary - Sticky */}
            <div
                className="journal-summary-card mb-6 sm:mb-8 p-4 rounded-2xl flex items-center justify-between"
                style={{
                    position: 'sticky',
                    top: '-0.5rem', // Stick to the top of the scrollable area (negative margin to cover padding if needed, or just 0)
                    zIndex: 40,
                    backgroundColor: 'rgba(18, 18, 18, 0.9)', // Dark semi-transparent
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    maxWidth: '100%',
                    marginTop: '-0.5rem' // Pull up slightly to align
                }}
            >
                <div className="flex flex-col justify-center min-w-0 flex-1">
                    <h2 className="text-xs font-bold tracking-widest uppercase text-secondary">{t('journal.totalIntake')}</h2>
                    <p className="text-3xl sm:text-4xl font-light leading-tight flex items-baseline text-primary mt-1">
                        {totalCaffeine}<span className="text-xs sm:text-sm ml-1 text-secondary">mg</span>
                    </p>
                </div>
                <div className="p-3 rounded-full flex items-center justify-center flex-shrink-0 ml-4 bg-subtle border border-white/5">
                    <Coffee size={20} className="sm:w-6 sm:h-6 text-primary" />
                </div>
            </div>

            <div className="section mb-20 px-1">
                <h3 className="text-sm font-bold tracking-widest mb-4 px-1 uppercase text-secondary">{t('journal.history')}</h3>
                <div className="relative pl-6 sm:pl-8 ml-3 sm:ml-4 space-y-8 sm:space-y-10 my-8 journal-timeline">
                    {sortedRecords.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in duration-500">
                            <div className="w-20 h-20 bg-subtle rounded-full flex items-center justify-center mb-6 shadow-sm border border-white/5">
                                <Coffee size={32} className="text-secondary opacity-50" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-lg font-bold text-primary mb-2">{t('journal.empty.title')}</h3>
                            <p className="text-secondary text-sm mb-8 leading-relaxed whitespace-pre-line max-w-[200px]">
                                {t('journal.empty.description')}
                            </p>
                            <button
                                onClick={() => setShowIntakeModal(true)}
                                className="btn-primary flex items-center gap-2 px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <PlusCircle size={20} />
                                <span className="font-bold">{t('journal.empty.action')}</span>
                            </button>
                        </div>
                    ) : (
                        sortedRecords.map((record) => (
                            <div key={record.id} className="relative group flex items-start w-full">
                                {/* Timeline Dot */}
                                <div className="absolute -left-[31px] sm:-left-[41px] top-1 w-3 h-3 rounded-full bg-bg-app border-2 border-text-primary shadow-[0_0_0_4px_var(--bg-app)] z-10 transition-all duration-300 group-hover:bg-text-primary group-hover:scale-125"></div>

                                <div className="flex justify-between items-start w-full">
                                    <div className="flex flex-col">
                                        <span className="text-lg font-bold text-primary leading-none mb-1">{record.time}</span>
                                        <span className="text-xs text-secondary uppercase tracking-wider">
                                            {t(DRINK_OPTIONS.find(d => d.name === record.drink)?.label || record.drink)}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <span className="text-xl font-light text-primary block leading-none">{record.amount}</span>
                                            <span className="text-[10px] text-secondary uppercase tracking-wider">mg</span>
                                        </div>

                                        <button
                                            className="opacity-0 group-hover:opacity-100 p-2 text-secondary hover:text-status-critical transition-all"
                                            onClick={() => deleteIntake(record.id)}
                                            aria-label={t('delete')}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
