# Configuration Files / 設定ファイル

このディレクトリには、Document Organization System の設定ファイルとサンプルが含まれています。

## ファイル一覧

### 1. `config.json`
**現在使用中の設定ファイル**

システムが実際に使用する設定ファイルです。このファイルを編集することで、スキャン対象やスコアリングの動作をカスタマイズできます。

### 2. `config.default.json`
**デフォルト設定（コメント付き）**

標準的な設定の例です。各フィールドの説明が含まれており、設定の意味を理解するのに役立ちます。

**特徴:**
- すべてのフィールドに説明コメントが付いています
- デフォルト値が設定されています
- 一般的なプロジェクトに適した設定です

**使用方法:**
```bash
# このファイルをベースに新しい設定を作成
cp config.default.json config.json
# 不要な *Description フィールドを削除して使用
```

### 3. `config.custom-example.json`
**カスタム設定例（コメント付き）**

プロジェクト固有のニーズに合わせた設定の例です。より多くのディレクトリをスキャンしたり、評価基準を調整したりする方法を示しています。

**特徴:**
- より多くのスキャン対象ディレクトリ
- より厳格な評価閾値
- 参照数を重視した重み付け
- 複数のドキュメント形式に対応

**使用例:**
- 大規模プロジェクト
- 厳格なドキュメント管理が必要な場合
- Markdown以外の形式も扱う場合

### 4. `config.minimal.json`
**最小限の設定例**

説明コメントを除いた、実際に使用できる最小限の設定です。

**特徴:**
- コメントや説明フィールドなし
- 必要なフィールドのみ
- そのまま使用可能

## 設定項目の詳細

### Scanner 設定

```json
{
  "scanner": {
    "includePaths": ["ディレクトリ1", "ディレクトリ2"],
    "excludePaths": ["除外ディレクトリ1", "除外ディレクトリ2"],
    "fileExtensions": [".md", ".txt"]
  }
}
```

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `includePaths` | string[] | スキャン対象のディレクトリパス（ワークスペースルートからの相対パス） |
| `excludePaths` | string[] | 除外するディレクトリパス |
| `fileExtensions` | string[] | スキャン対象のファイル拡張子 |

**推奨される includePaths:**
- `.agent` - Kiro Agent の設定やワークフロー
- `.kiro` - Kiro の仕様やスキル
- `backlog` - バックログやタスク
- `docs` - プロジェクトドキュメント
- `documentation` - 追加のドキュメント
- `wiki` - Wiki ページ
- `notes` - メモやノート

**推奨される excludePaths:**
- `node_modules` - Node.js の依存関係
- `.git` - Git リポジトリデータ
- `dist` / `build` - ビルド成果物
- `.vercel` / `.next` / `.nuxt` - デプロイメント関連
- `coverage` - テストカバレッジ
- `tmp` / `temp` - 一時ファイル

### Evaluator 設定

```json
{
  "evaluator": {
    "weights": {
      "referenceCount": 0.4,
      "recency": 0.3,
      "size": 0.1,
      "category": 0.2
    },
    "thresholds": {
      "necessary": 60,
      "unnecessary": 30
    }
  }
}
```

#### Weights（重み付け）

各要素の重要度を 0.0 〜 1.0 の範囲で設定します。**合計が 1.0 になる必要があります。**

| フィールド | デフォルト | 説明 |
|-----------|-----------|------|
| `referenceCount` | 0.4 | 他のドキュメントから参照されている数の重要度 |
| `recency` | 0.3 | 最終更新日の新しさの重要度 |
| `size` | 0.1 | ファイルサイズの重要度 |
| `category` | 0.2 | ドキュメントカテゴリの重要度 |

**調整のヒント:**
- **参照数を重視**: `referenceCount` を 0.5 以上に設定
- **最新性を重視**: `recency` を 0.4 以上に設定
- **サイズを無視**: `size` を 0.05 以下に設定
- **カテゴリを重視**: `category` を 0.3 以上に設定

#### Thresholds（閾値）

ドキュメントのステータスを判定する閾値を 0 〜 100 の範囲で設定します。

| フィールド | デフォルト | 説明 |
|-----------|-----------|------|
| `necessary` | 60 | この値以上のスコアは「必要」と判定 |
| `unnecessary` | 30 | この値以下のスコアは「不要」と判定 |

**判定ルール:**
- スコア ≥ `necessary` → **必要** (必須ドキュメント)
- `unnecessary` < スコア < `necessary` → **要確認** (レビューが必要)
- スコア ≤ `unnecessary` → **不要** (削除候補)

**調整のヒント:**
- **厳格な判定**: `necessary` を 70 以上、`unnecessary` を 40 以上に設定
- **緩やかな判定**: `necessary` を 50 以下、`unnecessary` を 20 以下に設定
- **広い要確認範囲**: 閾値の差を大きくする（例: 30 と 70）
- **狭い要確認範囲**: 閾値の差を小さくする（例: 45 と 55）

### Output 設定

