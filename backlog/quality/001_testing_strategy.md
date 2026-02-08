# テスト戦略: UT/探索的テスト導入

## 概要
flow-stateアプリの品質向上のため、ユニットテスト（UT）と探索的テストの体制を構築する。

## プロジェクト構造分析

### テスト可能なモジュール

| レイヤー | ファイル | テスト優先度 | 理由 |
|---------|----------|-------------|------|
| **Pure Functions (lib)** | `caffeine.ts` | 🔴 最高 | ビジネスロジックの核心。純粋関数でモック不要 |
| **Hooks** | `useAlertness.ts` | 🟠 高 | 複雑な計算とメモ化ロジック |
| **Hooks** | `useLocalStorage.ts` | 🟡 中 | localStorage操作、エッジケース多い |
| **Components** | 各コンポーネント | 🟢 低 | UIはスナップショットテスト程度 |

### caffeine.ts の関数一覧（UTの最優先対象）

1. `calculateCaffeineEffect(amount, hoursSinceIntake)` - カフェイン効果計算
2. `calculateBaselineAlertness(hoursFromWake, sleepData, actualSleepHours)` - 基礎覚醒度
3. `calculateActualSleepHours(sleepStart, sleepEnd)` - 睡眠時間計算
4. `timeToDecimalHours(timeStr)` - 時刻変換
5. `getHoursFromWake(wakeTime)` - 起床からの経過時間
6. `generateAlertnessData(...)` - 24時間分のデータ生成
7. `getRecommendedIntakeTime(...)` - 次の摂取推奨
8. `generateId()` - ID生成
9. `getCurrentTimeString()` - 現在時刻文字列
10. `getAvoidAfterTime(expectedSleepTime)` - 摂取終了時刻

---

## 推奨テスト戦略

### Phase 1: テスト環境構築

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

**設定ファイルの追加:**
- `vitest.config.ts` - Vitest設定
- `src/test/setup.ts` - テストセットアップ

**package.json への追加:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

---

### Phase 2: ユニットテスト実装

#### 2.1 caffeine.ts のUT（最優先）

**ファイル:** `src/lib/__tests__/caffeine.test.ts`

| テストケース | 目的 |
|-------------|------|
| `calculateCaffeineEffect` 正常系 | 吸収・減衰の計算精度 |
| `calculateCaffeineEffect` 境界値 | 負の時間、ゼロ、長時間 |
| `calculateActualSleepHours` 日跨ぎ | 23:00→07:00 のケース |
| `timeToDecimalHours` フォーマット | 様々な時刻形式 |
| `generateAlertnessData` 統合 | データ点の整合性 |

#### 2.2 useLocalStorage のUT

**ファイル:** `src/hooks/__tests__/useLocalStorage.test.ts`

| テストケース | 目的 |
|-------------|------|
| 初期値の取得 | localStorage空の場合 |
| 値の永続化 | setValueでlocalStorageに保存 |
| 他タブからの変更検知 | StorageEventハンドリング |
| JSON parse エラー | 破損データの処理 |

---

### Phase 3: 探索的テスト

#### 3.1 シナリオベースのテストシート

| シナリオ | 検証ポイント |
|---------|-------------|
| 🌅 朝の使用フロー | 睡眠データ入力→初回カフェイン記録→グラフ表示 |
| ☕ 1日複数杯 | 累積効果の計算、400mg上限警告 |
| 🌙 夜間アクセス | 摂取終了時刻の表示、推奨なし |
| 📱 日付変更 | データのリセット、過去データの処理 |
| 🔄 ブラウザリロード | 状態の永続化確認 |

#### 3.2 エッジケースチェックリスト

- [ ] 24時間を超える睡眠時間入力
- [ ] 未来の時刻でのカフェイン摂取記録
- [ ] localStorage削除後のアプリ動作
- [ ] 極端なカフェイン量（0mg、9999mg）

---

## 実装ロードマップ

| # | タスク | 見積もり | 依存 |
|---|--------|---------|------|
| 1 | Vitest環境セットアップ | 30分 | - |
| 2 | caffeine.ts UT作成 | 2時間 | 1 |
| 3 | useLocalStorage UT作成 | 1時間 | 1 |
| 4 | useAlertness UT作成 | 1.5時間 | 2 |
| 5 | 探索的テストシート作成 | 30分 | - |
| 6 | CI/CD テスト統合 | 30分 | 1-4 |

**合計見積もり:** 約6時間

---

## 期待される成果

- **コードカバレッジ:** lib/ 80%以上、hooks/ 70%以上
- **リグレッション防止:** 主要ロジックの変更時に自動検知
- **探索的テスト:** 月1回のシナリオ実行でUX品質監視
