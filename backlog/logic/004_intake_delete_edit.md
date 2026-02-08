# 🟡 摂取記録の削除・編集機能

**優先度**: 中  
**影響範囲**: TrackPage.tsx, App.tsx

## 問題

摂取記録の追加機能のみで、削除・編集機能が存在しない。

## 影響

誤入力時にリカバリー手段がなく、UXが低下。

## 解決策

### 削除機能

```typescript
// App.tsx
const handleDeleteIntake = useCallback((id: string) => {
    setIntakeRecords(prev => prev.filter(r => r.id !== id));
}, [setIntakeRecords]);
```

### UI実装

TrackPageのhistory-itemにスワイプ削除または削除ボタンを追加。

## 関連ファイル

- `src/App.tsx`
- `src/pages/TrackPage.tsx` (L86-L103)