```json
{
  "output": {
    "outputPath": "DOCUMENT_ORGANIZATION_REPORT.md",
    "includeMetadata": true,
    "includeReasoningDetails": true
  }
}
```

| フィールド | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| `outputPath` | string | `"DOCUMENT_ORGANIZATION_REPORT.md"` | レポートファイルの出力パス |
| `includeMetadata` | boolean | `true` | メタデータ（作成日、更新日、サイズなど）を含めるか |
| `includeReasoningDetails` | boolean | `true` | 判断理由の詳細を含めるか |

## 使用例

### 例1: デフォルト設定で開始

```bash
# デフォルト設定をコピー
cp config.default.json config.json

# 説明フィールドを削除（オプション）
# エディタで *Description フィールドを削除

# システムを実行
npm run organize
```

### 例2: カスタム設定を作成

```bash
# カスタム例をベースに作成
cp config.custom-example.json config.json

# 必要に応じて編集
# - includePaths を追加/削除
# - weights を調整
# - thresholds を変更

# システムを実行
npm run organize
```

### 例3: 最小限の設定

```bash
# 最小限の設定をコピー
cp config.minimal.json config.json

# そのまま使用可能
npm run organize
```

## 設定のベストプラクティス

### 1. Weights の調整

**参照重視型**（相互参照が多いドキュメント群）:
```json
{
  "referenceCount": 0.5,
  "recency": 0.2,
  "size": 0.05,
  "category": 0.25
}
```

**最新性重視型**（頻繁に更新されるドキュメント群）:
```json
{
  "referenceCount": 0.3,
  "recency": 0.5,
  "size": 0.05,
  "category": 0.15
}
```

**カテゴリ重視型**（特定のカテゴリを保護したい場合）:
```json
{
  "referenceCount": 0.3,
  "recency": 0.2,
  "size": 0.1,
  "category": 0.4
}
```

### 2. Thresholds の調整

**保守的な判定**（削除を慎重に）:
```json
{
  "necessary": 50,
  "unnecessary": 20
}
```

**積極的な判定**（不要なものを積極的に削除）:
```json
{
  "necessary": 70,
  "unnecessary": 40
}
```

**バランス型**（デフォルト）:
```json
{
  "necessary": 60,
  "unnecessary": 30
}
```

### 3. プロジェクトタイプ別の推奨設定

#### 小規模プロジェクト
```json
{
  "scanner": {
    "includePaths": [".kiro", "docs"],
    "excludePaths": ["node_modules", ".git"],
    "fileExtensions": [".md"]
  },
  "evaluator": {
    "weights": {
      "referenceCount": 0.4,
      "recency": 0.3,
      "size": 0.1,
      "category": 0.2
    },
    "thresholds": {
      "necessary": 50,
      "unnecessary": 25
    }
  }
}
```

#### 大規模プロジェクト
```json
{
  "scanner": {
    "includePaths": [".agent", ".kiro", "backlog", "docs", "wiki", "specs"],
    "excludePaths": ["node_modules", ".git", "dist", "coverage", "tmp"],
    "fileExtensions": [".md", ".txt", ".rst"]
  },
  "evaluator": {
    "weights": {
      "referenceCount": 0.5,
      "recency": 0.2,
      "size": 0.05,
      "category": 0.25
    },
    "thresholds": {
      "necessary": 70,
      "unnecessary": 40
    }
  }
}
```

#### アーカイブプロジェクト
```json
{
  "scanner": {
    "includePaths": [".agent", ".kiro", "backlog", "docs"],
    "excludePaths": ["node_modules", ".git", "dist", "archive"],
    "fileExtensions": [".md", ".txt"]
  },
  "evaluator": {
    "weights": {
      "referenceCount": 0.6,
      "recency": 0.1,
      "size": 0.05,
      "category": 0.25
    },
    "thresholds": {
      "necessary": 60,
      "unnecessary": 30
    }
  }
}
```

## トラブルシューティング

### 問題: 設定ファイルが読み込まれない

**解決策:**
1. ファイル名が `config.json` であることを確認
2. JSON 形式が正しいことを確認（カンマ、括弧など）
3. 説明フィールド（`*Description`）を削除

### 問題: Weights の合計が 1.0 にならない

**解決策:**
```javascript
// 計算例
0.4 + 0.3 + 0.1 + 0.2 = 1.0 ✓

// エラー例
0.5 + 0.3 + 0.1 + 0.2 = 1.1 ✗
```

合計が 1.0 になるように調整してください。

### 問題: すべてのドキュメントが「要確認」になる

**解決策:**
閾値の範囲を調整してください:
```json
{
  "thresholds": {
    "necessary": 70,  // より高く
    "unnecessary": 20  // より低く
  }
}
```

## 参考資料

- [Design Document](../design.md) - システムの設計詳細
- [Requirements Document](../requirements.md) - 要件定義
- [README](../README.md) - システムの使用方法

## サポート

設定に関する質問や問題がある場合は、プロジェクトの Issue を作成してください。
