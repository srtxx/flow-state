# 🟡 useLocalStorageの依存配列最適化

**優先度**: 中  
**影響範囲**: useLocalStorage.ts

## 問題

`setValue`関数に`storedValue`が依存配列に含まれており、値が変わるたびに新しい関数が生成される。

```typescript
const setValue = useCallback((value) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    // ...
}, [key, storedValue]); // ← storedValueが変わるたびに再生成
```

## 影響

`setValue`を依存配列に含む他のhookが不必要に再実行される可能性。

## 解決策

`useRef`を使用してstableな参照を維持。

```typescript
const storedValueRef = useRef(storedValue);
storedValueRef.current = storedValue;

const setValue = useCallback((value) => {
    const valueToStore = value instanceof Function 
        ? value(storedValueRef.current) 
        : value;
    // ...
}, [key]);
```

## 関連ファイル

- `src/hooks/useLocalStorage.ts` (L22-L33)
