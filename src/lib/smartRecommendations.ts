import type { SleepData, IntakeRecord, AlertnessDataPoint, SmartRecommendation, AlertnessDip } from '../types';
import {
    timeToDecimalHours,
    generateId,
    generateAlertnessData
} from './caffeine';


/**
 * 覚醒度の谷（アフタヌーンディップ）を予測
 * 
 * 科学的根拠:
 * - 起床後6-9時間に覚醒度の谷が発生（概日リズム）
 * - 午後の眠気（Post-lunch dip）は食事に関係なく発生する生理現象
 * 
 * @param wakeTime 起床時刻 (HH:mm)
 * @returns 覚醒度の谷の情報
 */
export function predictAlertnessDip(wakeTime: string): AlertnessDip {
    const wakeHour = timeToDecimalHours(wakeTime);

    // 標準的なディップは起床後6-9時間
    const dipStartHour = (wakeHour + 6) % 24;
    const dipPeakHour = (wakeHour + 7) % 24;
    const dipEndHour = (wakeHour + 9) % 24;

    return {
        dipStart: formatTime(dipStartHour),
        dipPeak: formatTime(dipPeakHour),
        dipEnd: formatTime(dipEndHour),
        severity: 'moderate' // 将来的に睡眠データから計算
    };
}

/**
 * 10進数の時刻をHH:mm形式にフォーマット
 * @param decimalHour 10進数の時刻 (例: 14.5 = 14:30)
 * @returns HH:mm形式の時刻文字列
 */
