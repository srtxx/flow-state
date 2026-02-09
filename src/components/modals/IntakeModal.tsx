import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Coffee, AlertTriangle } from 'lucide-react';
import type { DrinkType } from '../../types';
import { DRINK_OPTIONS, getCurrentTimeString, willHaveCaffeineAtSleep, estimateCaffeineAtSleep } from '../../lib/caffeine';
import { useFlowState } from '../../context/FlowStateContext';
import AlertnessChart from '../AlertnessChart';
import RapidIntakeAlertDialog from '../RapidIntakeAlertDialog';
import { checkRapidIntakeWithSimulation } from '../../lib/alerts';
import type { RapidIntakeAlert } from '../../types';

interface IntakeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (drink: DrinkType, amount: number, time: string) => void;
}

// --- Custom Icon Components ---

const CoffeeIconS = () => (
    <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 shadow-sm border border-orange-100">
        <Coffee size={24} strokeWidth={2.5} />
    </div>
);

const CoffeeIconL = () => (
    <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 shadow-sm border border-amber-200">
        <Coffee size={32} strokeWidth={2.5} />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-white"></div>
    </div>
);

const EnergyIconS = () => (
    <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-sm border-2 border-gray-300 overflow-hidden">
        {/* Red Bull Silhouette */}
        <svg viewBox="0 0 48 48" className="w-full h-full absolute inset-0 opacity-90">
            {/* Bull head */}
            <circle cx="24" cy="26" r="8" fill="#dc2626" />
            {/* Left horn */}
            <path d="M 18 22 Q 14 18, 12 14" stroke="#dc2626" strokeWidth="2" fill="none" strokeLinecap="round" />
            {/* Right horn */}
            <path d="M 30 22 Q 34 18, 36 14" stroke="#dc2626" strokeWidth="2" fill="none" strokeLinecap="round" />
            {/* Snout */}
            <ellipse cx="24" cy="30" rx="4" ry="3" fill="#b91c1c" />
        </svg>
    </div>
);

const EnergyIconL = () => (
    <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-zinc-950 shadow-sm border-2 border-gray-800 overflow-hidden">
        {/* Monster Claw Marks */}
        <svg viewBox="0 0 56 56" className="w-full h-full absolute inset-0">
            {/* Three vertical claw marks */}
            <path d="M 16 12 L 18 44" stroke="#22c55e" strokeWidth="4" strokeLinecap="round" />
            <path d="M 28 10 L 28 46" stroke="#22c55e" strokeWidth="4" strokeLinecap="round" />
            <path d="M 40 12 L 38 44" stroke="#22c55e" strokeWidth="4" strokeLinecap="round" />
        </svg>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-lime-500 rounded-full border-2 border-zinc-950"></div>
    </div>
);

