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
        <div className="page journal-page pb-20">
            {/* Header / Summary - Sticky */}
            <div
                className="mb-8 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between"
                style={{
                    position: 'sticky',
                    top: 'calc(var(--header-height) + env(safe-area-inset-top, 0px))',
                    zIndex: 40,
                    backgroundColor: 'var(--bg-card)'
                }}
            >
                <div className="flex flex-col justify-center">
                    <h2 className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-1">{t('journal.totalIntake')}</h2>
                    <p className="text-4xl font-light leading-none flex items-baseline">
                        {totalCaffeine}<span className="text-sm text-gray-400 ml-1">mg</span>
                    </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-full flex items-center justify-center">
                    <Coffee size={24} className="text-gray-800" />
                </div>
            </div>

            <div className="section mb-20">
                <h3 className="text-sm font-bold tracking-widest text-secondary mb-4 px-2">{t('journal.history')}</h3>
                <div className="flex flex-col gap-3">
                    {sortedRecords.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-10 text-center bg-white rounded-3xl shadow-sm border border-gray-100 mx-2 mt-4">
                            <div className="bg-gray-50 p-4 rounded-full mb-4">
                                <Coffee size={32} className="text-gray-300" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">{t('journal.noRecords')}</h3>
                            <p className="text-sm text-secondary mb-6 max-w-[200px] mx-auto">{t('journal.addSuggestion')}</p>

                            <button
                                onClick={() => setShowIntakeModal(true)}
                                className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full font-bold text-sm shadow-lg hover:scale-105 active:scale-95 transition-transform"
                            >
                                <PlusCircle size={18} />
                                <span>{t('intake.record')}</span>
                            </button>
                        </div>
                    ) : (
                        sortedRecords.map((record) => (
                            <div key={record.id} className="list-item w-full">
                                <div className="item-content">
                                    <p className="item-title text-base font-medium">{record.time}</p>
                                    <p className="item-subtitle text-xs uppercase tracking-wide text-gray-500">{record.drink}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-xl font-light leading-none">{record.amount}</p>
                                        <p className="text-xs text-secondary text-right">mg</p>
                                    </div>
                                    <button
                                        className="btn-ghost p-2 text-secondary hover:text-red-500 transition-colors"
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
