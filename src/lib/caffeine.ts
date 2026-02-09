import type { SleepData, IntakeRecord, AlertnessDataPoint, DrinkOption } from '../types';

// Caffeine half-life in hours
const CAFFEINE_HALF_LIFE = 5;
// Peak absorption time in hours (45 minutes)
const PEAK_ABSORPTION_TIME = 0.75;

/**
 * Calculate caffeine effect at a given time since intake
 * 
 * Scientific basis:
 * - Absorption: ~99% absorbed within 45 minutes (NIH)
 * - Half-life: ~5 hours average (range 1.5-9.5 hours)
 * - Dose-response: 75-150mg provides noticeable alertness improvement
 */
export function calculateCaffeineEffect(amount: number, hoursSinceIntake: number): number {
    if (hoursSinceIntake < 0) return 0;

    let concentration: number;

    if (hoursSinceIntake < PEAK_ABSORPTION_TIME) {
        // Absorption phase: exponential rise to peak (no decay yet)
        // Use 1 - e^(-kt) curve for realistic absorption
        const absorptionRate = 1 - Math.exp(-3 * hoursSinceIntake / PEAK_ABSORPTION_TIME);
        concentration = amount * absorptionRate;
    } else {
        // Decay phase: exponential decay starting from peak
        const timeFromPeak = hoursSinceIntake - PEAK_ABSORPTION_TIME;
        concentration = amount * Math.pow(0.5, timeFromPeak / CAFFEINE_HALF_LIFE);
    }

    // Dose-response relationship based on scientific data:
    // 75-150mg should provide 10-15 point alertness boost
    // Using saturation curve: effect = maxEffect * (1 - e^(-concentration/threshold))
    const maxEffect = 18; // Maximum effect cap
    const threshold = 80; // mg at which ~63% of max effect is reached
    const effect = maxEffect * (1 - Math.exp(-concentration / threshold));

    return Math.max(0, effect);
}

/**
 * Calculate baseline alertness from sleep data only (circadian rhythm + sleep pressure)
 * 
 * Based on the Two-Process Model of Sleep Regulation (Borbély):
 * - Process S: Homeostatic sleep pressure (increases during waking)
 * - Process C: Circadian rhythm (24-hour biological clock)
 */
export function calculateBaselineAlertness(
    hoursFromWake: number,
    sleepData: SleepData,
    actualSleepHours: number
): number {
    // Sleep quality multiplier
    const qualityMultiplier = sleepData.sleepQuality === 'good' ? 1
        : sleepData.sleepQuality === 'fair' ? 0.9
            : 0.75;

    // Process S: Homeostatic sleep pressure
    // Accumulates exponentially during waking hours
    // Typically reaches high levels after ~16 hours awake
    const sleepPressure = 100 * (1 - Math.exp(-hoursFromWake / 18));

    // Process C: Circadian rhythm
    // Peak alertness around 4-6 hours after waking, dip in early afternoon
    // Using sinusoidal model shifted to match typical alertness patterns
    const circadianBase = 55 + 20 * Math.sin((hoursFromWake - 5) * Math.PI / 12);

    // Afternoon dip (post-lunch dip, typically 6-9 hours after waking)
    // This is a circadian phenomenon, not just related to food
    let afternoonDip = 0;
    if (hoursFromWake > 5 && hoursFromWake < 9) {
        // Gaussian-like dip centered around 7 hours after waking
        afternoonDip = 8 * Math.exp(-Math.pow(hoursFromWake - 7, 2) / 2);
    }

    // Sleep debt penalty
    // Each hour of sleep debt reduces baseline alertness
    const sleepDebt = Math.max(0, sleepData.avgSleepHours - actualSleepHours);
    const debtPenalty = sleepDebt * 5;

    // Combine all factors
    // Circadian promotes alertness, sleep pressure reduces it
    const baseline = (circadianBase - sleepPressure * 0.35 - afternoonDip - debtPenalty) * qualityMultiplier;

    // Clamp to reasonable range
    return Math.max(20, Math.min(85, baseline));
}

/**
 * Calculate actual sleep hours from sleep start/end times
 */
