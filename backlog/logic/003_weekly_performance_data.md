# 🟡 Weekly Performanceのハードコーディング

**優先度**: 中  
**影響範囲**: OptimizePage.tsx

## 問題

Weekly Performanceセクションの値が静的にハードコードされている。

```tsx
<p className="performance-value">82</p>
<span>+5 from last week</span>
```

## 影響

ユーザーに誤った情報を表示している。

## 解決策

### オプション A: 機能を一時的に非表示

MVPリリースまでは当該セクションをコメントアウトまたは削除。

### オプション B: 実データから集計（推奨）

1. 日次の覚醒スコア履歴をLocalStorageに保存
2. 過去7日間の平均を計算
3. 前週との比較機能を実装

## 関連ファイル

- `src/pages/OptimizePage.tsx` (L137-L156)