function formatTime(decimalHour: number): string {
    const hour = Math.floor(decimalHour);
    const minute = Math.round((decimalHour - hour) * 60);
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/**
 * 推奨を採用した場合の覚醒度を予測
 * @param sleepData 睡眠データ
 * @param intakeRecords 既存の摂取記録
 * @param recommendedTime 推奨時刻
 * @param recommendedAmount 推奨量
 * @returns 予測覚醒度
 */
function calculatePredictedAlertness(
    sleepData: SleepData,
    intakeRecords: IntakeRecord[],
    recommendedTime: string,
    recommendedAmount: number
): number {
    // 推奨時刻の覚醒度データを生成（推奨摂取を含む）
    const dataWithRecommendation = generateAlertnessData(
        sleepData,
        intakeRecords,
        { time: recommendedTime, amount: recommendedAmount }
    );

    // 推奨時刻の約45分後（カフェインのピーク時）の覚醒度を取得
    const recommendedHour = timeToDecimalHours(recommendedTime);
    const peakHour = (recommendedHour + 0.75) % 24; // 45分後

    const peakPoint = dataWithRecommendation.find(point => {
        const pointHour = timeToDecimalHours(point.time);
        return Math.abs(pointHour - peakHour) < 0.25;
    });

    return peakPoint?.total || 0;
}

/**
 * 現在の覚醒度を取得
 * @param alertnessData 覚醒度データ配列
 * @returns 現在の覚醒度
 */
function getCurrentAlertness(alertnessData: AlertnessDataPoint[]): number {
    const currentPoint = alertnessData.find(point => point.isCurrent);
    return currentPoint?.total || 0;
}

/**
 * スマート推奨を生成
 * 
 * @param sleepData 睡眠データ
 * @param intakeRecords 既存の摂取記録
 * @param alertnessData 現在の覚醒度データ
 * @returns スマート推奨の配列（信頼度スコア順）
 */
export function generateSmartRecommendations(
    sleepData: SleepData,
    intakeRecords: IntakeRecord[],
    alertnessData: AlertnessDataPoint[]
): SmartRecommendation[] {
    const recommendations: SmartRecommendation[] = [];
    const now = new Date();
    const currentHour = now.getHours() + now.getMinutes() / 60;

    // 1日の上限チェック (400mg) - 今日の記録のみを集計
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayRecords = intakeRecords.filter(r => r.timestamp >= todayStart.getTime());
    const totalCaffeineToday = todayRecords.reduce((sum, r) => sum + r.amount, 0);
    if (totalCaffeineToday >= 400) {
        return []; // 上限到達時は推奨なし
    }

    // 最近の摂取チェック（2時間以内）- 24時間以内の記録のみを確認
    const last24Hours = Date.now() - (24 * 60 * 60 * 1000);
    const recentRecords = intakeRecords.filter(r => r.timestamp >= last24Hours);
    const recentIntake = recentRecords.find(r => {
        const rTime = timeToDecimalHours(r.time);
        const timeDiff = currentHour - rTime;
        return timeDiff >= 0 && timeDiff < 2;
    });

    if (recentIntake) {
        return []; // 最近摂取した場合は推奨なし
    }

    // カットオフタイムチェック（就寝時刻の9時間前）
    const sleepHour = timeToDecimalHours(sleepData.lastSleepStart);
    const cutoffHour = sleepHour - 9;
    const adjustedCutoff = cutoffHour < 0 ? cutoffHour + 24 : cutoffHour;

    if (currentHour >= adjustedCutoff) {
        return []; // カットオフタイム後は推奨なし
    }

    // アフタヌーンディップ対策の推奨
    const dip = predictAlertnessDip(sleepData.lastSleepEnd);
    const dipStartHour = timeToDecimalHours(dip.dipStart);

    // ディップ開始の45分前を最適タイミングとする
    const optimalPreDipTime = dipStartHour - 0.75;
    const adjustedOptimalTime = optimalPreDipTime < 0 ? optimalPreDipTime + 24 : optimalPreDipTime;

    // 推奨は現在から2時間以内のもののみ生成
    const hoursDiff = adjustedOptimalTime - currentHour;
    const isWithinWindow = hoursDiff > 0 && hoursDiff < 2;

    if (isWithinWindow) {
        const currentAlertness = getCurrentAlertness(alertnessData);
        const recommendedAmount = 100; // 標準的な推奨量
        const predictedAlertness = calculatePredictedAlertness(
            sleepData,
            intakeRecords,
            formatTime(adjustedOptimalTime),
            recommendedAmount
        );

        recommendations.push({
            id: generateId(),
            type: 'afternoon_dip',
            recommendedTime: formatTime(adjustedOptimalTime),
            recommendedAmount,
            reasons: [
                `${dip.dipStart}頃に予測される覚醒度の低下（アフタヌーンディップ）を予防します`,
                '摂取後30-45分で血中濃度が最大になり、眠気のピークと相殺します',
                '午後のパフォーマンス低下を最小限に抑えます'
            ],
            predictedEffect: {
                currentAlertness: Math.round(currentAlertness),
                predictedAlertness: Math.round(predictedAlertness),
                improvement: Math.round(predictedAlertness - currentAlertness)
            },
            confidenceScore: 85,
            expiresAt: now.getTime() + (60 * 60 * 1000) // 1時間有効
        });
    }

    // パフォーマンス最大化の推奨（一般的な推奨）
    if (recommendations.length === 0) {
        // ディップ対策がない場合、30分後を推奨
        const recommendedHour = currentHour + 0.5;
        const currentAlertness = getCurrentAlertness(alertnessData);
        const recommendedAmount = 100;
        const predictedAlertness = calculatePredictedAlertness(
            sleepData,
            intakeRecords,
            formatTime(recommendedHour),
            recommendedAmount
        );

        recommendations.push({
            id: generateId(),
            type: 'general',
            recommendedTime: formatTime(recommendedHour),
            recommendedAmount,
            reasons: [
                '摂取後30分でカフェインの効果が現れ始め、集中力が向上します',
                '就寝時刻の9時間前までは、睡眠に影響を与えずにパフォーマンスを維持できます'
            ],
            predictedEffect: {
                currentAlertness: Math.round(currentAlertness),
                predictedAlertness: Math.round(predictedAlertness),
                improvement: Math.round(predictedAlertness - currentAlertness)
            },
            confidenceScore: 70,
            expiresAt: now.getTime() + (60 * 60 * 1000) // 1時間有効
        });
    }

    // 信頼度スコアでソート
    return recommendations.sort((a, b) => b.confidenceScore - a.confidenceScore);
}

/**
 * 推奨が有効期限切れかチェック
 * @param recommendation 推奨
 * @returns 有効期限切れの場合true
 */
export function isRecommendationExpired(recommendation: SmartRecommendation): boolean {
    return Date.now() > recommendation.expiresAt;
}

/**
 * 推奨が推奨時刻を過ぎているかチェック
 * @param recommendation 推奨
 * @returns 推奨時刻を過ぎている場合true
 */
export function isRecommendationPastTime(recommendation: SmartRecommendation): boolean {
    const now = new Date();
    const currentHour = now.getHours() + now.getMinutes() / 60;
    const recommendedHour = timeToDecimalHours(recommendation.recommendedTime);

    return currentHour > recommendedHour;
}
