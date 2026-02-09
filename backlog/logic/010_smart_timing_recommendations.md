# 🎯 スマートタイミング推奨

**優先度**: 中  
**カテゴリ**: AI機能強化  
**影響範囲**: 新機能追加

## 概要

ユーザーの覚醒度パターンを分析し、最適なカフェイン摂取タイミングをインテリジェントに提案する機能を実装する。

## 背景

### 現在の推奨システムの課題

現在の推奨アルゴリズムは単純なルールベース：
- 2時間以内に摂取がない
- 1日の上限未満
- カットオフタイム前

**改善の余地:**
- 個人の覚醒度パターンを考慮していない
- 午後の眠気（アフタヌーンディップ）を予測していない
- 重要な予定やタスクに合わせた最適化がない

### 科学的根拠

**概日リズムと覚醒度:**
- 起床後4-6時間: 覚醒度のピーク
- 起床後6-9時間: アフタヌーンディップ（午後の眠気）
- 起床後12時間以降: 覚醒度の低下

**最適な摂取タイミング:**
- 覚醒度が低下し始める30-60分前
- アフタヌーンディップの直前（起床後5-6時間）
- 重要なタスクの30-45分前（カフェインのピーク時間）

## 機能要件

### 1. 覚醒度の谷の予測

**アフタヌーンディップの検出:**
- 起床時刻から計算
- 通常は起床後6-9時間に発生
- 個人差を考慮した調整

**予測アルゴリズム:**
```typescript
function predictAlertnessDip(wakeTime: string): {
  dipStart: string;
  dipPeak: string;
  dipEnd: string;
  severity: 'mild' | 'moderate' | 'severe';
} {
  const wakeHour = timeToDecimalHours(wakeTime);
  
  // 標準的なディップは起床後6-9時間
  const dipStart = (wakeHour + 6) % 24;
  const dipPeak = (wakeHour + 7) % 24;
  const dipEnd = (wakeHour + 9) % 24;
  
  // 睡眠負債や睡眠の質から重症度を判定
  const severity = calculateDipSeverity(sleepData);
  
  return {
    dipStart: formatTime(dipStart),
    dipPeak: formatTime(dipPeak),
    dipEnd: formatTime(dipEnd),
    severity
  };
}
```

### 2. 最適タイミングの提案

**提案ロジック:**

**タイプ1: アフタヌーンディップ対策**
- タイミング: ディップ開始の30-60分前
- 量: 80-100mg（中程度）
- 理由: 「午後の眠気を予防し、パフォーマンスを維持」

**タイプ2: パフォーマンス最大化**
- タイミング: 覚醒度が目標値を下回る前
- 量: 100-150mg（状況に応じて）
- 理由: 「集中力のピークを延長」

**タイプ3: 重要イベント対策**
- タイミング: イベントの30-45分前
- 量: カフェインのピーク時間に合わせて調整
- 理由: 「会議/プレゼン時に最高のパフォーマンスを発揮」

### 3. パーソナライズされた推奨

**学習要素:**
- 過去の摂取パターンと覚醒度の相関
- ユーザーの好みの摂取時間帯
- 効果的だった摂取タイミング

**個別化:**
- 早起き型（朝型）vs 夜型の考慮
- 睡眠の質による調整
- 週末 vs 平日のパターン

### 4. 視覚的な推奨表示

**ダッシュボードの推奨カード:**
```
┌─────────────────────────────────────┐
│ 🎯 スマート推奨                       │
│                                     │
│ 14:30に100mgの摂取を推奨              │
│                                     │
│ 理由:                                │
│ • 15:00頃に覚醒度の谷が予測されます    │
│ • 午後のパフォーマンスが最大化されます  │
│                                     │
│ 予測効果:                            │
│ 覚醒度 65 → 78 (+13)                 │
│                                     │
│ [今すぐ記録] [30分後にリマインド]      │
└─────────────────────────────────────┘
```

