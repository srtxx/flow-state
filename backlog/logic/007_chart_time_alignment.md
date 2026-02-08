# 🟢 チャートの時刻形式アライメント

**優先度**: 低  
**影響範囲**: AlertnessChart.tsx

## 問題

現在時刻マーカーが30分刻みにスナップされており、チャートのデータポイントと一致しない場合がある。

```typescript
const currentTimeStr = `${...}:${now.getMinutes() < 30 ? '00' : '30'}`;
```

## 影響

ReferenceLineが正確に現在時刻を指していない可能性。

## 解決策

データポイント生成時の時刻形式と一致させる、または補間位置を計算。

## 関連ファイル

- `src/components/AlertnessChart.tsx` (L49-L50)