export function calculateActualSleepHours(sleepStart: string, sleepEnd: string): number {
    const [startH, startM] = sleepStart.split(':').map(Number);
    const [endH, endM] = sleepEnd.split(':').map(Number);

    let hours = endH - startH;
    if (hours < 0) hours += 24; // Handle overnight sleep
    hours += (endM - startM) / 60;

    return hours;
}

/**
 * Convert time string to decimal hours
 */
export function timeToDecimalHours(timeStr: string): number {
    const [h, m] = timeStr.split(':').map(Number);
    return h + m / 60;
}

/**
 * Get current time as decimal hours from wake time
 */
export function getHoursFromWake(wakeTime: string): number {
    const now = new Date();
    const currentHours = now.getHours() + now.getMinutes() / 60;
    const wakeHours = timeToDecimalHours(wakeTime);

    let hoursFromWake = currentHours - wakeHours;
    if (hoursFromWake < 0) hoursFromWake += 24;

    return hoursFromWake;
}

/**
 * Generate 24-hour alertness data
 */
export function generateAlertnessData(
    sleepData: SleepData,
    intakeRecords: IntakeRecord[],
    additionalIntake?: { time: string; amount: number }
): AlertnessDataPoint[] {
    const actualSleepHours = calculateActualSleepHours(
        sleepData.lastSleepStart,
        sleepData.lastSleepEnd
    );

    const wakeTime = timeToDecimalHours(sleepData.lastSleepEnd);
    const now = new Date();
    const currentTime = now.getHours() + now.getMinutes() / 60;

    // Filter to include records from the last 24 hours
    // This ensures caffeine from previous day still affects current day
    const last24Hours = now.getTime() - (24 * 60 * 60 * 1000);
    const recentRecords = intakeRecords.filter(r => r.timestamp >= last24Hours);

    const data: AlertnessDataPoint[] = [];

    for (let h = 0; h < 24; h += 0.5) {
        const actualHour = (wakeTime + h) % 24;
        const timeStr = `${String(Math.floor(actualHour)).padStart(2, '0')}:${h % 1 === 0 ? '00' : '30'}`;

        // Baseline alertness
        const baseline = calculateBaselineAlertness(h, sleepData, actualSleepHours);

        // Calculate caffeine effect from all intake records
        let caffeineEffect = 0;
        recentRecords.forEach(record => {
            const recordTime = timeToDecimalHours(record.time);
            // Calculate time since intake considering wrap-around
            let timeSinceIntake = actualHour - recordTime;
            if (timeSinceIntake < -12) timeSinceIntake += 24;
            if (timeSinceIntake > 12) timeSinceIntake -= 24;

            if (timeSinceIntake >= 0) {
                caffeineEffect += calculateCaffeineEffect(record.amount, timeSinceIntake);
            }
        });

        // Add additional intake if simulating
        if (additionalIntake) {
            const addTime = timeToDecimalHours(additionalIntake.time);
            let timeSinceAdd = actualHour - addTime;
            if (timeSinceAdd < -12) timeSinceAdd += 24;
            if (timeSinceAdd >= 0) {
                caffeineEffect += calculateCaffeineEffect(additionalIntake.amount, timeSinceAdd);
            }
        }

        const total = Math.min(100, baseline + caffeineEffect);

        // Check if this is near current time
        let hourDiff = Math.abs(actualHour - currentTime);
        if (hourDiff > 12) hourDiff = 24 - hourDiff;
        const isCurrent = hourDiff < 0.25;

        // Check if this is an intake time
        const isIntake = recentRecords.some(r => {
            const rTime = timeToDecimalHours(r.time);
            let diff = Math.abs(actualHour - rTime);
            if (diff > 12) diff = 24 - diff;
            return diff < 0.1;
        });

        data.push({
            time: timeStr,
            baseline: Math.round(baseline),
            caffeine: Math.round(caffeineEffect),
            total: Math.round(total),
            isCurrent,
            isIntake
        });
    }

    return data;
}

/**
 * Calculate recommended next intake time
 */