**チャート上の推奨マーカー:**
- 推奨タイミングに星マーク⭐を表示
- ホバーで詳細な理由を表示
- 推奨を採用した場合の予測カーブを点線で表示

### 5. カレンダー連携（将来機能）

**Phase 1: 手動イベント入力**
- 重要な予定の時刻を手動入力
- その時刻に合わせた最適摂取タイミングを計算

**Phase 2: カレンダーAPI連携**
- Google Calendar / Outlook連携
- 会議やイベントを自動検出
- イベントの重要度に応じた推奨

**Phase 3: スマート学習**
- 定期的なイベント（毎週の会議など）を学習
- パターンを認識して自動推奨

## 技術仕様

### データモデル拡張

```typescript
interface SmartRecommendation {
  // 推奨ID
  id: string;
  
  // 推奨タイプ
  type: 'afternoon_dip' | 'performance_max' | 'event_prep' | 'general';
  
  // 推奨時刻
  recommendedTime: string; // HH:mm
  
  // 推奨量
  recommendedAmount: number; // mg
  
  // 理由
  reasons: string[];
  
  // 予測効果
  predictedEffect: {
    currentAlertness: number;
    predictedAlertness: number;
    improvement: number;
  };
  
  // 信頼度スコア
  confidenceScore: number; // 0-100
  
  // 有効期限
  expiresAt: number; // timestamp
  
  // 関連イベント（オプション）
  relatedEvent?: {
    title: string;
    time: string;
    importance: 'low' | 'medium' | 'high';
  };
}

interface UserEvent {
  id: string;
  title: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  date: string; // YYYY-MM-DD
  importance: 'low' | 'medium' | 'high';
  requiresAlertness: boolean; // 集中力が必要か
}
```

### 新規関数

