# UT-002: caffeine.ts 基本関数 ユニットテスト

## 概要
`src/lib/caffeine.ts` の純粋関数に対するユニットテストを作成する。

## 対象関数

| 関数名 | 優先度 | 複雑度 |
|--------|--------|--------|
| `calculateCaffeineEffect` | 🔴 高 | 高 |
| `calculateBaselineAlertness` | 🔴 高 | 高 |
| `calculateActualSleepHours` | 🟠 中 | 低 |
| `timeToDecimalHours` | 🟢 低 | 低 |

## テストファイル
`src/lib/__tests__/caffeine.test.ts`

## テストケース

### calculateCaffeineEffect
```typescript
describe('calculateCaffeineEffect', () => {
  it('摂取直後は効果が低い（吸収中）', () => {
    expect(calculateCaffeineEffect(100, 0)).toBe(0);
  });
  
  it('45分後にピーク効果', () => {
    const effect = calculateCaffeineEffect(100, 0.75);
    expect(effect).toBeGreaterThan(10);
  });
  
  it('5時間後に半減', () => {
    const peak = calculateCaffeineEffect(100, 0.75);
    const fiveHours = calculateCaffeineEffect(100, 5.75);
    expect(fiveHours).toBeCloseTo(peak * 0.5, 0);
  });
  
  it('負の時間は0を返す', () => {
    expect(calculateCaffeineEffect(100, -1)).toBe(0);
  });
});
```

### calculateActualSleepHours
```typescript
describe('calculateActualSleepHours', () => {
  it('同日の睡眠時間を計算', () => {
    expect(calculateActualSleepHours('01:00', '08:00')).toBe(7);
  });
  
  it('日跨ぎの睡眠時間を計算', () => {
    expect(calculateActualSleepHours('23:00', '07:00')).toBe(8);
  });
  
  it('分を含む時刻の計算', () => {
    expect(calculateActualSleepHours('23:30', '07:00')).toBe(7.5);
  });
});
```

### calculateBaselineAlertness
```typescript
describe('calculateBaselineAlertness', () => {
  const goodSleep: SleepData = {
    avgSleepHours: 7,
    lastSleepStart: '23:00',
    lastSleepEnd: '06:00',
    sleepQuality: 'good'
  };
  
  it('起床直後は中程度の覚醒度', () => {
    const result = calculateBaselineAlertness(0, goodSleep, 7);
    expect(result).toBeGreaterThan(30);
    expect(result).toBeLessThan(70);
  });
  
  it('睡眠不足でペナルティ', () => {
    const normal = calculateBaselineAlertness(4, goodSleep, 7);
    const deprived = calculateBaselineAlertness(4, goodSleep, 4);
    expect(deprived).toBeLessThan(normal);
  });
  
  it('睡眠品質が低いと覚醒度低下', () => {
    const poorSleep = { ...goodSleep, sleepQuality: 'poor' as const };
    const good = calculateBaselineAlertness(4, goodSleep, 7);
    const poor = calculateBaselineAlertness(4, poorSleep, 7);
    expect(poor).toBeLessThan(good);
  });
});
```

## 完了条件
- [ ] 全4関数のテスト作成
- [ ] テスト全PASS
- [ ] カバレッジ 80%以上

## 見積もり
1.5時間

## 依存
UT-001
