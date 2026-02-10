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

// --- Minimalist Homage Icons ---

const CoffeeIconS = () => (
    <div className="relative flex items-center justify-center w-9 h-9">
        {/* Boss Homage: Rainbow Mountain Blend Style */}
        <div className="w-full h-full rounded-sm shadow-sm flex flex-col overflow-hidden border border-gray-400/50">
            {/* Top Blue Band */}
            <div className="w-full h-2.5 bg-[#003366]" />
            {/* Middle White/Cream Section with Logo */}
            <div className="flex-1 bg-[#F5F5DC] flex items-center justify-center relative">
                <div className="w-5 h-3 bg-[#8B4513] rounded-full opacity-20 absolute" />
                {/* Pipe Man Silhouette Hint */}
                <div className="w-4 h-4 bg-[#003366] rounded-full z-10 flex items-center justify-center">
                    <div className="w-3 h-3 bg-[#F5F5DC] rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-[#003366] rounded-full" />
                    </div>
                </div>
            </div>
            {/* Bottom Rainbow Band */}
            {/* Orange -> Yellow -> Green gradient */}
            <div className="w-full h-2.5 bg-[linear-gradient(90deg,#FF8C00,#FFD700,#32CD32)]" />
        </div>
        {/* Top Rim (Gold) */}
        <div className="absolute -top-0.5 w-7 h-1 bg-[#DAA520] rounded-sm border border-[#B8860B]" />
        {/* Bottom Rim (Gold) */}
        <div className="absolute -bottom-0.5 w-7 h-0.5 bg-[#DAA520] rounded-sm opacity-80" />
    </div>
);

const CoffeeIconL = () => (
    <div className="relative flex items-center justify-center w-8 h-12">
        {/* Starbucks Homage: Classic White Cup */}
        <div className="w-full h-full bg-white rounded-sm rounded-b-md border border-gray-200 shadow-sm flex flex-col items-center overflow-hidden">
            {/* Top White Rim Area */}
            <div className="w-full h-1 bg-gray-50 border-b border-gray-100" />

            {/* Main Body */}
            <div className="flex-1 w-full flex items-center justify-center relative bg-white">
                {/* Sleeve */}
                <div className="absolute w-full h-6 bg-[#C19A6B] flex items-center justify-center border-t border-b border-[#A08055]">
                    {/* Siren Logo (Green Circle + White Shapes) */}
                    <div className="w-5 h-5 rounded-full bg-[#00704A] flex items-center justify-center border border-white/20">
                        {/* Siren Head/Star Hint */}
                        <div className="w-3 h-3 bg-white rounded-full opacity-20" />
                        <div className="absolute text-[6px] text-white font-bold leading-none select-none">★</div>
                    </div>
                </div>
            </div>
        </div>
        {/* Lid */}
        <div className="absolute -top-1.5 w-9 h-2 bg-white rounded-sm border border-gray-200 shadow-sm flex items-center justify-center">
            <div className="w-1 h-1 bg-black/10 rounded-full" />
        </div>
    </div>
);

