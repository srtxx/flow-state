# UT-003: caffeine.ts 覚醒度データ生成 ユニットテスト

## 概要
24時間分の覚醒度データを生成する `generateAlertnessData` と推奨機能のテスト。

## 対象関数

| 関数名 | 優先度 | 複雑度 |
|--------|--------|--------|
| `generateAlertnessData` | 🔴 高 | 高 |
| `getRecommendedIntakeTime` | 🟠 中 | 中 |
| `getHoursFromWake` | 🟢 低 | 低 |
| `getAvoidAfterTime` | 🟢 低 | 低 |

## テストファイル
`src/lib/__tests__/caffeine-alertness.test.ts`

## テストケース

### generateAlertnessData
```typescript
describe('generateAlertnessData', () => {
  const sleepData: SleepData = {
    avgSleepHours: 7,
    lastSleepStart: '23:00',
    lastSleepEnd: '07:00',
    sleepQuality: 'good'
  };
  
  it('48データポイント（30分刻み×24時間）を生成', () => {
    const data = generateAlertnessData(sleepData, []);
    expect(data).toHaveLength(48);
  });
  
  it('各データポイントに必要なプロパティがある', () => {
    const data = generateAlertnessData(sleepData, []);
    expect(data[0]).toHaveProperty('time');
    expect(data[0]).toHaveProperty('baseline');
    expect(data[0]).toHaveProperty('caffeine');
    expect(data[0]).toHaveProperty('total');
  });
  
  it('カフェイン摂取なしの場合 caffeine=0', () => {
    const data = generateAlertnessData(sleepData, []);
    data.forEach(d => expect(d.caffeine).toBe(0));
  });
  
  it('カフェイン摂取ありの場合 効果が反映される', () => {
    const intake: IntakeRecord = {
      id: '1',
      time: '09:00',
      amount: 100,
      drink: 'COFFEE',
      timestamp: Date.now()
    };
    const data = generateAlertnessData(sleepData, [intake]);
    const afterIntake = data.find(d => d.time === '10:00');
    expect(afterIntake?.caffeine).toBeGreaterThan(0);
  });
  
  it('additionalIntake でシミュレーション可能', () => {
    const withSim = generateAlertnessData(sleepData, [], { time: '14:00', amount: 100 });
    const afterSim = withSim.find(d => d.time === '15:00');
    expect(afterSim?.caffeine).toBeGreaterThan(0);
  });
});
```

### getRecommendedIntakeTime
```typescript
describe('getRecommendedIntakeTime', () => {
  it('カフェイン400mg超えで null', () => {
    const intakes = [
      { id: '1', time: '08:00', amount: 200, drink: 'COFFEE', timestamp: 1 },
      { id: '2', time: '12:00', amount: 200, drink: 'COFFEE', timestamp: 2 },
    ] as IntakeRecord[];
    expect(getRecommendedIntakeTime(sleepData, intakes)).toBeNull();
  });
  
  it('直近2時間以内の摂取がなければ推奨を返す', () => {
    // 時刻に依存するためモック必要
  });
});
```

### getAvoidAfterTime
```typescript
describe('getAvoidAfterTime', () => {
  it('デフォルト23時就寝で17時を返す', () => {
    expect(getAvoidAfterTime()).toBe('17:00');
  });
  
  it('カスタム就寝時刻に対応', () => {
    expect(getAvoidAfterTime('22:00')).toBe('16:00');
  });
});
```

## 完了条件
- [ ] 全関数のテスト作成
- [ ] テスト全PASS
- [ ] エッジケース（日跨ぎ等）カバー

## 見積もり
1.5時間

## 依存
UT-001, UT-002
