# 🟢 未使用変数の整理

**優先度**: 低  
**影響範囲**: 複数ファイル

## 問題

未使用の変数・引数が存在する。

### HomePage.tsx

```typescript
// _onSleepClickは宣言されているが未使用
onSleepClick: _onSleepClick
```

### caffeine.ts

```typescript
// _sleepDataは関数内で使用されていない
export function getRecommendedIntakeTime(
    _sleepData: SleepData,  // 未使用
    currentIntakes: IntakeRecord[]
)
```

## 解決策

1. `HomePage.tsx`: propsから`onSleepClick`を削除するか、適切に使用
2. `caffeine.ts`: `_sleepData`を活用（#002の修正で解決予定）

## 関連ファイル

- `src/pages/HomePage.tsx` (L25)
- `src/lib/caffeine.ts` (L173-L176)
