# ページ遷移アニメーション

**優先度**: 🟡 中  
**カテゴリ**: アニメーション  
**見積もり時間**: 1.5時間

## 問題
- タブ切替時にページが即座に切り替わる
- スムーズさに欠ける

## 解決策
1. CSS transitions でフェードイン/アウト
2. または Framer Motion 導入

## 対象ファイル
- `src/App.tsx`
- `src/App.css`

## シンプルな実装例

```css
.page {
  animation: fadeIn 200ms ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
```

## 完了条件
- [ ] タブ切替時にフェードアニメーション
- [ ] モーダル表示時にスライドイン
- [ ] 過度でない適切なアニメーション速度
