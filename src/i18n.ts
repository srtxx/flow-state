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
                flow: 'フロー',
                journal: '履歴',
                profile: 'プロフィール'
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
                limitWarning: '制限超過',
                chart: {
                    now: '🕒',
                    nextDay: '🌙',
                    baseline: '睡眠ベースライン',
                    predicted: '予測レベル',
                    alertness: '覚醒度レベル',
                    tooltip: {
                        current: '現在',
                        baseline: 'ベースライン',
                        boost: 'ブースト',
                        predicted: '予測'
                    }
                },
                stats: {
                    peakTime: 'ピーク予想',
                    activeCaffeine: '有効カフェイン',
                    dailyTotal: '合計摂取'
                }
            },

            // Intake
            intake: {
                title: 'カフェイン記録',
                logCaffeine: 'カフェイン記録',
                quickAdd: 'クイック追加',
                custom: 'カスタム',
                amount: '量 (mg)',
                caffeineContent: 'カフェイン含有量',
                time: '時刻',
                record: '記録',
                recorded: '記録しました',
                sleepImpactWarning: '睡眠への影響',
                sleepImpactMessage: '就寝時刻（{{sleepTime}}）まで{{hours}}時間。約{{amount}}mgのカフェインが体内に残ります。',
                acknowledgeImpact: '影響を理解しました',
                drinks: {
                    coffeeS: 'コーヒー S',
                    coffeeL: 'コーヒー L',
                    energyS: 'エナジー S',
                    energyL: 'エナジー L'
                }
            },

            // Sleep
            sleep: {
                title: '睡眠データ',
                bedtime: '就寝時刻',
                wakeUp: '起床時刻',
                quality: '睡眠の質',
                poor: '不足',
                fair: '普通',
                good: '十分',
                duration: '睡眠時間',
                target: '目標'
            },

            // Journal
            journal: {
                title: '摂取履歴',
                totalIntake: '合計摂取量',
                history: '履歴',
                noRecords: '記録がありません',
                addSuggestion: 'カフェインを追加してここに表示',
                empty: {
                    title: '記録がありません',
                    description: '最初のコーヒーを追加して、\nカフェイン管理を始めましょう',
                    action: '最初のコーヒーを追加'
                }
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
                avgSleep: '平均睡眠',
                support: {
                    title: '開発者をサポート',
                    subtitle: 'Buy Me a Coffee ☕'
                },
                insufficientData: {
                    title: 'データ不足',
                    description: '数日使用すると表示されます'
                },
                trackingDays: '{{days}}日間計測中'
            },

            // Onboarding
            onboarding: {
                title: 'Flow State',
                description: '科学に基づいたカフェイン摂取と覚醒度の最適化',
                boost: 'ブースト',
                recover: 'リカバリー',
                getStarted: '設定を始める',
                sleepGoal: '睡眠目標',
                start: 'Flow Stateを始める'
            },

            // Validation
            validation: {
                amountRequired: 'カフェイン量を入力してください',
                amountRange: 'カフェイン量は1〜1000mgの範囲で入力してください',
                invalidTime: '有効な時刻を入力してください'
            },

            // Smart Recommendations
            smartRecommendation: {
                title: 'パフォーマンス最適化の提案',
                optimalTiming: '推奨摂取タイミング',
                recommendedAmount: '推奨量',
                predictedEffect: '予測効果',
                current: '現在',
                predicted: '予測',
                reasons: '推奨理由',
                confidence: '信頼度',
                actions: {
                    recordNow: '今すぐ記録',
                    remindLater: '30分後',
                    dismiss: '却下'
                },
                types: {
                    afternoonDip: 'アフタヌーンディップ対策',
                    performanceMax: '集中維持ゴールデンタイム',
                    general: 'パフォーマンス維持'
                }
            },

            // Alerts
            alerts: {
                rapidIntake: {
                    title: '急速摂取の警告',
                    badge: '急速摂取',
                    critical: '1時間以内に{{amount}}mgのカフェインを摂取しています。',
                    warning: '2時間以内に{{amount}}mgのカフェインを摂取しています。',
                    willExceed: 'この摂取により、{{timeWindow}}時間以内の総摂取量が{{amount}}mgになります。',
                    risks: {
                        title: '考えられるリスク',
                        heartRate: '心拍数の上昇',
                        anxiety: '不安感・焦燥感',
                        tremor: '手の震え',
                        concentration: '集中力の低下'
                    },
                    recommendations: {
                        title: '推奨アクション',
                        hydrate: '水分を多めに摂取する',
                        breathe: '深呼吸で落ち着く',
                        wait: '次の摂取まで3-4時間空ける',
                        consult: '症状が続く場合は医療機関に相談'
                    },
                    understandAndRecord: '理解して記録',
                    cancelRecord: 'キャンセル'
                }
            },

            // Ads
            ad: {
                amazonPartner: 'Amazon で購入',
                saleBadge: 'SALE',
            },

            // Legal
            legal: {
                section: '法的情報',
                back: '戻る',
                lastUpdated: '最終更新日',
                amazonDisclosure: '当サイトは Amazon.co.jp アソシエイト・プログラムの参加者です。リンクを通じて購入された場合、紹介料を受け取ることがあります。',
                privacy: {
                    title: 'プライバシーポリシー',
                    aboutApp: 'アプリについて',
                    aboutAppBody: 'FLOW STATE は、カフェイン摂取量の管理と覚醒度の最適化を支援するウェブアプリケーションです。',
                    dataCollection: 'データの収集と保存',
                    dataCollectionBody: '本アプリは、入力されたカフェイン摂取データおよび睡眠データをお使いのブラウザのローカルストレージに保存します。サーバーへのデータ送信は行いません。',
                    cookies: 'Cookie の使用',
                    cookiesBody: '本アプリは広告の配信および利用状況の分析のために Cookie を使用する場合があります。Google AdSense は Cookie を使用してユーザーの興味に基づいた広告を表示します。',
                    ads: 'Google AdSense について',
                    adsBody: '本アプリは Google AdSense を利用し、第三者広告を表示する場合があります。Google は以前のアクセス情報に基づき、適切な広告を表示するために Cookie を使用します。Google のプライバシーポリシーの詳細は https://policies.google.com/privacy をご覧ください。',
                    amazon: 'Amazon アソシエイトについて',
                    amazonBody: '本アプリは Amazon.co.jp アソシエイト・プログラムに参加しています。商品リンクを通じて購入された場合、当サイトは紹介料を受け取ることがあります。',
                    contact: 'お問い合わせ',
                    contactBody: 'プライバシーに関するお問い合わせは、アプリ内のサポート機能をご利用ください。'
                },
                terms: {
                    title: '利用規約',
                    usage: 'サービスの利用',
                    usageBody: 'FLOW STATE は、カフェイン摂取量の管理ツールとして提供されます。本アプリの利用は無料ですが、一部機能にはプレミアムプランが必要になる場合があります。',
                    disclaimer: '免責事項',
                    disclaimerBody: '本アプリが提供する情報（覚醒度の推定、睡眠への影響予測など）は一般的なガイダンスであり、医学的なアドバイスではありません。健康上の懸念がある場合は医療専門家にご相談ください。',
                    ip: '知的財産権',
                    ipBody: 'FLOW STATE のデザイン、コンテンツ、ソースコードに関する知的財産権は開発者に帰属します。無断での複製・転載・再配布を禁じます。',
                    changes: '規約の変更',
                    changesBody: '本規約は予告なく変更される場合があります。変更後も本アプリを継続してご利用された場合、変更後の規約に同意したものとみなされます。'
                }
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
                limitWarning: 'Over Limit',
                stats: {
                    peakTime: 'Est. Peak',
                    activeCaffeine: 'Active Caff.',
                    dailyTotal: 'Total Intake'
                }
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
                addSuggestion: 'Add some caffeine to see it here',
                empty: {
                    title: 'No records yet',
                    description: 'Add your first coffee and start managing your caffeine.',
                    action: 'Add First Coffee'
                }
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
                getStarted: 'Start Setup',
                sleepGoal: 'Sleep Goal',
                start: 'Start Flow State'
            },

            // Validation
            validation: {
                amountRequired: 'Please enter caffeine amount',
                amountRange: 'Caffeine amount must be between 1-1000mg',
                invalidTime: 'Please enter a valid time'
            },

            // Smart Recommendations
            smartRecommendation: {
                title: 'Smart Recommendation',
                optimalTiming: 'Optimal Timing',
                recommendedAmount: 'Recommended Amount',
                predictedEffect: 'Predicted Effect',
                current: 'Current',
                predicted: 'Predicted',
                reasons: 'Reasons',
                confidence: 'Confidence',
                actions: {
                    recordNow: 'Record Now',
                    remindLater: '30 min later',
                    dismiss: 'Dismiss'
                },
                types: {
                    afternoonDip: 'Afternoon Dip Prevention',
                    performanceMax: 'Performance Maximization',
                    general: 'General Recommendation'
                }
            },

            // Alerts
            alerts: {
                rapidIntake: {
                    title: 'Rapid Intake Warning',
                    badge: 'Rapid Intake',
                    critical: 'You\'ve consumed {{amount}}mg of caffeine within 1 hour.',
                    warning: 'You\'ve consumed {{amount}}mg of caffeine within 2 hours.',
                    willExceed: 'This intake will result in {{amount}}mg within {{timeWindow}} hours.',
                    risks: {
                        title: 'Potential Risks',
                        heartRate: 'Increased heart rate',
                        anxiety: 'Anxiety and restlessness',
                        tremor: 'Hand tremors',
                        concentration: 'Reduced concentration'
                    },
                    recommendations: {
                        title: 'Recommended Actions',
                        hydrate: 'Drink plenty of water',
                        breathe: 'Practice deep breathing',
                        wait: 'Wait 3-4 hours before next intake',
                        consult: 'Consult a doctor if symptoms persist'
                    },
                    understandAndRecord: 'I Understand, Record',
                    cancelRecord: 'Cancel'
                }
            },

            // Ads
            ad: {
                amazonPartner: 'Buy on Amazon',
                saleBadge: 'SALE',
            },

            // Legal
            legal: {
                section: 'Legal',
                back: 'Back',
                lastUpdated: 'Last Updated',
                amazonDisclosure: 'This site participates in the Amazon.co.jp Associates Program. We may earn commissions from purchases made through our links.',
                privacy: {
                    title: 'Privacy Policy',
                    aboutApp: 'About This App',
                    aboutAppBody: 'FLOW STATE is a web application that helps manage caffeine intake and optimize alertness levels.',
                    dataCollection: 'Data Collection & Storage',
                    dataCollectionBody: 'This app stores caffeine intake and sleep data in your browser\'s local storage. No data is sent to external servers.',
                    cookies: 'Use of Cookies',
                    cookiesBody: 'This app may use cookies for advertising and usage analysis. Google AdSense uses cookies to display ads based on user interests.',
                    ads: 'About Google AdSense',
                    adsBody: 'This app may display third-party ads via Google AdSense. Google uses cookies based on previous access to display relevant ads. Visit https://policies.google.com/privacy for details.',
                    amazon: 'About Amazon Associates',
                    amazonBody: 'This app participates in the Amazon.co.jp Associates Program. We may earn commissions from purchases made through product links.',
                    contact: 'Contact',
                    contactBody: 'For privacy-related inquiries, please use the in-app support feature.'
                },
                terms: {
                    title: 'Terms of Service',
                    usage: 'Service Usage',
                    usageBody: 'FLOW STATE is provided as a caffeine intake management tool. Usage is free, though some features may require a premium plan.',
                    disclaimer: 'Disclaimer',
                    disclaimerBody: 'Information provided by this app (alertness estimates, sleep impact predictions, etc.) is general guidance and not medical advice. Consult a healthcare professional with any health concerns.',
                    ip: 'Intellectual Property',
                    ipBody: 'All intellectual property rights for FLOW STATE design, content, and source code belong to the developer. Unauthorized reproduction, reprinting, or redistribution is prohibited.',
                    changes: 'Changes to Terms',
                    changesBody: 'These terms may be changed without prior notice. Continued use of the app after changes constitutes acceptance of the new terms.'
                }
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
