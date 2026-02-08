# 🔴 推奨摂取カットオフ時刻のハードコーディング

**優先度**: 高  
**影響範囲**: caffeine.ts

## 問題

カフェイン摂取推奨のカットオフ時刻が18:00に固定されている。

```typescript
// 睡眠時刻が固定値（23:00想定）
const cutoffHour = 18; // 6pm
```

## 影響

ユーザーの実際の睡眠スケジュールが反映されず、就寝時刻が異なるユーザーには不適切な推奨が行われる。

## 解決策

`sleepData.lastSleepStart`を参照して動的にカットオフ時刻を計算。

```typescript
export function getRecommendedIntakeTime(
    sleepData: SleepData,  // _sleepDataから変更
    currentIntakes: IntakeRecord[]
): { time: string; amount: number; reason: string } | null {
    const sleepHour = timeToDecimalHours(sleepData.lastSleepStart);
    const cutoffHour = sleepHour - 5; // 睡眠の5時間前
    // ...
}
```

## 関連ファイル

- `src/lib/caffeine.ts` (L173-L210)
