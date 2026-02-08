# 摂取記録の削除機能

**優先度**: 🟡 中  
**カテゴリ**: 機能  
**見積もり時間**: 1時間

## 問題
- 誤って記録した摂取データを削除できない
- 履歴が永続的に残ってしまう

## 解決策
1. スワイプ削除（モバイルUX）
2. 削除確認ダイアログ

## 対象ファイル
- `src/pages/TrackPage.tsx`
- `src/App.tsx`（deleteIntake handler追加）

## 具体的な変更

```typescript
// App.tsx
const handleDeleteIntake = useCallback((id: string) => {
  setIntakeRecords(prev => prev.filter(r => r.id !== id));
}, [setIntakeRecords]);
```

## 完了条件
- [ ] 履歴アイテムに削除ボタン追加
- [ ] 削除確認ダイアログ表示
- [ ] LocalStorageから正しく削除
