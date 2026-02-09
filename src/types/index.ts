// Types for the Flow State app

export interface SleepData {
    avgSleepHours: number;
    lastSleepStart: string; // HH:mm format
    lastSleepEnd: string;   // HH:mm format
    sleepQuality: 'good' | 'fair' | 'poor';
}

export interface IntakeRecord {
    id: string;
    time: string;  // HH:mm format
    amount: number; // mg
    drink: DrinkType;
    timestamp: number; // Unix timestamp for ordering
}

export type DrinkType = 'COFFEE S' | 'COFFEE L' | 'ENERGY S' | 'ENERGY L' | 'CUSTOM';

export interface DrinkOption {
    name: DrinkType;
    label: string;
    defaultMg: number;
}

export interface AlertnessDataPoint {
    time: string;
    baseline: number;
    caffeine: number;
    total: number;
    isCurrent: boolean;
    isIntake: boolean;
}

export type TabType = 'dashboard' | 'journal' | 'profile';

export interface AppState {
    activeTab: TabType;
    sleepData: SleepData;
    intakeRecords: IntakeRecord[];
    showQuickAdd: boolean;
    showSleepInput: boolean;
    showOnboarding: boolean;
    showPrediction: boolean;
}

// Smart Recommendation types
export interface SmartRecommendation {
    id: string;
    type: 'afternoon_dip' | 'performance_max' | 'general';
    recommendedTime: string; // HH:mm format
    recommendedAmount: number; // mg
    reasons: string[];
    predictedEffect: {
        currentAlertness: number;
        predictedAlertness: number;
        improvement: number;
    };
    confidenceScore: number; // 0-100
    expiresAt: number; // timestamp
}

export interface AlertnessDip {
    dipStart: string; // HH:mm format
    dipPeak: string; // HH:mm format
    dipEnd: string; // HH:mm format
    severity: 'mild' | 'moderate' | 'severe';
}

// Alert types
export type { RapidIntakeAlert } from '../lib/alerts';

