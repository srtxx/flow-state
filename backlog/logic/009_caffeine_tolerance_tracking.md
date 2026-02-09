# 📊 カフェイン耐性トラッキング

**優先度**: 中  
**カテゴリ**: 健康管理機能  
**影響範囲**: 新機能追加

## 概要

長期的なカフェイン摂取パターンを分析し、耐性形成の可能性をユーザーに通知する機能を実装する。

## 背景

### カフェイン耐性とは

カフェインを継続的に摂取すると、身体が適応して同じ量での効果が減少する現象。

**耐性形成のメカニズム:**
- アデノシン受容体の増加
- 肝臓の代謝酵素の活性化
- 神経系の適応

**耐性形成の兆候:**
- 同じ量で効果を感じにくくなる
- 摂取量が徐々に増加する傾向
- カフェインなしでの疲労感・頭痛

**健康への影響:**
- 依存性の増加
- 離脱症状のリスク上昇
- 睡眠の質の低下
- 心血管系への負担

## 機能要件

### 1. 耐性形成の検出

**検出条件:**
- 連続7日間で1日平均300mg以上の摂取
- または、過去14日間で10日以上が300mg超え
- または、週ごとの平均摂取量が20%以上増加

**警告レベル:**
- 軽度: 7日平均が300-350mg
- 中度: 7日平均が350-400mg
- 重度: 7日平均が400mg以上（FDA上限）

### 2. 通知タイミング

**初回通知:**
- 条件を満たした翌日の初回アプリ起動時
- プロフィールページに警告カードを表示

**定期通知:**
- 条件が継続している場合、週1回リマインド
- 改善が見られた場合は祝福メッセージ

### 3. 耐性リセットガイド

**推奨プラン:**

**段階的減量プラン（推奨）:**
- Week 1: 現在の摂取量の75%に減量
- Week 2: 現在の摂取量の50%に減量
- Week 3: 現在の摂取量の25%に減量
- Week 4: カフェインフリー期間（2-3日）

**急速リセットプラン（上級者向け）:**
- 2-3日間のカフェインフリー期間
- 離脱症状への対処法を提示
- 再開時は低用量から開始

**代替戦略:**
- カフェイン源の変更（コーヒー→紅茶）
- 摂取タイミングの最適化
- 非カフェイン性の覚醒方法の提案

### 4. 休息日の推奨

**カフェインフリーデー:**
- 週に1-2日のカフェイン休息日を推奨
- 休息日の効果を説明
- 休息日の達成をトラッキング

**効果:**
- 耐性のリセット
- 睡眠の質の改善
- カフェイン効果の回復

## 技術仕様

### データモデル拡張

```typescript
interface ToleranceData {
  // 耐性レベル
  level: 'none' | 'mild' | 'moderate' | 'severe';
  
  // 7日間の平均摂取量
  sevenDayAverage: number;
  
  // 14日間の高摂取日数
  highIntakeDays: number;
  
  // 週ごとの増加率
  weeklyIncreaseRate: number;
  
  // 最後の警告日
  lastWarningDate: string | null;
  
  // カフェインフリー日の記録
  caffeineFreeDays: string[]; // YYYY-MM-DD形式
  
  // リセットプランの進行状況
  resetPlan?: {
    type: 'gradual' | 'rapid';
    startDate: string;
    currentWeek: number;
    targetReduction: number;
  };
}

interface DailyScoreRecord {
  date: string;
  avgAlertness: number;
  totalCaffeine: number;
  
  // 新規追加
  isCaffeineFree?: boolean; // カフェインフリー日かどうか
}
```

### 新規関数

