# レスポンシブデザイン対応

**優先度**: 🔴 高  
**カテゴリ**: レイアウト  
**見積もり時間**: 2時間

## 問題
- iPad/デスクトップ幅での最適化がない
- コンテンツが全幅に広がってしまう

## 解決策
1. max-widthコンテナを設定（例: 480px モバイル / 768px タブレット）
2. メディアクエリでブレークポイント対応
3. グリッドレイアウトの調整

## 対象ファイル
- `src/App.css`

## 具体的な変更

```css
.app-container {
  max-width: 480px;
  margin: 0 auto;
}

@media (min-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  .favorites-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

## 完了条件
- [ ] 480px max-widthコンテナ実装
- [ ] デスクトップ表示でセンタリングされる
- [ ] タブレット表示でグリッド配置が最適化される
