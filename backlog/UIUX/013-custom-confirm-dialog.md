# カスタム削除確認ダイアログ

**優先度**: 🟡 中  
**カテゴリ**: UX  
**見積もり時間**: 45分

## 問題
現在、削除確認に `window.confirm()` を使用しており、ネイティブダイアログがUX品質を損なっている。

```typescript
// 現在の実装
const deleteIntake = useCallback((id: string) => {
    if (window.confirm('この記録を削除しますか？')) {
        setIntakeRecords(prev => prev.filter(record => record.id !== id));
    }
}, [setIntakeRecords]);
```

## 解決策
カスタムモーダルコンポーネントで削除確認を実装。

## 実装案
1. `ConfirmDialog.tsx` コンポーネント作成
2. Context に `showConfirm(message, onConfirm)` 関数追加
3. JournalPage での削除時に使用

## 対象ファイル
- `src/components/modals/ConfirmDialog.tsx` - 新規作成
- `src/context/FlowStateContext.tsx` - 確認ダイアログ状態追加
- `src/pages/JournalPage.tsx` - 使用箇所更新

## 完了条件
- [ ] ConfirmDialogコンポーネント作成
- [ ] デザインがアプリのSoft UIスタイルと統一
- [ ] キャンセル/確認ボタン配置
- [ ] 既存の `window.confirm` を置換
