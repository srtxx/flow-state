# ⚠️ 短期間での過剰摂取アラート

**優先度**: 中  
**カテゴリ**: 安全機能  
**影響範囲**: 新機能追加

## 概要

短期間に大量のカフェインを摂取した場合に、健康リスクを警告するアラート機能を実装する。

## 背景

急速なカフェイン摂取は以下のリスクを伴う：
- 心拍数の急激な上昇
- 不安感・焦燥感の増加
- 手の震え
- 胃腸の不快感
- 血圧の急上昇

## 機能要件

### 1. 短期間摂取量の監視

**2時間以内の摂取量チェック:**
- 閾値: 200mg以上
- 警告レベル: 中（Warning）
- メッセージ: 「2時間以内に200mg以上のカフェインを摂取しています。心拍数の上昇や不安感に注意してください。」

**1時間以内の摂取量チェック:**
- 閾値: 150mg以上
- 警告レベル: 高（Critical）
- メッセージ: 「1時間以内に150mg以上のカフェインを摂取しています。急速摂取は心拍数上昇や不安感のリスクがあります。水分補給を心がけてください。」

### 2. アラート表示タイミング

- 摂取記録追加時にリアルタイムチェック
- 摂取モーダルの確認前にシミュレーション表示
- ダッシュボードに警告バッジを表示（該当する場合）

### 3. 急速摂取バッジ

**表示条件:**
- 現在時刻から2時間以内に200mg以上摂取している場合

