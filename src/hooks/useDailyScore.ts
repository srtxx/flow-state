import { useMemo, useEffect } from 'react';
import useLocalStorage from './useLocalStorage';

/**
 * Daily score record stored in LocalStorage
 */
export interface DailyScoreRecord {
    date: string;  // YYYY-MM-DD format
    avgAlertness: number;
    totalCaffeine: number;
}

/**
 * Hook for tracking daily scores and computing weekly performance
 * Ticket #003: Weekly Performance実データ化
 */
export function useDailyScore(currentAlertness: number, totalCaffeine: number) {
    const [dailyScores, setDailyScores] = useLocalStorage<DailyScoreRecord[]>(
        'flow-state-daily-scores',
        []
    );

    // Get today's date in YYYY-MM-DD format
    const today = useMemo(() => {
        const now = new Date();
        return now.toISOString().split('T')[0];
    }, []);

    // Update today's score
    useEffect(() => {
        if (currentAlertness <= 0) return;

        setDailyScores(prev => {
            const existingIndex = prev.findIndex(s => s.date === today);
            const newRecord: DailyScoreRecord = {
                date: today,
                avgAlertness: currentAlertness,
                totalCaffeine
            };

            if (existingIndex >= 0) {
                // Update existing record
                const updated = [...prev];
                updated[existingIndex] = newRecord;
                return updated;
            } else {
                // Add new record, keep only last 14 days
                const withNew = [...prev, newRecord];
                return withNew.slice(-14);
            }
        });
    }, [currentAlertness, totalCaffeine, today, setDailyScores]);

    // Calculate weekly stats
    const weeklyStats = useMemo(() => {
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        // This week's scores
        const thisWeek = dailyScores.filter(s => {
            const d = new Date(s.date);
            return d >= oneWeekAgo && d <= now;
        });

        // Last week's scores
        const lastWeek = dailyScores.filter(s => {
            const d = new Date(s.date);
            return d >= twoWeeksAgo && d < oneWeekAgo;
        });

        const thisWeekAvg = thisWeek.length > 0
            ? Math.round(thisWeek.reduce((sum, s) => sum + s.avgAlertness, 0) / thisWeek.length)
            : null;

        const lastWeekAvg = lastWeek.length > 0
            ? Math.round(lastWeek.reduce((sum, s) => sum + s.avgAlertness, 0) / lastWeek.length)
            : null;

        const weeklyChange = (thisWeekAvg !== null && lastWeekAvg !== null)
            ? thisWeekAvg - lastWeekAvg
            : null;

        return {
            thisWeekAvg,
            lastWeekAvg,
            weeklyChange,
            daysTracked: thisWeek.length
        };
    }, [dailyScores]);

    return {
        dailyScores,
        weeklyStats
    };
}

export default useDailyScore;