```typescript
/**
 * 耐性レベルを計算
 */
function calculateToleranceLevel(
  dailyScores: DailyScoreRecord[]
): ToleranceData {
  const last7Days = dailyScores.slice(-7);
  const last14Days = dailyScores.slice(-14);
  
  // 7日間の平均摂取量
  const sevenDayAverage = last7Days.reduce((sum, day) => 
    sum + day.totalCaffeine, 0) / last7Days.length;
  
  // 14日間で300mg超えの日数
  const highIntakeDays = last14Days.filter(day => 
    day.totalCaffeine >= 300).length;
  
  // 週ごとの増加率
  const firstWeekAvg = last14Days.slice(0, 7).reduce((sum, day) => 
    sum + day.totalCaffeine, 0) / 7;
  const secondWeekAvg = last14Days.slice(7, 14).reduce((sum, day) => 
    sum + day.totalCaffeine, 0) / 7;
  const weeklyIncreaseRate = ((secondWeekAvg - firstWeekAvg) / firstWeekAvg) * 100;
  
  // 耐性レベルの判定
  let level: ToleranceData['level'] = 'none';
  
  if (sevenDayAverage >= 400 || highIntakeDays >= 12) {
    level = 'severe';
  } else if (sevenDayAverage >= 350 || highIntakeDays >= 10) {
    level = 'moderate';
  } else if (sevenDayAverage >= 300 || highIntakeDays >= 7) {
    level = 'mild';
  }
  
  // カフェインフリー日の抽出
  const caffeineFreeDays = last14Days
    .filter(day => day.totalCaffeine === 0)
    .map(day => day.date);
  
  return {
    level,
    sevenDayAverage,
    highIntakeDays,
    weeklyIncreaseRate,
    lastWarningDate: null,
    caffeineFreeDays
  };
}

/**
 * リセットプランの推奨を生成
 */
function generateResetPlan(
  currentAverage: number,
  planType: 'gradual' | 'rapid'
): ResetPlanRecommendation {
  if (planType === 'gradual') {
    return {
      type: 'gradual',
      duration: 4, // weeks
      schedule: [
        { week: 1, target: Math.round(currentAverage * 0.75), description: '現在の75%に減量' },
        { week: 2, target: Math.round(currentAverage * 0.50), description: '現在の50%に減量' },
        { week: 3, target: Math.round(currentAverage * 0.25), description: '現在の25%に減量' },
        { week: 4, target: 0, description: '2-3日のカフェインフリー期間' }
      ],
      benefits: [
        '離脱症状が最小限',
        '日常生活への影響が少ない',
        '成功率が高い'
      ]
    };
  } else {
    return {
      type: 'rapid',
      duration: 1, // week
      schedule: [
        { day: 1, target: 0, description: 'カフェインフリー' },
        { day: 2, target: 0, description: 'カフェインフリー' },
        { day: 3, target: 0, description: 'カフェインフリー' },
        { day: 4, target: 50, description: '低用量から再開' }
      ],
      benefits: [
        '短期間で耐性リセット',
        '効果が早く実感できる'
      ],
      warnings: [
        '頭痛や疲労感が強く出る可能性',
        '週末など休める期間に実施推奨',
        '水分補給と十分な睡眠が必須'
      ]
    };
  }
}

/**
 * カフェインフリー日の達成状況を確認
 */
function checkCaffeineFreeGoal(
  dailyScores: DailyScoreRecord[],
  targetDaysPerWeek: number = 2
): {
  achieved: boolean;
  currentCount: number;
  targetCount: number;
  nextRecommendedDay: string;
} {
  const last7Days = dailyScores.slice(-7);
  const caffeineFreeDays = last7Days.filter(day => 
    day.totalCaffeine === 0 || day.isCaffeineFree === true
  );
  
  return {
    achieved: caffeineFreeDays.length >= targetDaysPerWeek,
    currentCount: caffeineFreeDays.length,
    targetCount: targetDaysPerWeek,
    nextRecommendedDay: suggestNextCaffeineFreeDay(dailyScores)
  };
}
```

### Context拡張

```typescript
interface FlowStateContextType {
  // ... 既存のプロパティ
  
  // 新規追加
  toleranceData: ToleranceData;
  showToleranceWarning: boolean;
  setShowToleranceWarning: (show: boolean) => void;
  startResetPlan: (planType: 'gradual' | 'rapid') => void;
  markCaffeineFreeDay: (date: string) => void;
}
```

## UI/UX設計

### 1. プロフィールページの警告カード

```
┌─────────────────────────────────────┐
│ ⚠️ 耐性形成の可能性                    │
│                                     │
│ 過去7日間の平均摂取量: 340mg          │
│ 高摂取日数（14日中）: 11日             │
│                                     │
│ カフェインへの耐性が形成されている      │
│ 可能性があります。効果を感じにくく      │
│ なっていませんか？                     │
│                                     │
│ [リセットプランを見る]                 │
│ [詳細を確認]                          │
└─────────────────────────────────────┘
```

### 2. リセットプラン選択画面

