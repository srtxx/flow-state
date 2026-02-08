# PWA対応

**優先度**: 🟢 低  
**カテゴリ**: 機能強化  
**見積もり時間**: 3時間

## 問題
- オフライン時にアプリが使用できない
- ホーム画面に追加できない

## 解決策
1. manifest.json作成
2. Service Worker設定
3. vite-plugin-pwa導入

## 必要なファイル
- `public/manifest.json`
- `src/sw.ts` または vite-plugin-pwa

## 完了条件
- [ ] manifest.json作成（アイコン含む）
- [ ] Service Worker登録
- [ ] オフラインでもアプリ表示可能
- [ ] ホーム画面追加プロンプト表示
