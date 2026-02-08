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

export type DrinkType = 'COFFEE' | 'ESPRESSO' | 'ENERGY' | 'TEA' | 'CUSTOM';

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