```
┌─────────────────────────────────────┐
│ 耐性リセットプラン                     │
│                                     │
│ 📅 段階的減量プラン（推奨）             │
│ 期間: 4週間                           │
│ • Week 1: 255mg/日（-25%）           │
│ • Week 2: 170mg/日（-50%）           │
│ • Week 3: 85mg/日（-75%）            │
│ • Week 4: カフェインフリー期間         │
│                                     │
│ ✅ 離脱症状が最小限                    │
│ ✅ 日常生活への影響が少ない             │
│                                     │
│ [このプランを開始]                     │
│                                     │
│ ⚡ 急速リセットプラン（上級者向け）      │
│ 期間: 3-4日                           │
│ • Day 1-3: カフェインフリー            │
│ • Day 4: 低用量から再開                │
│                                     │
│ ⚠️ 頭痛や疲労感が強く出る可能性         │
│                                     │
│ [このプランを開始]                     │
└─────────────────────────────────────┘
```

### 3. カフェインフリー日のトラッキング

```
┌─────────────────────────────────────┐
│ 今週のカフェインフリー日               │
│                                     │
│ 目標: 週2日                           │
│ 達成: 1日 / 2日                       │
│                                     │
│ 月 火 水 木 金 土 日                   │
│ ☕ ☕ 🚫 ☕ ☕ ☕ ☕                   │
│                                     │
│ 次の推奨日: 土曜日                     │
│                                     │
│ [今日をカフェインフリー日にする]        │
└─────────────────────────────────────┘
```

### 4. リセットプラン進行中の表示

```
┌─────────────────────────────────────┐
│ 📊 リセットプラン進行中                │
│                                     │
│ Week 2 / 4                          │
│ ████████░░░░░░░░ 50%                │
│                                     │
│ 今週の目標: 170mg/日                  │
│ 今日の摂取: 165mg ✅                  │
│                                     │
│ 順調です！この調子で続けましょう。       │
│                                     │
│ [プランを中止] [詳細を見る]            │
└─────────────────────────────────────┘
```

## 通知メッセージ

### 耐性形成の警告

**軽度（Mild）:**
```
💡 お知らせ

過去7日間の平均カフェイン摂取量が300mgを超えています。

カフェインへの耐性が形成され始めている可能性があります。
週に1-2日のカフェインフリー日を設けることをお勧めします。

[詳細を見る] [後で]
```

**中度（Moderate）:**
```
⚠️ 注意

過去7日間の平均カフェイン摂取量が350mgを超えています。

カフェインへの耐性が形成されている可能性が高いです。
効果を感じにくくなっていませんか？

耐性リセットプランの実施をお勧めします。

[リセットプランを見る] [後で]
```

**重度（Severe）:**
```
🚨 重要な警告

過去7日間の平均カフェイン摂取量が400mg（FDA推奨上限）に達しています。

カフェインへの強い耐性が形成されており、健康リスクが高まっています。

耐性リセットプランの実施を強くお勧めします。

[今すぐリセットプランを見る] [閉じる]
```

### 改善時の祝福メッセージ

```
🎉 素晴らしい！

カフェイン摂取量が健康的なレベルに改善されました！

過去7日間の平均: 220mg（-35%）

この調子で健康的なカフェイン習慣を維持しましょう。

[閉じる]
```

## テストケース

### 単体テスト

```typescript
describe('calculateToleranceLevel', () => {
  it('7日平均300mg以上でmild判定', () => {
    const scores = generateMockScores(7, 310);
    const tolerance = calculateToleranceLevel(scores);
    expect(tolerance.level).toBe('mild');
    expect(tolerance.sevenDayAverage).toBeGreaterThanOrEqual(300);
  });
  
  it('7日平均350mg以上でmoderate判定', () => {
    const scores = generateMockScores(7, 360);
    const tolerance = calculateToleranceLevel(scores);
    expect(tolerance.level).toBe('moderate');
  });
  
  it('7日平均400mg以上でsevere判定', () => {
    const scores = generateMockScores(7, 410);
    const tolerance = calculateToleranceLevel(scores);
    expect(tolerance.level).toBe('severe');
  });
  
  it('14日中10日以上が300mg超えでmoderate判定', () => {
    const scores = [
      ...generateMockScores(10, 320),
      ...generateMockScores(4, 150)
    ];
    const tolerance = calculateToleranceLevel(scores);
    expect(tolerance.level).toBe('moderate');
    expect(tolerance.highIntakeDays).toBeGreaterThanOrEqual(10);
  });
});

describe('checkCaffeineFreeGoal', () => {
  it('週2日のカフェインフリー日達成', () => {
    const scores = [
      { date: '2026-02-03', totalCaffeine: 0 },
      { date: '2026-02-04', totalCaffeine: 200 },
      { date: '2026-02-05', totalCaffeine: 0 },
      { date: '2026-02-06', totalCaffeine: 150 },
      { date: '2026-02-07', totalCaffeine: 180 },
      { date: '2026-02-08', totalCaffeine: 220 },
      { date: '2026-02-09', totalCaffeine: 190 }
    ];
    const result = checkCaffeineFreeGoal(scores, 2);
    expect(result.achieved).toBe(true);
    expect(result.currentCount).toBe(2);
  });
});
```

