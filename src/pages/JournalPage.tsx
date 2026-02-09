import { useTranslation } from 'react-i18next';
import { Trash2, Coffee, PlusCircle } from 'lucide-react';
import { useFlowState } from '../context/FlowStateContext';

export default function JournalPage() {
    const { t } = useTranslation();
    const { intakeRecords, deleteIntake, setShowIntakeModal } = useFlowState();

    // Sort logic
    // Sort logic - Show only today's records (reverse chronological)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayRecords = intakeRecords.filter(r => r.timestamp >= todayStart.getTime());
    const sortedRecords = [...todayRecords].sort((a, b) => b.timestamp - a.timestamp);
    const totalCaffeine = todayRecords.reduce((sum, record) => sum + record.amount, 0);

    return (
        <div className="page journal-page pb-20 flex flex-col relative h-full">
            {/* Header / Summary - Sticky */}
            <div
                className="journal-summary-card mb-6 sm:mb-8 p-3 sm:p-4 rounded-2xl shadow-sm border flex items-center justify-between"
                style={{
                    position: 'sticky',
                    top: 'calc(60px + env(safe-area-inset-top, 0px) + 0.5rem)',
                    zIndex: 40,
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'rgba(0, 0, 0, 0.03)',
                    maxWidth: '100%'
                }}
            >
                <div className="flex flex-col justify-center min-w-0 flex-1">
                    <h2 className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: 'var(--text-secondary)' }}>{t('journal.totalIntake')}</h2>
                    <p className="text-3xl sm:text-4xl font-light leading-none flex items-baseline">
                        {totalCaffeine}<span className="text-xs sm:text-sm ml-1" style={{ color: 'var(--text-secondary)' }}>mg</span>
                    </p>
                </div>
                <div className="p-2 sm:p-3 rounded-full flex items-center justify-center flex-shrink-0 ml-2" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                    <Coffee size={20} className="sm:w-6 sm:h-6" style={{ color: 'var(--text-primary)' }} />
                </div>
            </div>

            <div className="section mb-20">
                <h3 className="text-sm font-bold tracking-widest mb-4 px-2 uppercase" style={{ color: 'var(--text-secondary)' }}>{t('journal.history')}</h3>
                <div className="flex flex-col gap-3">
                    {sortedRecords.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 sm:p-10 text-center rounded-2xl shadow-sm border mx-2 mt-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'rgba(0, 0, 0, 0.03)' }}>
                            <div className="p-3 sm:p-4 rounded-full mb-3 sm:mb-4" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                                <Coffee size={28} className="sm:w-8 sm:h-8" style={{ color: 'var(--text-tertiary)' }} />
                            </div>
                            <h3 className="text-base sm:text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{t('journal.noRecords')}</h3>
                            <p className="text-xs sm:text-sm mb-5 sm:mb-6 max-w-[200px] mx-auto" style={{ color: 'var(--text-secondary)' }}>{t('journal.addSuggestion')}</p>

                            <button
                                onClick={() => setShowIntakeModal(true)}
                                className="btn-primary text-sm sm:text-base"
                                style={{ maxWidth: '200px' }}
                            >
                                <PlusCircle size={18} strokeWidth={2.5} className="sm:w-5 sm:h-5" />
                                <span>{t('intake.record')}</span>
                            </button>
                        </div>
                    ) : (
                        sortedRecords.map((record) => (
                            <div key={record.id} className="list-item w-full">
                                <div className="item-content min-w-0 flex-1">
                                    <p className="item-title text-base font-medium truncate">{record.time}</p>
                                    <p className="item-subtitle text-xs uppercase tracking-wide truncate">{record.drink}</p>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                                    <div className="text-right">
                                        <p className="text-lg sm:text-xl font-light leading-none">{record.amount}</p>
                                        <p className="text-xs text-right" style={{ color: 'var(--text-secondary)' }}>mg</p>
                                    </div>
                                    <button
                                        className="btn-ghost p-2 sm:p-3 transition-colors"
                                        style={{ minWidth: '44px', minHeight: '44px', color: 'var(--text-secondary)' }}
                                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--status-critical)'}
                                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                                        onClick={() => deleteIntake(record.id)}
                                        aria-label={t('delete')}
                                    >
                                        <Trash2 size={18} strokeWidth={1.5} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
