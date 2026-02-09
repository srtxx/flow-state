/**
 * Alert logic for caffeine intake monitoring
 */

import type { IntakeRecord } from '../types';

export interface RapidIntakeAlert {
    level: 'warning' | 'critical';
    timeWindow: 1 | 2; // hours
    totalAmount: number;
    threshold: number;
    message: string;
    recommendations: string[];
}

/**
 * Check for rapid caffeine intake that may pose health risks
 * 
 * @param intakeRecords - Array of intake records
 * @param currentTime - Current time (Date object)
 * @returns RapidIntakeAlert if threshold exceeded, null otherwise
 */
export function checkRapidIntake(
    intakeRecords: IntakeRecord[],
    currentTime: Date = new Date()
): RapidIntakeAlert | null {
    const now = currentTime.getTime();

    // Check 1-hour window (Critical: 150mg+)
    const oneHourAgo = now - (60 * 60 * 1000);
    const recentOneHour = intakeRecords.filter(r => r.timestamp >= oneHourAgo);
    const totalOneHour = recentOneHour.reduce((sum, r) => sum + r.amount, 0);

    if (totalOneHour >= 150) {
        return {
            level: 'critical',
            timeWindow: 1,
            totalAmount: totalOneHour,
            threshold: 150,
            message: '1時間以内に150mg以上のカフェインを摂取しています。',
            recommendations: [
                '水分を多めに摂取してください',
                '深呼吸で落ち着きましょう',
                '次の摂取まで3-4時間空けてください'
            ]
        };
    }

    // Check 2-hour window (Warning: 200mg+)
    const twoHoursAgo = now - (2 * 60 * 60 * 1000);
    const recentTwoHours = intakeRecords.filter(r => r.timestamp >= twoHoursAgo);
    const totalTwoHours = recentTwoHours.reduce((sum, r) => sum + r.amount, 0);

    if (totalTwoHours >= 200) {
        return {
            level: 'warning',
            timeWindow: 2,
            totalAmount: totalTwoHours,
            threshold: 200,
            message: '2時間以内に200mg以上のカフェインを摂取しています。',
            recommendations: [
                '心拍数の上昇に注意してください',
                '不安感を感じたら深呼吸を',
                '水分補給を心がけてください'
            ]
        };
    }

    return null;
}

/**
 * Simulate rapid intake check with a potential new intake
 * 
 * @param intakeRecords - Current intake records
 * @param newAmount - Amount of caffeine to be added (mg)
 * @param newTime - Time of the new intake (HH:mm format)
 * @returns RapidIntakeAlert if threshold would be exceeded, null otherwise
 */
export function checkRapidIntakeWithSimulation(
    intakeRecords: IntakeRecord[],
    newAmount: number,
    newTime: string
): RapidIntakeAlert | null {
    // Parse the new time and create a timestamp
    const [hours, minutes] = newTime.split(':').map(Number);
    const now = new Date();
    const simulatedDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
    const simulatedTimestamp = simulatedDate.getTime();

    // Create a simulated intake record
    const simulatedRecord: IntakeRecord = {
        id: 'simulation',
        time: newTime,
        amount: newAmount,
        drink: 'CUSTOM',
        timestamp: simulatedTimestamp
    };

    // Combine existing records with the simulated one
    const combinedRecords = [...intakeRecords, simulatedRecord];

    // Check rapid intake with the simulated data
    return checkRapidIntake(combinedRecords, simulatedDate);
}