```typescript
/**
 * スマート推奨を生成
 */
function generateSmartRecommendations(
  sleepData: SleepData,
  intakeRecords: IntakeRecord[],
  alertnessData: AlertnessDataPoint[],
  userEvents: UserEvent[] = []
): SmartRecommendation[] {
  const recommendations: SmartRecommendation[] = [];
  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;
  
  // 1. アフタヌーンディップ対策の推奨
  const dip = predictAlertnessDip(sleepData.lastSleepEnd);
  const dipStartHour = timeToDecimalHours(dip.dipStart);
  const optimalPreDipTime = dipStartHour - 0.75; // 45分前
  
  if (currentHour < optimalPreDipTime && optimalPreDipTime < currentHour + 2) {
    const currentAlertness = getCurrentAlertness(alertnessData);
    const predictedAlertness = predictAlertness(
      sleepData,
      [...intakeRecords, { time: formatTime(optimalPreDipTime), amount: 100 }]
    );
    
    recommendations.push({
      id: generateId(),
      type: 'afternoon_dip',
      recommendedTime: formatTime(optimalPreDipTime),
      recommendedAmount: 100,
      reasons: [
        `${dip.dipStart}頃に覚醒度の谷が予測されます`,
        '午後のパフォーマンスを維持できます',
        'カフェインのピーク時間と谷のタイミングが一致します'
      ],
      predictedEffect: {
        currentAlertness,
        predictedAlertness,
        improvement: predictedAlertness - currentAlertness
      },
      confidenceScore: 85,
      expiresAt: now.getTime() + (60 * 60 * 1000) // 1時間有効
    });
  }
  
  // 2. 重要イベント対策の推奨
  for (const event of userEvents) {
    if (!event.requiresAlertness) continue;
    
    const eventHour = timeToDecimalHours(event.startTime);
    const optimalIntakeTime = eventHour - 0.75; // 45分前
    
    if (currentHour < optimalIntakeTime && optimalIntakeTime < currentHour + 3) {
      const amount = event.importance === 'high' ? 150 : 100;
      
      recommendations.push({
        id: generateId(),
        type: 'event_prep',
        recommendedTime: formatTime(optimalIntakeTime),
        recommendedAmount: amount,
        reasons: [
          `${event.startTime}の「${event.title}」に向けて準備`,
          'カフェインのピーク時間とイベント開始が一致します',
          '最高のパフォーマンスを発揮できます'
        ],
        predictedEffect: calculateEventPrepEffect(sleepData, intakeRecords, amount, optimalIntakeTime),
        confidenceScore: 90,
        expiresAt: now.getTime() + (2 * 60 * 60 * 1000), // 2時間有効
        relatedEvent: {
          title: event.title,
          time: event.startTime,
          importance: event.importance
        }
      });
    }
  }
  
  // 3. パフォーマンス最大化の推奨
  const performanceRec = generatePerformanceMaxRecommendation(
    sleepData,
    intakeRecords,
    alertnessData
  );
  if (performanceRec) {
    recommendations.push(performanceRec);
  }
  
  // 信頼度スコアでソート
  return recommendations.sort((a, b) => b.confidenceScore - a.confidenceScore);
}

/**
 * 覚醒度の谷を予測
 */
function predictAlertnessDip(wakeTime: string): {
  dipStart: string;
  dipPeak: string;
  dipEnd: string;
  severity: 'mild' | 'moderate' | 'severe';
} {
  const wakeHour = timeToDecimalHours(wakeTime);
  
  // 標準的なディップは起床後6-9時間
  const dipStart = (wakeHour + 6) % 24;
  const dipPeak = (wakeHour + 7) % 24;
  const dipEnd = (wakeHour + 9) % 24;
  
  return {
    dipStart: formatTime(dipStart),
    dipPeak: formatTime(dipPeak),
    dipEnd: formatTime(dipEnd),
    severity: 'moderate' // 将来的に睡眠データから計算
  };
}

/**
 * 推奨の有効性を評価（学習用）
 */
function evaluateRecommendationEffectiveness(
  recommendation: SmartRecommendation,
  actualIntake: IntakeRecord | null,
  actualAlertness: number
): {
  wasFollowed: boolean;
  predictedImprovement: number;
  actualImprovement: number;
  accuracy: number;
} {
  const wasFollowed = actualIntake !== null && 
    Math.abs(timeToDecimalHours(actualIntake.time) - 
             timeToDecimalHours(recommendation.recommendedTime)) < 0.5;
  
  if (!wasFollowed) {
    return {
      wasFollowed: false,
      predictedImprovement: 0,
      actualImprovement: 0,
      accuracy: 0
    };
  }
  
  const predictedImprovement = recommendation.predictedEffect.improvement;
  const actualImprovement = actualAlertness - recommendation.predictedEffect.currentAlertness;
  const accuracy = 100 - Math.abs(predictedImprovement - actualImprovement) / predictedImprovement * 100;
  
  return {
    wasFollowed: true,
    predictedImprovement,
    actualImprovement,
    accuracy: Math.max(0, Math.min(100, accuracy))
  };
}
```

### Context拡張

```typescript
interface FlowStateContextType {
  // ... 既存のプロパティ
  
  // 新規追加
  smartRecommendations: SmartRecommendation[];
  userEvents: UserEvent[];
  addUserEvent: (event: Omit<UserEvent, 'id'>) => void;
  removeUserEvent: (id: string) => void;
  dismissRecommendation: (id: string) => void;
  followRecommendation: (recommendation: SmartRecommendation) => void;
}
```

## UI/UX設計

### 1. ダッシュボードの推奨カード（拡張版）

