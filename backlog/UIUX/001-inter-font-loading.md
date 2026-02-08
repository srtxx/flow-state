# Interフォント読み込み追加

**優先度**: 🔴 高  
**カテゴリ**: フォント  
**見積もり時間**: 15分

## 問題
- CSS変数で`--font-sans: 'Inter'`を指定しているが、実際のフォント読み込みが未定義
- フォールバックのsystem-uiで表示されている可能性あり

## 解決策
`index.html`の`<head>`にGoogle Fonts追加:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;300;400;700&display=swap" rel="stylesheet">
```

## 完了条件
- [ ] Google Fontsリンクをindex.htmlに追加
- [ ] 各font-weight (100, 300, 400, 700) が読み込まれていることを確認
- [ ] デベロッパーツールでフォント適用を確認
