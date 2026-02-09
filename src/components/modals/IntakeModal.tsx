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

// --- Custom Icon Components ---

const CoffeeIconS = () => (
    <div className="relative flex items-center justify-center w-10 h-14 transition-transform duration-300 group-hover:-translate-y-1">
        {/* Boss Homage: Short Can - Minimalist Gold/Brown */}
        <svg width="40" height="56" viewBox="0 0 40 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md">
            {/* Can Body */}
            <rect x="4" y="2" width="32" height="52" rx="2" fill="url(#bossGradient)" stroke="#854d0e" strokeWidth="1.5" />
            {/* Top Rim */}
            <path d="M4 8H36" stroke="#854d0e" strokeWidth="1.5" strokeOpacity="0.5" />
            {/* Dark Band with Gold Accent */}
            <rect x="4" y="28" width="32" height="12" fill="#1e1b4b" opacity="0.9" />
            <rect x="14" y="33" width="12" height="2" rx="1" fill="#facc15" />
            {/* Pipe Icon Hint */}
            <path d="M26 16C26 18.2091 24.2091 20 22 20H18V12H22C24.2091 12 26 13.7909 26 16Z" fill="#78350f" fillOpacity="0.3" />

            <defs>
                <linearGradient id="bossGradient" x1="20" y1="2" x2="20" y2="54" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#EAB308" />
                    <stop offset="0.5" stopColor="#CA8A04" />
                    <stop offset="1" stopColor="#EAB308" />
                </linearGradient>
            </defs>
        </svg>
    </div>
);

const CoffeeIconL = () => (
    <div className="relative flex items-center justify-center w-12 h-16 transition-transform duration-300 group-hover:-translate-y-1">
        {/* Starbucks Homage: Tall Cup - Clean White/Green */}
        <svg width="48" height="64" viewBox="0 0 48 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
            {/* Cup Body */}
            <path d="M10 12L12 56C12.2 59 14 60 24 60C34 60 35.8 59 36 56L38 12H10Z" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
            {/* Lid */}
            <path d="M8 12H40V8C40 6.89543 39.1046 6 38 6H10C8.89543 6 8 6.89543 8 8V12Z" fill="white" stroke="#CBD5E1" strokeWidth="1.5" />
            {/* Sleeve/Logo Area */}
            <circle cx="24" cy="36" r="8" fill="#15803d" />
            <path d="M24 32L25 35H28L25.5 37L26.5 40L24 38L21.5 40L22.5 37L20 35H23L24 32Z" fill="white" />
        </svg>
    </div>
);

const EnergyIconS = () => (
    <div className="relative flex items-center justify-center w-10 h-16 transition-transform duration-300 group-hover:-translate-y-1">
        {/* Red Bull Homage: Slim Can - Silver/Blue Geometric */}
        <svg width="40" height="64" viewBox="0 0 40 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md">
            {/* Can Body */}
            <rect x="6" y="4" width="28" height="56" rx="3" fill="url(#rbGradient)" stroke="#94a3b8" strokeWidth="1.5" />
            {/* Top Rim */}
            <path d="M6 10H34" stroke="#94a3b8" strokeWidth="1.5" />
            {/* Blue Geometric Pattern */}
            <path d="M6 4L34 60V4H6Z" fill="#2563EB" fillOpacity="0.1" />
            <path d="M6 60L34 4V60H6Z" fill="#1D4ED8" fillOpacity="0.1" />
            {/* Red Accent (Sun/Bull abstract) */}
            <circle cx="20" cy="32" r="5" fill="#DC2626" />
            <path d="M16 32H24" stroke="#FECACA" strokeWidth="1" strokeOpacity="0.5" />

            <defs>
                <linearGradient id="rbGradient" x1="6" y1="4" x2="34" y2="60" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F1F5F9" />
                    <stop offset="1" stopColor="#E2E8F0" />
                </linearGradient>
            </defs>
        </svg>
    </div>
);

const EnergyIconL = () => (
    <div className="relative flex items-center justify-center w-12 h-16 transition-transform duration-300 group-hover:-translate-y-1">
        {/* Monster Homage: Sleek Can - Matte Black/Neon Green */}
        <svg width="48" height="64" viewBox="0 0 48 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md">
            {/* Can Body */}
            <rect x="8" y="2" width="32" height="60" rx="4" fill="#18181b" stroke="#3f3f46" strokeWidth="1.5" />
            {/* Top Rim */}
            <path d="M8 8H40" stroke="#3f3f46" strokeWidth="1.5" />
            {/* Scratch Marks */}
            <path d="M19 18L18 46" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M24 16L24 48" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M29 18L30 46" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" />
            {/* Tab Accent */}
            <rect x="22" y="2" width="4" height="6" rx="1" fill="#71717a" />
        </svg>
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
