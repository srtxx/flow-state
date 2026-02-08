# ダークモード実装

**優先度**: 🔴 高  
**カテゴリ**: テーマ  
**見積もり時間**: 2時間

## 問題
- ライトモードのみ対応
- 夜間使用時に目に負担がかかる

## 解決策
`prefers-color-scheme`メディアクエリでシステムテーマに追従

## 対象ファイル
- `src/App.css`

## 具体的な変更

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #0a0a0a;
    --color-text: #ffffff;
    --color-border: #333333;
    /* 他の色も反転 */
  }
  
  .app-container {
    background-color: var(--color-bg);
    color: var(--color-text);
  }
}
```

## 完了条件
- [ ] CSS変数をダークモード用に定義
- [ ] システム設定に追従してテーマ切替
- [ ] 全コンポーネントでダークモード表示確認
- [ ] 手動切替トグル追加（オプション）
