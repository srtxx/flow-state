# 🔴 日付境界の処理不備

**優先度**: 高  
**影響範囲**: caffeine.ts, useAlertness.ts

## 問題

摂取記録（IntakeRecord）に`timestamp`は存在するが、アラートネス計算時に日付フィルタリングが行われていない。

```typescript
interface IntakeRecord {
    time: string;  // HH:mm のみ
    timestamp: number; // 日付判定に未使用
}
```

## 影響

前日以前の摂取記録が今日のデータとして計算される可能性がある。

## 解決策

`generateAlertnessData`関数内で、当日分の摂取記録のみをフィルタリングする処理を追加。

```typescript
const todayStart = new Date();
todayStart.setHours(0, 0, 0, 0);
const todayRecords = intakeRecords.filter(r => r.timestamp >= todayStart.getTime());
```

## 関連ファイル

- `src/lib/caffeine.ts` (L119-L130)
- `src/hooks/useAlertness.ts`