const EnergyIconS = () => (
    <div className="relative flex items-center justify-center w-5 h-14">
        {/* RedBull Homage: The Classic */}
        <div className="w-full h-full bg-[#C0BFBF] rounded-sm border border-gray-400 shadow-sm overflow-hidden flex flex-col relative">
            {/* Blue / Silver Quadrants - Using CSS linear-gradient for sharp diagonal */}
            {/* Top Right Blue */}
            <div className="absolute top-0 right-0 w-full h-1/2 bg-[#004C6C] transform -skew-y-[20deg] origin-bottom-right scale-[1.2]" />
            {/* Bottom Left Blue */}
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-[#004C6C] transform -skew-y-[20deg] origin-top-left scale-[1.2]" />

            {/* Yellow Sun Circle */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="w-3.5 h-3.5 rounded-full bg-[#FFD300] shadow-sm" />
            </div>
            {/* Red Bulls (Two opposing shapes) */}
            <div className="absolute inset-0 flex items-center justify-center z-20 gap-[1px]">
                <div className="w-1.5 h-1.5 bg-[#E21B4D] rounded-sm transform skew-x-12" />
                <div className="w-1.5 h-1.5 bg-[#E21B4D] rounded-sm transform -skew-x-12" />
            </div>
        </div>
        {/* Silver Rim */}
        <div className="absolute -top-0.5 w-4 h-1 bg-[#C0BFBF] rounded-sm border border-gray-400" />
    </div>
);

const EnergyIconL = () => (
    <div className="relative flex items-center justify-center w-10 h-14">
        {/* Monster Homage: The Beast */}
        <div className="w-full h-full bg-[#101010] rounded-sm border border-[#222] shadow-sm flex items-center justify-center overflow-hidden relative">
            {/* Neon Green Claw Marks (M) */}
            <div className="flex z-10 items-start pt-1">
                {/* Left Claw */}
                <div className="w-[3px] h-6 bg-[#95D600] transform -skew-x-[15deg] rounded-sm shadow-[0_0_6px_rgba(149,214,0,0.6)]"
                    style={{ clipPath: 'polygon(0 0, 100% 0, 80% 100%, 20% 100%)' }} />
                {/* Middle Claw */}
                <div className="w-[3px] h-7 bg-[#95D600] transform mx-[2px] -translate-y-1 rounded-sm shadow-[0_0_6px_rgba(149,214,0,0.6)]"
                    style={{ clipPath: 'polygon(10% 0, 90% 0, 100% 100%, 0 100%)' }} />
                {/* Right Claw */}
                <div className="w-[3px] h-6 bg-[#95D600] transform skew-x-[15deg] rounded-sm shadow-[0_0_6px_rgba(149,214,0,0.6)]"
                    style={{ clipPath: 'polygon(20% 0, 80% 0, 100% 100%, 0 100%)' }} />
            </div>

            {/* "ENERGY" Text Hint */}
            <div className="absolute bottom-2 left-0 w-full flex justify-center opacity-30">
                <div className="w-6 h-0.5 bg-white rounded-full" />
            </div>
        </div>
        {/* Black Rim */}
        <div className="absolute -top-0.5 w-8 h-1 bg-[#101010] rounded-sm border border-[#333]" />
        {/* Green Tab */}
        <div className="absolute -top-1 w-2 h-1.5 bg-[#95D600] rounded-sm opacity-80" />
    </div>
);

export default function IntakeModal({ isOpen, onClose, onAdd }: IntakeModalProps) {
    const { t } = useTranslation();
    const { showToast, alertnessData, predictedData, intakeRecords, setSimulationParams, sleepData } = useFlowState();

    // Selection State
    const [selectedDrink, setSelectedDrink] = useState<{ drink: DrinkType; baseAmount: number; label: string } | null>(null);
    const [quantity, setQuantity] = useState(1);

    // Alert State
    const [rapidIntakeAlert, setRapidIntakeAlert] = useState<RapidIntakeAlert | null>(null);

    // Reset state when modal opens
    useEffect(() => {
        if (!isOpen) {
            setSimulationParams(undefined);
            setSelectedDrink(null);
            setQuantity(1);
            setRapidIntakeAlert(null);
        }
    }, [isOpen, setSimulationParams]);

    // Update simulation when selection/quantity changes
    useEffect(() => {
        if (selectedDrink) {
            setSimulationParams({
                amount: selectedDrink.baseAmount * quantity,
                time: getCurrentTimeString()
            });
        } else {
            setSimulationParams(undefined);
        }
    }, [selectedDrink, quantity, setSimulationParams]);

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
        setSelectedDrink({
            drink: drink.name,
            baseAmount: drink.defaultMg,
            label: drink.label
        });
        setQuantity(1);
    };

    const handleConfirm = () => {
        if (!selectedDrink) return;

        const totalAmount = selectedDrink.baseAmount * quantity;
        const time = getCurrentTimeString();

        // Check for rapid intake
        const alert = checkRapidIntakeWithSimulation(intakeRecords, totalAmount, time);

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
            const totalAmount = selectedDrink.baseAmount * quantity;
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

    const handleBack = () => {
        setSelectedDrink(null);
        setSimulationParams(undefined);
    };

    // Calculate details for visualization
    const currentTotalAmount = selectedDrink ? selectedDrink.baseAmount * quantity : 0;

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
                    <h2 className="modal-title">{selectedDrink ? t(selectedDrink.label) : t('intake.logCaffeine')}</h2>
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

                {!selectedDrink ? (
                    /* Step 1: Drink Selection Grid */
                    <div className="intake-grid animate-in fade-in slide-in-from-bottom-4 duration-300">
                        {DRINK_OPTIONS.map((drink) => (
                            <button
                                key={drink.name}
                                className="card-soft flex flex-col items-center justify-center gap-3 transition-all duration-200 border-2 border-transparent hover:border-gray-200 hover:shadow-lg hover:scale-[1.03] active:scale-[0.98] active:border-black p-4 h-auto min-h-[140px] group relative overflow-hidden"
                                onClick={() => handleDrinkClick(drink)}
                            >
                                <div className="flex-1 flex items-center justify-center w-full transform group-hover:scale-110 transition-transform duration-300">
                                    {renderIcon(drink.name)}
                                </div>
                                <div className="w-full text-center z-10">
                                    <p className="font-bold text-sm sm:text-base leading-tight mb-0.5">{t(drink.label)}</p>
                                    <p className="text-xs text-secondary font-medium">{drink.defaultMg}mg</p>
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    /* Step 2: Quantity & Confirmation */
                    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-8 duration-300">

                        {/* Top: Icon + Caffeine Viz */}
                        <div className="flex items-center justify-between px-4">
                            <div className="transform scale-150 origin-left">
                                {renderIcon(selectedDrink.drink)}
                            </div>
                            <div className="text-right">
                                <span className="text-xs font-bold text-secondary uppercase tracking-wider block mb-1">TOTAL</span>
                                <div className="flex items-baseline justify-end gap-1">
                                    <span className="text-5xl font-bold tracking-tighter text-primary">{currentTotalAmount}</span>
                                    <span className="text-lg text-secondary font-medium">mg</span>
                                </div>
                            </div>
                        </div>

                        {/* Quantity Stepper */}
                        <div className="flex items-center justify-between bg-subtle rounded-2xl p-2">
                            <button
                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                className="w-12 h-12 flex items-center justify-center rounded-xl bg-white shadow-sm hover:shadow-md active:scale-95 transition-all text-primary"
                            >
                                <span className="text-2xl font-bold">-</span>
                            </button>
                            <span className="text-2xl font-bold text-primary font-mono w-12 text-center">{quantity}</span>
                            <button
                                onClick={() => setQuantity(q => Math.min(5, q + 1))}
                                className="w-12 h-12 flex items-center justify-center rounded-xl bg-white shadow-sm hover:shadow-md active:scale-95 transition-all text-primary"
                            >
                                <span className="text-2xl font-bold">+</span>
                            </button>
                        </div>

                        {/* Sleep Warning */}
                        {sleepImpactDetails && (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-3">
                                <AlertTriangle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
                                <div className="text-xs sm:text-sm text-amber-800">
                                    <span className="font-bold block mb-0.5">{t('intake.sleepImpactWarning')}</span>
                                    {t('intake.sleepImpactMessage', sleepImpactDetails)}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 mt-2">
                            <button
                                onClick={handleBack}
                                className="flex-1 py-3.5 rounded-xl font-bold text-sm text-secondary hover:bg-subtle transition-colors"
                            >
                                {t('back')}
                            </button>
                            <button
                                onClick={handleConfirm}
                                className="flex-[2] py-3.5 rounded-xl font-bold text-sm bg-black text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                <Coffee size={18} />
                                {t('add')}
                            </button>
                        </div>
                    </div>
                )}
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