export default function IntakeModal({ isOpen, onClose, onAdd }: IntakeModalProps) {
    const { t } = useTranslation();
    const { showToast, alertnessData, predictedData, intakeRecords, setSimulationParams, sleepData } = useFlowState();
    const [hoveredDrink, setHoveredDrink] = useState<{ drink: DrinkType; amount: number } | null>(null);
    const [pendingIntake, setPendingIntake] = useState<{ drink: DrinkType; amount: number } | null>(null);
    const [rapidIntakeAlert, setRapidIntakeAlert] = useState<RapidIntakeAlert | null>(null);

    // Reset state when modal opens
    useEffect(() => {
        if (!isOpen) {
            setSimulationParams(undefined);
            setHoveredDrink(null);
            setPendingIntake(null);
            setRapidIntakeAlert(null);
        }
    }, [isOpen, setSimulationParams]);

    // ESC key to close
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleQuickAdd = (drink: DrinkType, amount: number) => {
        const time = getCurrentTimeString();

        // Check for rapid intake
        const alert = checkRapidIntakeWithSimulation(intakeRecords, amount, time);

        if (alert) {
            // Show alert dialog
            setPendingIntake({ drink, amount });
            setRapidIntakeAlert(alert);
        } else {
            // No alert, proceed with recording
            onAdd(drink, amount, time);
            showToast(`${drink} (${amount}mg) ${t('intake.recorded')}`, 'success');
            onClose();
        }
    };

    const handleConfirmWithAlert = () => {
        if (pendingIntake) {
            const time = getCurrentTimeString();
            onAdd(pendingIntake.drink, pendingIntake.amount, time);
            showToast(`${pendingIntake.drink} (${pendingIntake.amount}mg) ${t('intake.recorded')}`, 'success');
            setPendingIntake(null);
            setRapidIntakeAlert(null);
            onClose();
        }
    };

    const handleCancelAlert = () => {
        setPendingIntake(null);
        setRapidIntakeAlert(null);
    };

    const quickAddWillAffectSleep = hoveredDrink &&
        willHaveCaffeineAtSleep(hoveredDrink.amount, getCurrentTimeString(), sleepData.lastSleepStart);

    const getSleepImpactDetails = () => {
        if (!hoveredDrink) return null;

        const amount = hoveredDrink.amount;
        const time = getCurrentTimeString();
        const sleepTime = sleepData.lastSleepStart;

        const [intakeH, intakeM] = time.split(':').map(Number);
        const [sleepH, sleepM] = sleepTime.split(':').map(Number);

        let hoursUntilSleep = (sleepH + sleepM / 60) - (intakeH + intakeM / 60);
        if (hoursUntilSleep < 0) hoursUntilSleep += 24;

        const remainingCaffeine = Math.round(estimateCaffeineAtSleep(amount, time, sleepTime));

        return {
            hours: hoursUntilSleep.toFixed(1),
            sleepTime,
            amount: remainingCaffeine
        };
    };

    const sleepImpactDetails = getSleepImpactDetails();
    const showSleepWarning = quickAddWillAffectSleep && sleepImpactDetails;

    const renderIcon = (name: string) => {
        switch (name) {
            case 'COFFEE S': return <CoffeeIconS />;
            case 'COFFEE L': return <CoffeeIconL />;
            case 'ENERGY S': return <EnergyIconS />;
            case 'ENERGY L': return <EnergyIconL />;
            default: return <Coffee size={24} />;
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header mb-2 sm:mb-4">
                    <h2 className="modal-title">{t('intake.logCaffeine')}</h2>
                    <button onClick={onClose} className="btn-close">
                        <X size={20} />
                    </button>
                </div>

                <div className="h-28 sm:h-32 w-full mb-4 sm:mb-6">
                    <AlertnessChart
                        data={alertnessData}
                        predictedData={predictedData}
                        intakeRecords={intakeRecords}
                        showBaseline={false}
                    />
                </div>

                {showSleepWarning && (
                    <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-3 sm:p-4 mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex items-start gap-2 sm:gap-3">
                            <div className="p-1.5 sm:p-2 bg-amber-100 rounded-full text-amber-600 flex-shrink-0 mt-0.5">
                                <AlertTriangle size={18} className="sm:w-5 sm:h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-xs sm:text-sm text-amber-900 mb-1">
                                    {t('intake.sleepImpactWarning')}
                                </h4>
                                <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
                                    {t('intake.sleepImpactMessage', sleepImpactDetails)}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="intake-grid">
                    {DRINK_OPTIONS.map((drink) => (
                        <button
                            key={drink.name}
                            className="card-soft flex flex-col items-center justify-center gap-3 transition-all duration-200 border-2 border-transparent hover:border-gray-200 hover:shadow-lg hover:scale-[1.03] active:scale-[0.98] active:border-black p-4 h-auto min-h-[140px] group relative overflow-hidden"
                            onClick={() => handleQuickAdd(drink.name, drink.defaultMg)}
                            onMouseEnter={() => {
                                setSimulationParams({ amount: drink.defaultMg, time: getCurrentTimeString() });
                                setHoveredDrink({ drink: drink.name, amount: drink.defaultMg });
                            }}
                            onMouseLeave={() => {
                                setSimulationParams(undefined);
                                setHoveredDrink(null);
                            }}
                        >
                            <div className="flex-1 flex items-center justify-center w-full">
                                {renderIcon(drink.name)}
                            </div>
                            <div className="w-full text-center z-10">
                                <p className="font-bold text-sm sm:text-base leading-tight mb-0.5">{t(drink.label)}</p>
                                <p className="text-xs text-secondary font-medium">{drink.defaultMg}mg</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Rapid Intake Alert Dialog */}
            {rapidIntakeAlert && (
                <RapidIntakeAlertDialog
                    alert={rapidIntakeAlert}
                    onConfirm={handleConfirmWithAlert}
                    onCancel={handleCancelAlert}
                />
            )}
        </div>
    );
}