```
┌─────────────────────────────────────┐
│ 🎯 スマート推奨                       │
│                                     │
│ ⭐ 最適タイミング: 14:30              │
│ 推奨量: 100mg                        │
│                                     │
│ 📊 予測効果                          │
│ ┌─────────────────────────────┐    │
│ │ 現在  ████████░░ 65          │    │
│ │ 予測  ████████████ 78 (+13)  │    │
│ └─────────────────────────────┘    │
│                                     │
│ 💡 理由                              │
│ • 15:00頃に覚醒度の谷が予測されます    │
│ • 午後のパフォーマンスが最大化されます  │
│ • カフェインのピーク時間と一致します   │
│                                     │
│ 信頼度: ████████░░ 85%              │
│                                     │
│ [今すぐ記録] [リマインド] [却下]      │
└─────────────────────────────────────┘
```

### 2. チャート上の推奨マーカー

```
覚醒度チャート:
100 ┤
 90 ┤     ╱╲
 80 ┤    ╱  ╲⭐
 70 ┤   ╱    ╲╱╲
 60 ┤  ╱        ╲
 50 ┤ ╱          ╲
    └─────────────────
    6  9  12 15 18 21

⭐ = 推奨タイミング
ホバーで詳細表示
```

### 3. イベント管理画面

```
┌─────────────────────────────────────┐
│ 📅 今日の予定                         │
│                                     │
│ [+ 予定を追加]                        │
│                                     │
│ ┌─────────────────────────────┐    │
│ │ 🔴 重要な会議                 │    │
│ │ 15:00 - 16:00                │    │
│ │ 集中力が必要                  │    │
│ │                              │    │
│ │ 💡 推奨: 14:15に100mg摂取     │    │
│ │ [編集] [削除]                 │    │
│ └─────────────────────────────┘    │
│                                     │
│ ┌─────────────────────────────┐    │
│ │ 🟡 チームミーティング          │    │
│ │ 10:30 - 11:00                │    │
│ │ [編集] [削除]                 │    │
│ └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

### 4. 推奨履歴と効果分析

```
┌─────────────────────────────────────┐
│ 📊 推奨の効果分析                     │
│                                     │
│ 過去7日間の推奨:                      │
│ • 採用率: 65% (13/20)                │
│ • 平均精度: 82%                       │
│ • 平均改善: +12ポイント                │
│                                     │
│ 最も効果的だった推奨:                  │
│ ┌─────────────────────────────┐    │
│ │ アフタヌーンディップ対策       │    │
│ │ 採用: 9/10回                  │    │
│ │ 平均改善: +15ポイント          │    │
│ └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

## 通知とリマインダー

### プッシュ通知（PWA実装後）

```
🎯 Flow State

最適な摂取タイミングです！

14:30に100mgの摂取を推奨
午後の眠気を予防できます

[今すぐ記録] [30分後]
```

### アプリ内リマインダー

```
┌─────────────────────────────────────┐
│ ⏰ リマインダー                       │
│                                     │
│ 推奨時刻になりました                  │
│                                     │
│ 14:30 - 100mg                       │
│ アフタヌーンディップ対策               │
│                                     │
│ [記録する] [スヌーズ(15分)] [キャンセル] │
└─────────────────────────────────────┘
```

## テストケース

### 単体テスト

```typescript
describe('generateSmartRecommendations', () => {
  it('アフタヌーンディップ前に推奨を生成', () => {
    const sleepData = { lastSleepEnd: '07:00' };
    const now = new Date('2026-02-09T13:00:00');
    
    const recs = generateSmartRecommendations(sleepData, [], [], []);
    
    const dipRec = recs.find(r => r.type === 'afternoon_dip');
    expect(dipRec).toBeDefined();
    expect(dipRec?.recommendedTime).toBe('13:15'); // ディップ(14:00)の45分前
  });
  
  it('重要イベント前に推奨を生成', () => {
    const event: UserEvent = {
      id: '1',
      title: '重要な会議',
      startTime: '15:00',
      endTime: '16:00',
      date: '2026-02-09',
      importance: 'high',
      requiresAlertness: true
    };
    
    const recs = generateSmartRecommendations(sleepData, [], [], [event]);
    
    const eventRec = recs.find(r => r.type === 'event_prep');
    expect(eventRec).toBeDefined();
    expect(eventRec?.recommendedAmount).toBe(150); // 重要度highで150mg
    expect(eventRec?.relatedEvent?.title).toBe('重要な会議');
  });
});

describe('predictAlertnessDip', () => {
  it('起床後6-9時間にディップを予測', () => {
    const dip = predictAlertnessDip('07:00');
    
    expect(dip.dipStart).toBe('13:00'); // 7:00 + 6h
    expect(dip.dipPeak).toBe('14:00');  // 7:00 + 7h
    expect(dip.dipEnd).toBe('16:00');   // 7:00 + 9h
  });
});
```

