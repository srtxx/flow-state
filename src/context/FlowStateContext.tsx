import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { SleepData, IntakeRecord, TabType, AlertnessDataPoint, DrinkType, RapidIntakeAlert, SmartRecommendation } from '../types';
import { useLocalStorage, useAlertness, useDailyScore } from '../hooks';
import { generateId } from '../lib/caffeine';
import type { ToastData } from '../components/Toast';
import { checkRapidIntake } from '../lib/alerts';
import { generateSmartRecommendations, isRecommendationExpired, isRecommendationPastTime } from '../lib/smartRecommendations';

interface FlowStateContextType {
    // State
    sleepData: SleepData;
    intakeRecords: IntakeRecord[];
    hasOnboarded: boolean;
    activeTab: TabType;
    showNotification: boolean;

    // Computed (from useAlertness)
    alertnessData: AlertnessDataPoint[];
    currentAlertness: number;
    actualSleepHours: number;
    totalCaffeineToday: number;
    avoidAfterTime: string;
    recommendation: { time: string; amount: number } | null;
    isOverLimit: boolean;
    weeklyStats: {
        thisWeekAvg: number | null;
        lastWeekAvg: number | null;
        weeklyChange: number | null;
        daysTracked: number;
    };

    // Actions
    setSleepData: (data: SleepData) => void;
    addIntake: (drink: DrinkType, amount: number, time: string) => void;
    deleteIntake: (id: string) => void;
    completeOnboarding: (data: SleepData) => void;
    setActiveTab: (tab: TabType) => void;
    setShowNotification: (show: boolean) => void;

    // Modals control (optional, or kept local if purely UI)
    showIntakeModal: boolean;
    setShowIntakeModal: (show: boolean) => void;
    showSleepInput: boolean;
    setShowSleepInput: (show: boolean) => void;

    // Toast notifications
    toasts: ToastData[];
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
    dismissToast: (id: string) => void;

    // Simulation
    predictedData: AlertnessDataPoint[];
    simulationParams: { time: string; amount: number } | undefined;
    setSimulationParams: (params: { time: string; amount: number } | undefined) => void;

    // Confirm Dialog
    confirmConfig: {
        isOpen: boolean;
        message: string;
        title?: string;
        onConfirm: () => void;
        isDestructive?: boolean;
    };
    closeConfirm: () => void;

    // Rapid Intake Alert
    rapidIntakeAlert: RapidIntakeAlert | null;

    // Smart Recommendations
    smartRecommendations: SmartRecommendation[];
    dismissRecommendation: (id: string) => void;
    followRecommendation: (recommendation: SmartRecommendation) => void;
}

const DEFAULT_SLEEP_DATA: SleepData = {
    avgSleepHours: 7,
    lastSleepStart: '23:00',
    lastSleepEnd: '06:30',
    sleepQuality: 'good'
};

const FlowStateContext = createContext<FlowStateContextType | undefined>(undefined);

