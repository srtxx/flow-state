# シミュレーション予測ライン表示

**優先度**: 🔴 高  
**カテゴリ**: UX  
**見積もり時間**: 1時間

## 問題
カフェイン摂取を追加した後、効果がどのように推移するかをユーザーが事前に確認できない。

## 解決策
1. カフェイン追加前に「予測ライン」をチャートに表示
2. Quick Add/Custom入力時にリアルタイムでプレビュー

## 実装案
```typescript
// useAlertnessフックにシミュレーション機能は既に存在
// simulateIntake パラメータを活用
const { predictedData } = useAlertness(sleepData, intakeRecords, {
    time: selectedTime,
    amount: selectedAmount
});
```

## 対象ファイル
- `src/components/AlertnessChart.tsx` - 予測ラインの描画
- `src/components/modals/IntakeModal.tsx` - 入力時にプレビュー

## 完了条件
- [ ] IntakeModalでカフェイン量変更時にチャートプレビュー表示
- [ ] 予測ラインは点線で現在のラインと区別
- [ ] 「追加後の覚醒度」数値表示
