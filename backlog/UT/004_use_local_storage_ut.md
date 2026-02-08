# UT-004: useLocalStorage フック ユニットテスト

## 概要
`src/hooks/useLocalStorage.ts` のカスタムフックに対するユニットテスト。

## テストファイル
`src/hooks/__tests__/useLocalStorage.test.ts`

## テストケース

```typescript
import { renderHook, act } from '@testing-library/react';
import useLocalStorage from '../useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  
  it('初期値を返す（localStorage空）', () => {
    const { result } = renderHook(() => useLocalStorage('key', 'default'));
    expect(result.current[0]).toBe('default');
  });
  
  it('localStorageに保存された値を読み込む', () => {
    localStorage.setItem('key', JSON.stringify('stored'));
    const { result } = renderHook(() => useLocalStorage('key', 'default'));
    expect(result.current[0]).toBe('stored');
  });
  
  it('setValueでlocalStorageに保存', () => {
    const { result } = renderHook(() => useLocalStorage('key', 'default'));
    act(() => {
      result.current[1]('newValue');
    });
    expect(localStorage.getItem('key')).toBe('"newValue"');
  });
  
  it('関数形式のsetValueをサポート', () => {
    const { result } = renderHook(() => useLocalStorage('counter', 0));
    act(() => {
      result.current[1](prev => prev + 1);
    });
    expect(result.current[0]).toBe(1);
  });
  
  it('オブジェクトの保存と復元', () => {
    const obj = { name: 'test', value: 123 };
    const { result } = renderHook(() => useLocalStorage('obj', {}));
    act(() => {
      result.current[1](obj);
    });
    expect(result.current[0]).toEqual(obj);
  });
  
  it('破損したJSONで初期値を返す', () => {
    localStorage.setItem('key', 'invalid-json');
    const { result } = renderHook(() => useLocalStorage('key', 'fallback'));
    expect(result.current[0]).toBe('fallback');
  });
  
  it('StorageEventで他タブの変更を検知', () => {
    const { result } = renderHook(() => useLocalStorage('key', 'initial'));
    
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'key',
        newValue: '"fromOtherTab"'
      }));
    });
    
    expect(result.current[0]).toBe('fromOtherTab');
  });
});
```

## エッジケース

| ケース | 期待動作 |
|--------|---------|
| localStorage無効環境 | 初期値を返す、エラーなし |
| null値の保存 | 正常動作 |
| 大きなデータ | QuotaExceeded エラーハンドリング |

## 完了条件
- [ ] 全テストケース作成
- [ ] テスト全PASS
- [ ] エッジケースカバー

## 見積もり
1時間

## 依存
UT-001