## 国際化

### 日本語 (ja)

```json
{
  "smartRecommendation": {
    "title": "スマート推奨",
    "optimalTiming": "最適タイミング",
    "recommendedAmount": "推奨量",
    "predictedEffect": "予測効果",
    "reasons": "理由",
    "confidence": "信頼度",
    "actions": {
      "recordNow": "今すぐ記録",
      "remind": "リマインド",
      "dismiss": "却下"
    },
    "types": {
      "afternoonDip": "アフタヌーンディップ対策",
      "performanceMax": "パフォーマンス最大化",
      "eventPrep": "イベント準備",
      "general": "一般推奨"
    },
    "events": {
      "title": "今日の予定",
      "addEvent": "予定を追加",
      "importance": {
        "low": "低",
        "medium": "中",
        "high": "高"
      },
      "requiresAlertness": "集中力が必要"
    }
  }
}
```

### 英語 (en)

```json
{
  "smartRecommendation": {
    "title": "Smart Recommendation",
    "optimalTiming": "Optimal Timing",
    "recommendedAmount": "Recommended Amount",
    "predictedEffect": "Predicted Effect",
    "reasons": "Reasons",
    "confidence": "Confidence",
    "actions": {
      "recordNow": "Record Now",
      "remind": "Remind Me",
      "dismiss": "Dismiss"
    },
    "types": {
      "afternoonDip": "Afternoon Dip Prevention",
      "performanceMax": "Performance Maximization",
      "eventPrep": "Event Preparation",
      "general": "General Recommendation"
    },
    "events": {
      "title": "Today's Schedule",
      "addEvent": "Add Event",
      "importance": {
        "low": "Low",
        "medium": "Medium",
        "high": "High"
      },
      "requiresAlertness": "Requires Focus"
    }
  }
}
```

## 実装優先度

**Phase 1 (必須):**
- アフタヌーンディップ予測
- 基本的なスマート推奨生成
- ダッシュボードの推奨カード

**Phase 2 (推奨):**
- チャート上の推奨マーカー
- 手動イベント入力機能
- イベントベースの推奨

**Phase 3 (オプション):**
- カレンダーAPI連携
- 推奨効果の学習と改善
- パーソナライズされた推奨
- プッシュ通知

## 関連ファイル

**新規作成:**
- `src/lib/smartRecommendations.ts` - 推奨ロジック
- `src/components/SmartRecommendationCard.tsx` - 推奨カード
- `src/components/EventManager.tsx` - イベント管理
- `src/components/RecommendationHistory.tsx` - 推奨履歴

**変更:**
- `src/context/FlowStateContext.tsx` - Context拡張
- `src/pages/DashboardPage.tsx` - 推奨カード表示
- `src/components/AlertnessChart.tsx` - 推奨マーカー追加
- `src/lib/caffeine.ts` - 予測関数の追加
- `src/types/index.ts` - 型定義追加
- `src/locales/ja/translation.json` - 翻訳追加
- `src/locales/en/translation.json` - 翻訳追加

## 参考文献

- Borbély, A. A. (1982). A two process model of sleep regulation
- Monk, T. H. (2005). The post-lunch dip in performance
- Waterhouse, J., et al. (2007). The circadian rhythm of core temperature
- Nehlig, A. (2010). Is caffeine a cognitive enhancer?