export function FlowStateProvider({ children }: { children: ReactNode }) {
    // --- State ---
    const [activeTab, setActiveTab] = useState<TabType>('dashboard');
    const [showNotification, setShowNotification] = useState(true);

    // Modals
    const [showIntakeModal, setShowIntakeModal] = useState(false);
    const [showSleepInput, setShowSleepInput] = useState(false);

    // Toast notifications
    const [toasts, setToasts] = useState<ToastData[]>([]);

    // Persisted Data
    const [sleepData, setSleepData] = useLocalStorage<SleepData>('flow-state-sleep', DEFAULT_SLEEP_DATA);
    const [intakeRecords, setIntakeRecords] = useLocalStorage<IntakeRecord[]>('flow-state-intakes', []);
    const [hasOnboarded, setHasOnboarded] = useLocalStorage<boolean>('flow-state-onboarded', false);

    // Simulation
    const [simulationParams, setSimulationParams] = useState<{ time: string; amount: number } | undefined>(undefined);

    // Smart Recommendations
    const [smartRecommendations, setSmartRecommendations] = useState<SmartRecommendation[]>([]);
    const [dismissedRecommendations, setDismissedRecommendations] = useLocalStorage<string[]>('flow-state-dismissed-recommendations', []);

    // --- Computed Logic ---
    const {
        alertnessData,
        predictedData,
        currentAlertness,
        actualSleepHours,
        recommendation,
        totalCaffeineToday,
        avoidAfterTime
    } = useAlertness(sleepData, intakeRecords, simulationParams);

    const isOverLimit = totalCaffeineToday >= 400;

    // Weekly performance stats (ticket #003)
    const { weeklyStats } = useDailyScore(currentAlertness, totalCaffeineToday);

    // Rapid intake alert
    const rapidIntakeAlert = useMemo(() => checkRapidIntake(intakeRecords), [intakeRecords]);

    // Confirm Dialog
    const [confirmConfig, setConfirmConfig] = useState<{
        isOpen: boolean;
        message: string;
        title?: string;
        onConfirm: () => void;
        isDestructive?: boolean;
    }>({
        isOpen: false,
        message: '',
        onConfirm: () => { },
    });

    const confirm = useCallback((message: string, onConfirm: () => void, options?: { title?: string, isDestructive?: boolean }) => {
        setConfirmConfig({
            isOpen: true,
            message,
            onConfirm,
            title: options?.title,
            isDestructive: options?.isDestructive
        });
    }, []);

    const closeConfirm = useCallback(() => {
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
    }, []);

    // Toast notifications
    const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
        const id = generateId();
        setToasts(prev => [...prev, { id, message, type }]);
    }, []);

    const dismissToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    // Smart Recommendations Actions
    const dismissRecommendation = useCallback((id: string) => {
        setDismissedRecommendations(prev => [...prev, id]);
        setSmartRecommendations(prev => prev.filter(rec => rec.id !== id));
    }, [setDismissedRecommendations]);

    const followRecommendation = useCallback((recommendation: SmartRecommendation) => {
        // IntakeModalを開く（時刻と量は手動で入力する想定）
        setShowIntakeModal(true);
        // 推奨を却下してクリーンアップ
        dismissRecommendation(recommendation.id);
        showToast('推奨タイミングで記録しましょう！', 'info');
    }, [dismissRecommendation, showToast]);

    // 推奨生成ロジック（1分ごとに更新）
    useEffect(() => {
        const updateRecommendations = () => {
            // 新しい推奨を生成
            const newRecommendations = generateSmartRecommendations(
                sleepData,
                intakeRecords,
                alertnessData
            );

            // 有効期限切れ・時刻過ぎ・却下済みをフィルタリング
            const validRecommendations = newRecommendations.filter(rec =>
                !isRecommendationExpired(rec) &&
                !isRecommendationPastTime(rec) &&
                !dismissedRecommendations.includes(rec.id)
            );

            setSmartRecommendations(validRecommendations);
        };

        // 初回実行
        updateRecommendations();

        // 1分ごとに更新
        const interval = setInterval(updateRecommendations, 60000);

        return () => clearInterval(interval);
    }, [sleepData, intakeRecords, alertnessData, dismissedRecommendations]);

    // --- Actions ---
    const addIntake = useCallback((drink: DrinkType, amount: number, time: string) => {
        const newRecord: IntakeRecord = {
            id: generateId(),
            time,
            amount,
            drink,
            timestamp: Date.now()
        };
        setIntakeRecords(prev => [...prev, newRecord]);
    }, [setIntakeRecords]);

    const deleteIntake = useCallback((id: string) => {
        confirm('この記録を削除しますか？', () => {
            setIntakeRecords(prev => prev.filter(record => record.id !== id));
            showToast('削除しました', 'success');
        }, { title: '記録の削除', isDestructive: true });
    }, [setIntakeRecords, confirm, showToast]);

    const completeOnboarding = useCallback((data: SleepData) => {
        setSleepData(data);
        setHasOnboarded(true);
        setShowSleepInput(true); // Prompt for today's sleep immediately after onboarding
    }, [setSleepData, setHasOnboarded]);

    // Value object
    const value = useMemo(() => ({
        sleepData,
        intakeRecords,
        hasOnboarded,
        activeTab,
        showNotification,
        alertnessData,
        predictedData,
        currentAlertness,
        actualSleepHours,
        totalCaffeineToday,
        avoidAfterTime,
        recommendation,
        isOverLimit,
        weeklyStats,
        setSleepData,
        addIntake,
        deleteIntake,
        completeOnboarding,
        setActiveTab,
        setShowNotification,
        showIntakeModal,
        setShowIntakeModal,
        showSleepInput,
        setShowSleepInput,
        toasts,
        showToast,
        dismissToast,
        confirmConfig,
        closeConfirm,
        simulationParams,
        setSimulationParams,
        rapidIntakeAlert,
        smartRecommendations,
        dismissRecommendation,
        followRecommendation
    }), [
        sleepData, intakeRecords, hasOnboarded, activeTab, showNotification,
        alertnessData, predictedData, currentAlertness, actualSleepHours, totalCaffeineToday, avoidAfterTime, recommendation, isOverLimit,
        weeklyStats, setSleepData, addIntake, deleteIntake, completeOnboarding,
        showIntakeModal, showSleepInput, toasts, showToast, dismissToast, confirmConfig, closeConfirm,
        simulationParams, setSimulationParams,
        rapidIntakeAlert,
        smartRecommendations,
        dismissRecommendation,
        followRecommendation
    ]);

    return (
        <FlowStateContext.Provider value={value}>
            {children}
        </FlowStateContext.Provider>
    );
}

export function useFlowState() {
    const context = useContext(FlowStateContext);
    if (context === undefined) {
        throw new Error('useFlowState must be used within a FlowStateProvider');
    }
    return context;
}
