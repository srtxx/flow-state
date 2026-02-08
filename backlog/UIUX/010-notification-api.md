# 通知機能実装

**優先度**: 🟢 低  
**カテゴリ**: 機能  
**見積もり時間**: 2時間

## 問題
- OptimizePageの「通知を設定」ボタンが未実装
- 最適なカフェイン摂取タイミングを通知できない

## 解決策
1. Web Notifications API使用
2. 通知許可リクエスト
3. 指定時刻にリマインダー

## 対象ファイル
- `src/hooks/useNotification.ts`（新規）
- `src/pages/OptimizePage.tsx`

## 完了条件
- [ ] 通知許可リクエスト実装
- [ ] 指定時刻にブラウザ通知表示
- [ ] 通知設定のON/OFF切替