## 国際化

### 日本語 (ja)

```json
{
  "tolerance": {
    "title": "カフェイン耐性",
    "warning": {
      "mild": "耐性形成の可能性",
      "moderate": "耐性形成の警告",
      "severe": "重度の耐性形成"
    },
    "message": {
      "mild": "過去7日間の平均摂取量が300mgを超えています。",
      "moderate": "カフェインへの耐性が形成されている可能性が高いです。",
      "severe": "カフェインへの強い耐性が形成されています。"
    },
    "resetPlan": {
      "title": "耐性リセットプラン",
      "gradual": "段階的減量プラン",
      "rapid": "急速リセットプラン",
      "recommended": "推奨",
      "advanced": "上級者向け"
    },
    "caffeineFree": {
      "title": "カフェインフリー日",
      "goal": "週{count}日の目標",
      "achieved": "達成！",
      "nextDay": "次の推奨日: {day}"
    }
  }
}
```

### 英語 (en)

```json
{
  "tolerance": {
    "title": "Caffeine Tolerance",
    "warning": {
      "mild": "Potential Tolerance Formation",
      "moderate": "Tolerance Warning",
      "severe": "Severe Tolerance"
    },
    "message": {
      "mild": "Your 7-day average intake exceeds 300mg.",
      "moderate": "You likely have developed caffeine tolerance.",
      "severe": "You have developed strong caffeine tolerance."
    },
    "resetPlan": {
      "title": "Tolerance Reset Plan",
      "gradual": "Gradual Reduction Plan",
      "rapid": "Rapid Reset Plan",
      "recommended": "Recommended",
      "advanced": "Advanced"
    },
    "caffeineFree": {
      "title": "Caffeine-Free Days",
      "goal": "Goal: {count} days/week",
      "achieved": "Achieved!",
      "nextDay": "Next recommended: {day}"
    }
  }
}
```

## 実装優先度

**Phase 1 (必須):**
- calculateToleranceLevel関数の実装
- プロフィールページの警告カード
- 基本的な通知機能

**Phase 2 (推奨):**
- リセットプラン機能
- カフェインフリー日のトラッキング
- 進行状況の可視化

**Phase 3 (オプション):**
- 詳細な統計グラフ
- カスタマイズ可能な目標設定
- リセットプラン完了時の報酬システム

## 関連ファイル

**新規作成:**
- `src/lib/tolerance.ts` - 耐性計算ロジック
- `src/components/ToleranceWarningCard.tsx` - 警告カード
- `src/components/ResetPlanModal.tsx` - リセットプランモーダル
- `src/components/CaffeineFreeTracker.tsx` - カフェインフリー日トラッカー

**変更:**
- `src/context/FlowStateContext.tsx` - Context拡張
- `src/hooks/useDailyScore.ts` - 耐性計算の統合
- `src/pages/ProfilePage.tsx` - 警告カード表示
- `src/types/index.ts` - 型定義追加
- `src/locales/ja/translation.json` - 翻訳追加
- `src/locales/en/translation.json` - 翻訳追加

## 参考文献

- Juliano, L. M., & Griffiths, R. R. (2004). A critical review of caffeine withdrawal
- Nehlig, A. (2018). Interindividual Differences in Caffeine Metabolism and Factors Driving Caffeine Consumption
- Temple, J. L., et al. (2017). The Safety of Ingested Caffeine: A Comprehensive Review
