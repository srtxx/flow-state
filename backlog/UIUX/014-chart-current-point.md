# チャート現在時刻ポイント強調

**優先度**: 🟢 低  
**カテゴリ**: UX  
**見積もり時間**: 30分

## 問題
チャート上の「NOW」指標が線のみで、現在の覚醒度との視覚的関連が弱い。

## 解決策
1. 現在時刻のデータポイントをドットで強調表示
2. ツールチップを常時表示（またはホバー不要で表示）

## 実装案
```tsx
// AlertnessChart.tsx
<ReferenceDot
    x={currentTimeStr}
    y={currentAlertness}
    r={8}
    fill="#171717"
    stroke="#fff"
    strokeWidth={2}
/>
```

## 対象ファイル
- `src/components/AlertnessChart.tsx`

## 完了条件
- [ ] 現在時刻にドットマーカー表示
- [ ] ドットに現在の覚醒度ラベル表示
- [ ] カフェインブースト領域を異なる色でハイライト
