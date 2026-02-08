import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Coffee, Plus, Zap, CupSoda } from 'lucide-react';
import type { DrinkType } from '../../types';
import { DRINK_OPTIONS, getCurrentTimeString } from '../../lib/caffeine';
import { useFlowState } from '../../context/FlowStateContext';
import AlertnessChart from '../AlertnessChart';

interface IntakeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (drink: DrinkType, amount: number, time: string) => void;
}

export default function IntakeModal({ isOpen, onClose, onAdd }: IntakeModalProps) {
    const { t } = useTranslation();
    const { showToast, alertnessData, predictedData, intakeRecords, setSimulationParams } = useFlowState();
    const [mode, setMode] = useState<'quick' | 'custom'>('quick');
    const [customAmount, setCustomAmount] = useState('100');
    const [customTime, setCustomTime] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setCustomTime(getCurrentTimeString());
            setError(null);
        } else {
            // Clear simulation when closed
            setSimulationParams(undefined);
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
    // Monitor custom inputs for simulation
    useEffect(() => {
        if (!isOpen || mode !== 'custom') return;

        const amount = parseInt(customAmount, 10);
        if (!isNaN(amount) && amount > 0 && customTime) {
            setSimulationParams({ amount, time: customTime });
        } else {
            setSimulationParams(undefined);
        }
    }, [isOpen, mode, customAmount, customTime, setSimulationParams]);

    if (!isOpen) return null;

    // Validation
    const validateAmount = (value: string): string | null => {
        const amount = parseInt(value, 10);
        if (isNaN(amount) || value.trim() === '') {
            return t('validation.amountRequired');
        }
        if (amount < 1 || amount > 1000) {
            return t('validation.amountRange');
        }
        return null;
    };

    const handleAmountChange = (value: string) => {
        setCustomAmount(value);
        setError(validateAmount(value));
    };

    const handleQuickAdd = (drink: DrinkType, amount: number) => {
        onAdd(drink, amount, getCurrentTimeString());
        showToast(`${drink} (${amount}mg) ${t('intake.recorded')}`, 'success');
        onClose();
    };

    const handleCustomAdd = () => {
        const validationError = validateAmount(customAmount);
        if (validationError) {
            setError(validationError);
            return;
        }

        const amount = parseInt(customAmount, 10);
        onAdd('CUSTOM', amount, customTime || getCurrentTimeString());
        showToast(`${t('intake.title')} ${amount}mg ${t('intake.recorded')}`, 'success');
        setCustomAmount('100');
        setError(null);
        onClose();
    };

    const isSubmitDisabled = !!validateAmount(customAmount);

    // Helper for icons
    const getIcon = (name: string) => {
        if (name.includes('Coffee')) return <Coffee size={20} />;
        if (name.includes('Energy')) return <Zap size={20} />;
        return <CupSoda size={20} />;
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header mb-2">
                    <h2 className="modal-title">{t('intake.logCaffeine')}</h2>
                    <button onClick={onClose} className="btn-close">
                        <X size={20} />
                    </button>
                </div>

                {/* Simulation Chart */}
                <div className="h-32 w-full mb-4">
                    <AlertnessChart
                        data={alertnessData}
                        predictedData={predictedData}
                        intakeRecords={intakeRecords}
                        showBaseline={false}
                    />
                </div>

                {/* Tabs */}
                <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
                    <button
                        className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${mode === 'quick' ? 'bg-white shadow-md text-black' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'}`}
                        onClick={() => setMode('quick')}
                    >
                        {t('intake.quickAdd')}
                    </button>
                    <button
                        className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${mode === 'custom' ? 'bg-white shadow-md text-black' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'}`}
                        onClick={() => {
                            setMode('custom');
                            setCustomTime(getCurrentTimeString());
                            setError(null);
                        }}
                    >
                        {t('intake.custom')}
                    </button>
                </div>

                {mode === 'quick' ? (
                    <div className="intake-grid">
                        {DRINK_OPTIONS.map((drink) => (
                            <button
                                key={drink.name}
                                className="card-soft flex flex-col items-center justify-center gap-2 transition-all duration-150 border-2 border-transparent hover:border-gray-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] active:border-black p-4 m-0 h-auto min-h-[120px]"
                                onClick={() => handleQuickAdd(drink.name, drink.defaultMg)}
                                onMouseEnter={() => setSimulationParams({ amount: drink.defaultMg, time: getCurrentTimeString() })}
                                onMouseLeave={() => setSimulationParams(undefined)}
                            >
                                <div className="p-3 bg-gray-100 rounded-full text-gray-800 mb-1 transition-colors group-hover:bg-gray-200">
                                    {getIcon(drink.name)}
                                </div>
                                <p className="font-bold text-sm text-center">{drink.name}</p>
                                <p className="text-xs text-secondary">{drink.defaultMg}mg</p>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        <div>
                            <label className="text-xs font-bold text-secondary uppercase tracking-wider mb-2 block">
                                {t('intake.amount')}
                            </label>
                            <input
                                type="number"
                                value={customAmount}
                                onChange={(e) => handleAmountChange(e.target.value)}
                                className={`input-soft text-2xl font-light ${error ? 'border-red-500' : ''}`}
                                placeholder="100"
                                min="1"
                                max="1000"
                                autoFocus
                            />
                            {error && (
                                <p className="text-red-500 text-sm mt-1">{error}</p>
                            )}
                        </div>

                        <div>
                            <label className="text-xs font-bold text-secondary uppercase tracking-wider mb-2 block">
                                {t('intake.time')}
                            </label>
                            <input
                                type="time"
                                value={customTime}
                                onChange={(e) => setCustomTime(e.target.value)}
                                className="input-soft text-2xl font-light"
                            />
                        </div>

                        <div className="flex gap-3 mt-4">
                            <button onClick={onClose} className="btn-secondary flex-1">
                                {t('cancel')}
                            </button>
                            <button
                                onClick={handleCustomAdd}
                                className="btn-primary flex-1 flex items-center justify-center gap-2"
                                disabled={isSubmitDisabled}
                                style={{ opacity: isSubmitDisabled ? 0.5 : 1, cursor: isSubmitDisabled ? 'not-allowed' : 'pointer' }}
                            >
                                <Plus size={20} />
                                <span>{t('intake.record')}</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