**バッジデザイン:**
- アイコン: ⚡ (稲妻マーク)
- 色: オレンジ (#F59E0B)
- テキスト: "急速摂取"
- 位置: ダッシュボードのステータスインジケーター付近

### 4. リスク説明

警告ダイアログに以下の情報を含める：

**短期的リスク:**
- 心拍数の上昇（動悸）
- 不安感・焦燥感
- 手の震え
- 集中力の低下（過剰摂取による逆効果）

**推奨アクション:**
- 水分を多めに摂取する
- 深呼吸やストレッチで落ち着く
- 次の摂取まで3-4時間空ける
- 症状が続く場合は医療機関に相談

## 技術仕様

### データモデル拡張

```typescript
interface RapidIntakeAlert {
  level: 'warning' | 'critical';
  timeWindow: 1 | 2; // hours
  totalAmount: number;
  threshold: number;
  message: string;
  recommendations: string[];
}
```

### 新規関数

```typescript
/**
 * 短期間での過剰摂取をチェック
 */
function checkRapidIntake(
  intakeRecords: IntakeRecord[],
  currentTime: Date
): RapidIntakeAlert | null {
  // 1時間以内の摂取量チェック
  const oneHourAgo = currentTime.getTime() - (60 * 60 * 1000);
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
  
  // 2時間以内の摂取量チェック
  const twoHoursAgo = currentTime.getTime() - (2 * 60 * 60 * 1000);
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
```

### Context拡張

```typescript
interface FlowStateContextType {
  // ... 既存のプロパティ
  
  // 新規追加
  rapidIntakeAlert: RapidIntakeAlert | null;
}
```

## UI/UX設計

### 1. 摂取モーダルでの事前警告

摂取確認前に、追加後の状態をシミュレーションして警告を表示：

```
⚠️ 警告
この摂取により、2時間以内の総摂取量が220mgになります。
急速なカフェイン摂取は心拍数上昇や不安感のリスクがあります。

本当に記録しますか？
[キャンセル] [理解して記録]
```

### 2. ダッシュボードの警告バッジ

現在のステータスインジケーターの横に表示：

```
┌─────────────────────────┐
│ 覚醒度: 78              │
│ ステータス: Good ⚡急速摂取 │
└─────────────────────────┘
```

### 3. ジャーナルページの警告表示

該当する摂取記録に警告アイコンを表示：

```
⚡ 14:30 - コーヒーL (200mg)
   13:00 - エナジードリンクS (80mg)
   ─────────────────────────
   ⚠️ 2時間以内に280mg摂取
```

## テストケース

### 単体テスト

```typescript
describe('checkRapidIntake', () => {
  it('1時間以内に150mg以上でcriticalアラート', () => {
    const records = [
      { timestamp: now - 30 * 60 * 1000, amount: 100 },
      { timestamp: now - 45 * 60 * 1000, amount: 80 }
    ];
    const alert = checkRapidIntake(records, new Date(now));
    expect(alert?.level).toBe('critical');
    expect(alert?.totalAmount).toBe(180);
  });
  
  it('2時間以内に200mg以上でwarningアラート', () => {
    const records = [
      { timestamp: now - 90 * 60 * 1000, amount: 150 },
      { timestamp: now - 110 * 60 * 1000, amount: 80 }
    ];
    const alert = checkRapidIntake(records, new Date(now));
    expect(alert?.level).toBe('warning');
    expect(alert?.totalAmount).toBe(230);
  });
  
  it('閾値未満の場合はnull', () => {
    const records = [
      { timestamp: now - 30 * 60 * 1000, amount: 80 }
    ];
    const alert = checkRapidIntake(records, new Date(now));
    expect(alert).toBeNull();
  });
});
```

## 国際化

### 日本語 (ja)

```json
{
  "alerts": {
    "rapidIntake": {
      "title": "急速摂取の警告",
      "badge": "急速摂取",
      "critical": "1時間以内に{amount}mgのカフェインを摂取しています。",
      "warning": "2時間以内に{amount}mgのカフェインを摂取しています。",
      "risks": {
        "title": "考えられるリスク",
        "heartRate": "心拍数の上昇",
        "anxiety": "不安感・焦燥感",
        "tremor": "手の震え",
        "concentration": "集中力の低下"
      },
      "recommendations": {
        "title": "推奨アクション",
        "hydrate": "水分を多めに摂取する",
        "breathe": "深呼吸で落ち着く",
        "wait": "次の摂取まで3-4時間空ける",
        "consult": "症状が続く場合は医療機関に相談"
      }
    }
  }
}
```

### 英語 (en)

```json
{
  "alerts": {
    "rapidIntake": {
      "title": "Rapid Intake Warning",
      "badge": "Rapid Intake",
      "critical": "You've consumed {amount}mg of caffeine within 1 hour.",
      "warning": "You've consumed {amount}mg of caffeine within 2 hours.",
      "risks": {
        "title": "Potential Risks",
        "heartRate": "Increased heart rate",
        "anxiety": "Anxiety and restlessness",
        "tremor": "Hand tremors",
        "concentration": "Reduced concentration"
      },
      "recommendations": {
        "title": "Recommended Actions",
        "hydrate": "Drink plenty of water",
        "breathe": "Practice deep breathing",
        "wait": "Wait 3-4 hours before next intake",
        "consult": "Consult a doctor if symptoms persist"
      }
    }
  }
}
```

## 実装優先度

**Phase 1 (必須):**
- checkRapidIntake関数の実装
- 摂取モーダルでの事前警告
- Context統合

**Phase 2 (推奨):**
- ダッシュボードの警告バッジ
- ジャーナルページの警告表示
- 国際化対応

**Phase 3 (オプション):**
- 詳細なリスク説明ダイアログ
- ユーザー設定で閾値カスタマイズ
- 警告履歴の記録

## 関連ファイル

**新規作成:**
- `src/lib/alerts.ts` - アラートロジック
- `src/components/RapidIntakeAlert.tsx` - 警告コンポーネント
- `src/components/RapidIntakeBadge.tsx` - バッジコンポーネント

**変更:**
- `src/context/FlowStateContext.tsx` - Context拡張
- `src/components/modals/IntakeModal.tsx` - 事前警告追加
- `src/pages/DashboardPage.tsx` - バッジ表示
- `src/pages/JournalPage.tsx` - 警告アイコン表示
- `src/locales/ja/translation.json` - 翻訳追加
- `src/locales/en/translation.json` - 翻訳追加

## 参考文献

- FDA: Spilling the Beans: How Much Caffeine is Too Much?
- Mayo Clinic: Caffeine: How much is too much?
- NIH: Caffeine consumption and health effects
