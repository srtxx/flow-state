import { useMemo } from 'react';
import type { SleepData, IntakeRecord, AlertnessDataPoint } from '../types';
import {
    generateAlertnessData,
    calculateActualSleepHours,
    getRecommendedIntakeTime,
    getAvoidAfterTime
} from '../lib/caffeine';

interface UseAlertnessResult {
    alertnessData: AlertnessDataPoint[];
    predictedData: AlertnessDataPoint[];
    currentAlertness: number;
    currentBaseline: number;
    currentCaffeineEffect: number;
    actualSleepHours: number;
    peakAlertness: number;
    peakTime: string;
    recommendation: { time: string; amount: number; reason: string } | null;
    avoidAfterTime: string;
    totalCaffeineToday: number;
    intakeCount: number;
}

export function useAlertness(
    sleepData: SleepData,
    intakeRecords: IntakeRecord[],
    simulateIntake?: { time: string; amount: number }
): UseAlertnessResult {

    const actualSleepHours = useMemo(() =>
        calculateActualSleepHours(sleepData.lastSleepStart, sleepData.lastSleepEnd),
        [sleepData.lastSleepStart, sleepData.lastSleepEnd]
    );

    // Current alertness data (no simulation)
    const alertnessData = useMemo(() =>
        generateAlertnessData(sleepData, intakeRecords),
        [sleepData, intakeRecords]
    );

    // Predicted alertness data (with simulation)
    const predictedData = useMemo(() =>
        simulateIntake
            ? generateAlertnessData(sleepData, intakeRecords, simulateIntake)
            : alertnessData,
        [sleepData, intakeRecords, simulateIntake, alertnessData]
    );

    // Current alertness value
    const currentData = useMemo(() => {
        const current = alertnessData.find(d => d.isCurrent);
        return current || alertnessData[0];
    }, [alertnessData]);

    const currentAlertness = currentData?.total || 50;
    const currentBaseline = currentData?.baseline || 50;
    const currentCaffeineEffect = currentData?.caffeine || 0;

    // Peak alertness today
    const { peakAlertness, peakTime } = useMemo(() => {
        const now = new Date();
        const currentHour = now.getHours();

        // Look at remaining hours of today
        const remainingData = alertnessData.filter(d => {
            const hour = parseInt(d.time.split(':')[0]);
            return hour >= currentHour;
        });

        if (remainingData.length === 0) {
            return { peakAlertness: currentAlertness, peakTime: 'now' };
        }

        const peak = remainingData.reduce((max, d) =>
            d.total > max.total ? d : max, remainingData[0]);

        return { peakAlertness: peak.total, peakTime: peak.time };
    }, [alertnessData, currentAlertness]);

    // Recommendation for next intake
    const recommendation = useMemo(() =>
        getRecommendedIntakeTime(sleepData, intakeRecords),
        [sleepData, intakeRecords]
    );

    // Avoid-after time
    const avoidAfterTime = useMemo(() => getAvoidAfterTime(), []);

    // Stats - Filter to today's records only
    const { totalCaffeineToday, intakeCount } = useMemo(() => {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayRecords = intakeRecords.filter(r => r.timestamp >= todayStart.getTime());
        return {
            totalCaffeineToday: todayRecords.reduce((sum, r) => sum + r.amount, 0),
            intakeCount: todayRecords.length
        };
    }, [intakeRecords]);

    return {
        alertnessData,
        predictedData,
        currentAlertness,
        currentBaseline,
        currentCaffeineEffect,
        actualSleepHours,
        peakAlertness,
        peakTime,
        recommendation,
        avoidAfterTime,
        totalCaffeineToday,
        intakeCount
    };
}

export default useAlertness;
