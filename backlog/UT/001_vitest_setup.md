# UT-001: Vitest テスト環境セットアップ

## 概要
Vite + React + TypeScript プロジェクト向けにVitestテスト環境を構築する。

## ゴール
- `npm test` でテスト実行可能
- `npm run test:coverage` でカバレッジレポート出力

## タスク

### 1. 依存パッケージ追加
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @vitest/coverage-v8
```

### 2. vitest.config.ts 作成
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'src/test/'],
    },
  },
});
```

### 3. src/test/setup.ts 作成
```typescript
import '@testing-library/jest-dom';
```

### 4. package.json scripts 追加
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage"
  }
}
```

### 5. tsconfig.json 更新
`compilerOptions.types` に `vitest/globals` 追加

## 完了条件
- [ ] `npm test` が正常実行
- [ ] サンプルテストが PASS
- [ ] カバレッジレポートが生成される

## 見積もり
30分

## 依存
なし
