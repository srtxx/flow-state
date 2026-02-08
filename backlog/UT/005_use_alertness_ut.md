# UT-005: useAlertness フック ユニットテスト

## 概要
`src/hooks/useAlertness.ts` のカスタムフックに対するユニットテスト。

## テストファイル
`src/hooks/__tests__/useAlertness.test.ts`

## テストケース

```typescript
import { renderHook } from '@testing-library/react';
import { useAlertness } from '../useAlertness';
import type { SleepData, IntakeRecord } from '../../types';

describe('useAlertness', () => {
  const sleepData: SleepData = {
    avgSleepHours: 7,
    lastSleepStart: '23:00',
    lastSleepEnd: '07:00',
    sleepQuality: 'good'
  };
  
  const intakeRecords: IntakeRecord[] = [];
  
  it('actualSleepHoursを正しく計算', () => {
    const { result } = renderHook(() => useAlertness(sleepData, intakeRecords));
    expect(result.current.actualSleepHours).toBe(8);
  });
  
  it('alertnessDataが48ポイント生成される', () => {
    const { result } = renderHook(() => useAlertness(sleepData, intakeRecords));
    expect(result.current.alertnessData).toHaveLength(48);
  });
  
  it('currentAlertnessが有効な範囲', () => {
    const { result } = renderHook(() => useAlertness(sleepData, intakeRecords));
    expect(result.current.currentAlertness).toBeGreaterThanOrEqual(0);
    expect(result.current.currentAlertness).toBeLessThanOrEqual(100);
  });
  
  it('simulateIntakeでpredictedDataが変化', () => {
    const withoutSim = renderHook(() => useAlertness(sleepData, intakeRecords));
    const withSim = renderHook(() => 
      useAlertness(sleepData, intakeRecords, { time: '14:00', amount: 100 })
    );
    
    // カフェイン効果が予測データに反映
    const predicted = withSim.result.current.predictedData;
    const hasCaffeine = predicted.some(d => d.caffeine > 0);
    expect(hasCaffeine).toBe(true);
  });
  
  it('totalCaffeineTodayが正しく集計される', () => {
    const intakes: IntakeRecord[] = [
      { id: '1', time: '08:00', amount: 100, drink: 'COFFEE', timestamp: 1 },
      { id: '2', time: '13:00', amount: 80, drink: 'TEA', timestamp: 2 },
    ];
    const { result } = renderHook(() => useAlertness(sleepData, intakes));
    expect(result.current.totalCaffeineToday).toBe(180);
  });
  
  it('intakeCountが正しい', () => {
    const intakes: IntakeRecord[] = [
      { id: '1', time: '08:00', amount: 100, drink: 'COFFEE', timestamp: 1 },
      { id: '2', time: '13:00', amount: 80, drink: 'TEA', timestamp: 2 },
    ];
    const { result } = renderHook(() => useAlertness(sleepData, intakes));
    expect(result.current.intakeCount).toBe(2);
  });
  
  it('avoidAfterTimeが返される', () => {
    const { result } = renderHook(() => useAlertness(sleepData, intakeRecords));
    expect(result.current.avoidAfterTime).toMatch(/\d{2}:\d{2}/);
  });
});
```

## メモ化テスト

```typescript
describe('useAlertness memoization', () => {
  it('sleepDataが同じならalertnessDataは再計算されない', () => {
    const { result, rerender } = renderHook(
      ({ sleep }) => useAlertness(sleep, []),
      { initialProps: { sleep: sleepData } }
    );
    
    const first = result.current.alertnessData;
    rerender({ sleep: sleepData });
    const second = result.current.alertnessData;
    
    expect(first).toBe(second); // 参照が同じ
  });
});
```

## 完了条件
- [ ] 全返却値のテスト
- [ ] メモ化動作の確認
- [ ] テスト全PASS

## 見積もり
1.5時間

## 依存
UT-001, UT-002, UT-003
