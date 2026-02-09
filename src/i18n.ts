import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources
const resources = {
    ja: {
        translation: {
            // Common
            save: '保存',
            cancel: 'キャンセル',
            delete: '削除',
            edit: '編集',
            add: '追加',
            close: '閉じる',
            confirm: '確認',

            // Navigation
            nav: {
                flow: 'FLOW',
                journal: 'JOURNAL',
                profile: 'PROFILE'
            },

            // Dashboard
            dashboard: {
                currentAlertness: '現在の覚醒度',
                status: {
                    good: '良好',
                    peak: 'ピーク状態',
                    low: '低下中',
                    overLimit: '摂取制限超過'
                },
                recommendation: 'おすすめ',
                limitWarning: '制限超過'
            },

            // Intake
            intake: {
                title: 'カフェイン記録',
                logCaffeine: 'カフェイン記録',
                quickAdd: 'クイック追加',
                custom: 'カスタム',
                amount: '量 (mg)',
                time: '時刻',
                record: '記録',
                recorded: '記録しました',
                sleepImpactWarning: '睡眠への影響',
                sleepImpactMessage: '就寝時刻（{{sleepTime}}）まで{{hours}}時間。約{{amount}}mgのカフェインが体内に残ります。',
                acknowledgeImpact: '影響を理解しました'
            },

            // Sleep
            sleep: {
                title: '睡眠データ',
                bedtime: '就寝時刻',
                wakeUp: '起床時刻',
                quality: '睡眠の質',
                poor: 'poor',
                fair: 'fair',
                good: 'good',
                duration: '睡眠時間',
                target: '目標'
            },

            // Journal
            journal: {
                title: '摂取履歴',
                totalIntake: '合計摂取量',
                history: 'HISTORY',
                noRecords: '記録がありません',
                addSuggestion: 'カフェインを追加してここに表示'
            },

            // Profile
            profile: {
                title: 'プロフィール',
                subtitle: 'フロー状態を最適化',
                limitAfter: 'カフェイン制限時刻',
                limitDescription: 'この時刻以降のカフェイン摂取を控えると睡眠の質が向上します',
                sleepAnalysis: '睡眠分析',
                lastNight: '昨夜',
                goodSleep: '良好な睡眠',
                readyMessage: 'ピークパフォーマンスの準備完了',
                sleepDebt: '睡眠不足',
                recoveryMessage: '今日は回復に専念しましょう',
                weeklyTrend: '週間トレンド',
                avgAlertness: '平均覚醒度',
                avgSleep: '平均睡眠'
            },

            // Onboarding
            onboarding: {
                title: 'Flow State',
                description: '科学に基づいたカフェイン摂取と覚醒度の最適化',
                boost: 'ブースト',
                recover: 'リカバリー',
                getStarted: '始める',
                sleepGoal: '睡眠目標',
                sleepQuestion: '十分な休息を感じるのに必要な睡眠時間は？',
                start: 'Flow Stateを開始'
            },

            // Validation
            validation: {
                amountRequired: 'カフェイン量を入力してください',
                amountRange: 'カフェイン量は1〜1000mgの範囲で入力してください',
                invalidTime: '有効な時刻を入力してください'
            }
        }
    },
    en: {
        translation: {
            // Common
            save: 'Save',
            cancel: 'Cancel',
            delete: 'Delete',
            edit: 'Edit',
            add: 'Add',
            close: 'Close',
            confirm: 'Confirm',

            // Navigation
            nav: {
                flow: 'FLOW',
                journal: 'JOURNAL',
                profile: 'PROFILE'
            },

            // Dashboard
            dashboard: {
                currentAlertness: 'Current Alertness',
                status: {
                    good: 'Good',
                    peak: 'Peak State',
                    low: 'Declining',
                    overLimit: 'Over Limit'
                },
                recommendation: 'Recommended',
                limitWarning: 'Over Limit'
            },

            // Intake
            intake: {
                title: 'Log Caffeine',
                logCaffeine: 'Log Caffeine',
                quickAdd: 'Quick Add',
                custom: 'Custom',
                amount: 'Amount (mg)',
                time: 'Time',
                record: 'Record',
                recorded: 'Recorded',
                sleepImpactWarning: 'Sleep Impact',
                sleepImpactMessage: '{{hours}} hours until bedtime ({{sleepTime}}). ~{{amount}}mg caffeine will remain.',
                acknowledgeImpact: 'I understand the impact'
            },

            // Sleep
            sleep: {
                title: 'Sleep Data',
                bedtime: 'Bedtime',
                wakeUp: 'Wake Up',
                quality: 'Quality',
                poor: 'Poor',
                fair: 'Fair',
                good: 'Good',
                duration: 'Duration',
                target: 'Target'
            },

            // Journal
            journal: {
                title: 'Intake History',
                totalIntake: 'Total Intake',
                history: 'HISTORY',
                noRecords: 'No records yet',
                addSuggestion: 'Add some caffeine to see it here'
            },

            // Profile
            profile: {
                title: 'Your Profile',
                subtitle: 'Optimize your flow state',
                limitAfter: 'Limit Caffeine After',
                limitDescription: 'Stopping intake by this time protects your sleep quality',
                sleepAnalysis: 'Sleep Analysis',
                lastNight: 'Last Night',
                goodSleep: 'Good Sleep',
                readyMessage: 'Ready for peak performance',
                sleepDebt: 'Sleep Debt',
                recoveryMessage: 'Focus on recovery today',
                weeklyTrend: 'Weekly Trend',
                avgAlertness: 'Avg Alertness',
                avgSleep: 'Avg Sleep'
            },

            // Onboarding
            onboarding: {
                title: 'Flow State',
                description: 'Optimize your alertness and caffeine intake based on science',
                boost: 'Boost',
                recover: 'Recover',
                getStarted: 'Get Started',
                sleepGoal: 'Sleep Goal',
                sleepQuestion: 'How many hours do you usually need to feel rested?',
                start: 'Start Flow State'
            },

            // Validation
            validation: {
                amountRequired: 'Please enter caffeine amount',
                amountRange: 'Caffeine amount must be between 1-1000mg',
                invalidTime: 'Please enter a valid time'
            }
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: 'ja', // Default language: Japanese
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false // React already escapes values
        }
    });

export default i18n;