export function getRecommendedIntakeTime(
    sleepData: SleepData,
    currentIntakes: IntakeRecord[]
): { time: string; amount: number; reason: string } | null {
    const now = new Date();
    const currentHour = now.getHours() + now.getMinutes() / 60;

    // Calculate cutoff dynamically: 5 hours before expected sleep time (ticket #002)
    const sleepHour = timeToDecimalHours(sleepData.lastSleepStart);
    const cutoffHour = sleepHour - 9;
    // Handle wrap-around for late sleepers (e.g., sleep at 1am = 26 - 5 = 21)
    const adjustedCutoff = cutoffHour < 0 ? cutoffHour + 24 : cutoffHour;
    if (currentHour >= adjustedCutoff) {
        return null;
    }

    // Calculate total caffeine today
    const totalCaffeine = currentIntakes.reduce((sum, r) => sum + r.amount, 0);
    if (totalCaffeine >= 400) {
        return null; // Daily limit reached
    }

    // Recommend 30 minutes from now if no recent intake
    const recentIntake = currentIntakes.find(r => {
        const rTime = timeToDecimalHours(r.time);
        return currentHour - rTime < 2 && currentHour - rTime >= 0;
    });

    if (!recentIntake) {
        const recommendedHour = Math.ceil((currentHour + 0.5) * 2) / 2;
        const timeStr = `${String(Math.floor(recommendedHour)).padStart(2, '0')}:${recommendedHour % 1 === 0 ? '00' : '30'}`;

        return {
            time: timeStr,
            amount: 100,
            reason: '集中力のピークを維持するため'
        };
    }

    return null;
}

/**
 * Drink presets
 */
export const DRINK_OPTIONS: DrinkOption[] = [
    { name: 'COFFEE S', label: 'コーヒーS', defaultMg: 100 },
    { name: 'COFFEE L', label: 'コーヒーL', defaultMg: 200 },
    { name: 'ENERGY S', label: 'エナジードリンクS', defaultMg: 80 },
    { name: 'ENERGY L', label: 'エナジードリンクL', defaultMg: 142 },
];

/**
 * Generate unique ID
 */
export function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Get current time string in HH:mm format
 */
export function getCurrentTimeString(): string {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
}

/**
 * Get avoid-after time (to protect sleep)
 */
export function getAvoidAfterTime(expectedSleepTime: string = '23:00'): string {
    const sleepHour = timeToDecimalHours(expectedSleepTime);
    let avoidHour = sleepHour - 9; // 9 hours before sleep
    if (avoidHour < 0) avoidHour += 24;
    return `${String(Math.floor(avoidHour)).padStart(2, '0')}:00`;
}

/**
 * Check if caffeine intake will affect sleep
 * Returns true if any caffeine (>= 1mg) will remain at bedtime
 */
export function willAffectSleep(intakeTime: string, expectedSleepTime: string): boolean {
    const intakeHour = timeToDecimalHours(intakeTime);
    const sleepHour = timeToDecimalHours(expectedSleepTime);

    // Calculate hours until sleep
    let hoursUntilSleep = sleepHour - intakeHour;
    if (hoursUntilSleep < 0) hoursUntilSleep += 24;

    // Caffeine affects sleep if taken within 9 hours before bedtime
    return hoursUntilSleep < 9;
}

/**
 * Calculate estimated caffeine level at sleep time
 */
export function estimateCaffeineAtSleep(
    amount: number,
    intakeTime: string,
    sleepTime: string
): number {
    const intakeHour = timeToDecimalHours(intakeTime);
    const sleepHour = timeToDecimalHours(sleepTime);

    let hoursUntilSleep = sleepHour - intakeHour;
    if (hoursUntilSleep < 0) hoursUntilSleep += 24;

    // Calculate remaining caffeine at sleep time
    if (hoursUntilSleep < PEAK_ABSORPTION_TIME) {
        // Still absorbing
        const absorptionRate = 1 - Math.exp(-3 * hoursUntilSleep / PEAK_ABSORPTION_TIME);
        return amount * absorptionRate;
    } else {
        // Decay phase
        const timeFromPeak = hoursUntilSleep - PEAK_ABSORPTION_TIME;
        return amount * Math.pow(0.5, timeFromPeak / CAFFEINE_HALF_LIFE);
    }
}

/**
 * Check if caffeine will remain at sleep time (>= 1mg)
 */
export function willHaveCaffeineAtSleep(
    amount: number,
    intakeTime: string,
    sleepTime: string
): boolean {
    const remaining = estimateCaffeineAtSleep(amount, intakeTime, sleepTime);
    return remaining >= 1;
}
