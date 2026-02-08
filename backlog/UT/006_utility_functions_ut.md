# UT-006: ユーティリティ関数 ユニットテスト

## 概要
`caffeine.ts` の小規模ユーティリティ関数のテスト。

## 対象関数

| 関数名 | 用途 |
|--------|------|
| `timeToDecimalHours` | 時刻文字列を小数時間に変換 |
| `generateId` | 一意のID生成 |
| `getCurrentTimeString` | 現在時刻を HH:mm 形式で取得 |

## テストファイル
`src/lib/__tests__/caffeine-utils.test.ts`

## テストケース

### timeToDecimalHours
```typescript
describe('timeToDecimalHours', () => {
  it('整数時刻を変換', () => {
    expect(timeToDecimalHours('09:00')).toBe(9);
    expect(timeToDecimalHours('14:00')).toBe(14);
  });
  
  it('30分を0.5として変換', () => {
    expect(timeToDecimalHours('09:30')).toBe(9.5);
  });
  
  it('15分を0.25として変換', () => {
    expect(timeToDecimalHours('09:15')).toBe(9.25);
  });
  
  it('23:59を正しく変換', () => {
    expect(timeToDecimalHours('23:59')).toBeCloseTo(23.983, 2);
  });
  
  it('00:00を正しく変換', () => {
    expect(timeToDecimalHours('00:00')).toBe(0);
  });
});
```

### generateId
```typescript
describe('generateId', () => {
  it('文字列を返す', () => {
    expect(typeof generateId()).toBe('string');
  });
  
  it('空文字列ではない', () => {
    expect(generateId().length).toBeGreaterThan(0);
  });
  
  it('連続呼び出しで異なるIDを生成', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });
});
```

### getCurrentTimeString
```typescript
describe('getCurrentTimeString', () => {
  it('HH:mm形式で返す', () => {
    const result = getCurrentTimeString();
    expect(result).toMatch(/^\d{2}:\d{2}$/);
  });
  
  it('有効な時刻範囲', () => {
    const result = getCurrentTimeString();
    const [h, m] = result.split(':').map(Number);
    expect(h).toBeGreaterThanOrEqual(0);
    expect(h).toBeLessThan(24);
    expect(m).toBeGreaterThanOrEqual(0);
    expect(m).toBeLessThan(60);
  });
});
```

## 完了条件
- [ ] 全関数のテスト作成
- [ ] テスト全PASS

## 見積もり
30分

## 依存
UT-001
