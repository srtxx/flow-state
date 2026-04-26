import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Coffee, AlertTriangle, Zap } from 'lucide-react';
import type { DrinkType, DrinkOption } from '../../types';
import { DRINK_OPTIONS, getCurrentTimeString, willHaveCaffeineAtSleep, estimateCaffeineAtSleep } from '../../lib/caffeine';
import { useFlowState } from '../../context/FlowStateContext';
import AlertnessChart from '../AlertnessChart';
import RapidIntakeAlertDialog from '../RapidIntakeAlertDialog';
import { checkRapidIntakeWithSimulation } from '../../lib/alerts';
import type { RapidIntakeAlert } from '../../types';
import AffiliateLink from '../AffiliateLink';

interface IntakeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (drink: DrinkType, amount: number, time: string) => void;
}

// --- Minimalist Homage Icons ---
// Replaced with Lucide icons for consistency


export default function IntakeModal({ isOpen, onClose, onAdd }: IntakeModalProps) {
    const { t } = useTranslation();
    const { showToast, alertnessData, predictedData, intakeRecords, setSimulationParams, sleepData } = useFlowState();

    // Filter records to show only those within the chart's 24h window
    // This ensures the chart doesn't show old intake markers
    const last24Hours = Date.now() - (24 * 60 * 60 * 1000);
    const visibleRecords = intakeRecords.filter(record => record.timestamp >= last24Hours);

    // Selection State
    const [selectedDrink, setSelectedDrink] = useState<{ drink: DrinkType; baseAmount: number; label: string } | null>(null);
    // Alert State
    const [rapidIntakeAlert, setRapidIntakeAlert] = useState<RapidIntakeAlert | null>(null);

    // Reset state when modal opens
    useEffect(() => {
        if (!isOpen) {
            setSimulationParams(undefined);
            setSelectedDrink(null);
            setRapidIntakeAlert(null);
        }
    }, [isOpen, setSimulationParams]);

    // Update simulation when selection changes
    useEffect(() => {
        if (selectedDrink) {
            setSimulationParams({
                amount: selectedDrink.baseAmount,
                time: getCurrentTimeString()
            });
        } else {
            setSimulationParams(undefined);
        }
    }, [selectedDrink, setSimulationParams]);

    // ESC key to close or go back
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                if (selectedDrink) {
                    setSelectedDrink(null);
                } else {
                    onClose();
                }
            }
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose, selectedDrink]);

    if (!isOpen) return null;

    const handleDrinkClick = (drink: DrinkOption) => {
        if (selectedDrink?.drink === drink.name) {
            setSelectedDrink(null);
        } else {
            setSelectedDrink({
                drink: drink.name,
                baseAmount: drink.defaultMg,
                label: drink.label
            });
        }
    };

    const handleConfirm = () => {
        if (!selectedDrink) return;

        const totalAmount = selectedDrink.baseAmount;
        const time = getCurrentTimeString();

        // Check for rapid intake using only recent records (24h window)
        const alert = checkRapidIntakeWithSimulation(visibleRecords, totalAmount, time);

        if (alert) {
            setRapidIntakeAlert(alert);
        } else {
            // No alert, proceed
            onAdd(selectedDrink.drink, totalAmount, time);
            showToast(`${selectedDrink.drink} (${totalAmount}mg) ${t('intake.recorded')}`, 'success');
            onClose();
        }
    };

    const handleConfirmWithAlert = () => {
        if (selectedDrink) {
            const totalAmount = selectedDrink.baseAmount;
            const time = getCurrentTimeString();
            onAdd(selectedDrink.drink, totalAmount, time);
            showToast(`${selectedDrink.drink} (${totalAmount}mg) ${t('intake.recorded')}`, 'success');
            setRapidIntakeAlert(null);
            onClose();
        }
    };

    const handleCancelAlert = () => {
        setRapidIntakeAlert(null);
    };



    // Calculate details for visualization
    const currentTotalAmount = selectedDrink ? selectedDrink.baseAmount : 0;

    const getSleepImpactDetails = () => {
        if (!selectedDrink) return null;

        const time = getCurrentTimeString();
        const sleepTime = sleepData.lastSleepStart;

        // Check if caffeine remains (>= 25mg)
        if (!willHaveCaffeineAtSleep(currentTotalAmount, time, sleepTime)) return null;

        const [intakeH, intakeM] = time.split(':').map(Number);
        const [sleepH, sleepM] = sleepTime.split(':').map(Number);
        let hoursUntilSleep = (sleepH + sleepM / 60) - (intakeH + intakeM / 60);
        if (hoursUntilSleep < 0) hoursUntilSleep += 24;

        const remainingCaffeine = Math.round(estimateCaffeineAtSleep(currentTotalAmount, time, sleepTime));

        return {
            hours: hoursUntilSleep.toFixed(1),
            sleepTime,
            amount: remainingCaffeine
        };
    };

    const sleepImpactDetails = getSleepImpactDetails();

    const renderIcon = (name: string, isSelected: boolean) => {
        // Base classes for the icon container to ensure centering and consistent size
        const baseClass = "transition-all duration-300";

        switch (name) {
            case 'COFFEE S':
                return (
                    <div className={`${baseClass} ${isSelected ? 'text-bg-app' : 'text-amber-400'}`}>
                        <Coffee size={28} strokeWidth={1.5} />
                    </div>
                );
            case 'COFFEE L':
                return (
                    <div className={`${baseClass} ${isSelected ? 'text-bg-app' : 'text-emerald-500'}`}>
                        <Coffee size={32} strokeWidth={1.5} />
                    </div>
                );
            case 'ENERGY S':
                return (
                    <div className={`${baseClass} ${isSelected ? 'text-bg-app' : 'text-blue-400'}`}>
                        <Zap size={28} strokeWidth={1.5} />
                    </div>
                );
            case 'ENERGY L':
                return (
                    <div className={`${baseClass} ${isSelected ? 'text-bg-app' : 'text-green-400'}`}>
                        <Zap size={32} strokeWidth={1.5} />
                    </div>
                );
            default:
                return <Coffee size={24} />;
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content w-full max-w-md bg-card border border-white/10 rounded-3xl p-4 sm:p-6 shadow-2xl transform transition-all max-h-[95vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="modal-header mb-2 flex items-center justify-between">
                    <h2 className="modal-title text-lg font-bold text-primary">{t('intake.logCaffeine')}</h2>
                    <button onClick={onClose} className="btn-close p-2 bg-subtle rounded-full hover:bg-white/10 transition-colors text-primary">
                        <X size={18} />
                    </button>
                </div>

                {/* Chart Area - kept compact */}
                <div className="h-56 w-full mb-4">
                    <AlertnessChart
                        data={alertnessData}
                        predictedData={predictedData}
                        intakeRecords={visibleRecords}
                        showBaseline={false}
                    />
                </div>

                {/* Unified Selection Area */}
                <div className="flex flex-col gap-4">
                    {/* Compact Drink Grid */}
                    <div className="grid grid-cols-4 gap-2 sm:gap-3">
                        {DRINK_OPTIONS.map((drink) => {
                            const isSelected = selectedDrink?.drink === drink.name;
                            return (
                                <button
                                    key={drink.name}
                                    className={`relative flex flex-col items-center justify-center p-2 rounded-xl border transition-all duration-200 h-[100px] ${isSelected
                                        ? 'bg-accent-primary text-bg-app border-accent-primary shadow-[0_0_15px_rgba(255,255,255,0.15)] scale-[1.02]'
                                        : 'bg-subtle border-transparent hover:bg-white/5 hover:border-white/10 border-white/5'
                                        }`}
                                    onClick={() => handleDrinkClick(drink)}
                                >
                                    <div className={`transform transition-transform duration-200 ${isSelected ? 'scale-105' : 'scale-100'}`}>
                                        {/* Scale down icons slightly for compact view */}
                                        <div className="scale-[0.85]">
                                            {renderIcon(drink.name, isSelected)}
                                        </div>
                                    </div>
                                    <div className="text-center mt-1 z-10 w-full">
                                        <p className={`text-[10px] sm:text-xs font-bold leading-tight ${isSelected ? 'text-bg-app' : 'text-primary'}`}>
                                            {t(drink.label)}
                                        </p>
                                        <p className={`text-[9px] font-medium ${isSelected ? 'text-black/60' : 'text-secondary'}`}>{drink.defaultMg}mg</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Expandable Action Panel - Shows when a drink is selected */}
                    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${selectedDrink ? 'max-h-[420px] opacity-100' : 'max-h-0 opacity-0'}`}>
                        {selectedDrink && (
                            <div className="bg-subtle/50 rounded-2xl p-4 border border-white/10 animate-in slide-in-from-top-2 fade-in duration-200">
                                {/* Details Header */}
                                <div className="flex items-center justify-center mb-4">
                                    <div className="text-center">
                                        <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-0.5">{t('intake.caffeineContent')}</p>
                                        <div className="flex items-baseline justify-center gap-1">
                                            <span className="text-3xl font-bold tracking-tighter text-primary">{currentTotalAmount}</span>
                                            <span className="text-sm text-secondary font-medium">mg</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Sleep Warning - Inline */}
                                {sleepImpactDetails && (
                                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5 flex items-start gap-2.5 mb-4">
                                        <AlertTriangle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
                                        <div className="text-xs text-amber-200 leading-relaxed text-left">
                                            <span className="font-bold block mb-0.5 text-amber-100">{t('intake.sleepImpactWarning')}</span>
                                            {t('intake.sleepImpactMessage', sleepImpactDetails)}
                                        </div>
                                    </div>
                                )}

                                {/* Add Button */}
                                <button
                                    onClick={handleConfirm}
                                    className="btn-primary"
                                >
                                    <Coffee size={18} />
                                    <span>{t('add')}</span>
                                </button>

                                {/* Amazon Affiliate Link */}
                                <AffiliateLink
                                    drinkName={selectedDrink.drink}
                                    className="mt-3"
                                />
                            </div>
                        )}
                    </div>
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
