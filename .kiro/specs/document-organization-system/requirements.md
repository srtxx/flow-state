# Requirements Document

## Introduction

このドキュメントは、Kiroの再利用可能な機能として、ワークスペース内のドキュメントを整理・管理するシステムの要件を定義します。この機能は、Kiro Skillとして実装され、任意のワークスペースで実行可能です。ユーザーは多数のドキュメントファイル（.agent/、.kiro/、backlog/など）を持っており、どのドキュメントが必要でどれが不要かを判断し、整理したいと考えています。このシステムは、ドキュメントをスキャンし、メタデータを収集し、重要度を評価し、整理結果を提供します。

## Glossary

- **System**: ドキュメント整理管理システム（Kiro Skillとして実装）
- **Document**: ワークスペース内のマークダウンファイル（.md）またはテキストファイル
- **Metadata**: ドキュメントの作成日、最終更新日、ファイルサイズ、カテゴリなどの情報
- **Status**: ドキュメントの必要性を示すステータス（必要/不要/要確認）
- **Scan_Result**: スキャンされたドキュメントの一覧とそのメタデータ
- **Organization_Report**: 整理結果を含むマークダウン形式のレポート
- **Reference**: あるドキュメントから別のドキュメントへのリンクまたは参照
- **Category**: ドキュメントの種類（spec、workflow、skill、backlogなど）
- **Skill_Config**: Kiro Skillの設定ファイル（SKILL.md）
- **Workflow**: Kiro Workflowとして実行可能な一連の処理

## Requirements

### Requirement 1: ドキュメントスキャン

**User Story:** As a user, I want to scan all documents in my workspace, so that I can get a complete inventory of what files exist.

#### Acceptance Criteria

1. WHEN the user initiates a scan, THE System SHALL recursively search all directories in the workspace for document files
2. WHEN scanning directories, THE System SHALL include .md files and exclude node_modules, .git, and dist directories
3. WHEN a document is found, THE System SHALL record its file path relative to the workspace root
4. WHEN the scan completes, THE System SHALL return a Scan_Result containing all discovered documents

### Requirement 2: メタデータ収集

**User Story:** As a user, I want to collect metadata for each document, so that I can understand the characteristics of my documents.

#### Acceptance Criteria

1. WHEN processing a document, THE System SHALL extract the file creation timestamp
2. WHEN processing a document, THE System SHALL extract the last modification timestamp
3. WHEN processing a document, THE System SHALL calculate the file size in bytes
4. WHEN processing a document, THE System SHALL determine the Category based on the file path
5. WHEN processing a document, THE System SHALL count the number of lines in the file
6. WHEN all metadata is collected, THE System SHALL store it in the Scan_Result

### Requirement 3: 参照関係の分析

**User Story:** As a user, I want to analyze reference relationships between documents, so that I can understand which documents are interconnected.

#### Acceptance Criteria

1. WHEN analyzing a document, THE System SHALL scan the content for markdown links to other documents
2. WHEN analyzing a document, THE System SHALL scan the content for file path references
3. WHEN a Reference is found, THE System SHALL record both the source and target document paths
4. WHEN analysis completes, THE System SHALL build a reference graph showing all document relationships
5. WHEN a document is referenced by other documents, THE System SHALL count the number of incoming references

### Requirement 4: 重複チェック

**User Story:** As a user, I want to detect duplicate or similar documents, so that I can eliminate redundancy.

#### Acceptance Criteria

1. WHEN comparing documents, THE System SHALL calculate a content hash for each document
2. WHEN two documents have identical content hashes, THE System SHALL mark them as exact duplicates
3. WHEN comparing documents, THE System SHALL calculate content similarity based on file size and line count
4. WHEN two documents have similar sizes and line counts, THE System SHALL mark them as potential duplicates
5. WHEN duplicates are found, THE System SHALL include this information in the evaluation

### Requirement 5: 重要度評価

**User Story:** As a user, I want the system to evaluate the importance of each document, so that I can prioritize which documents to keep.

#### Acceptance Criteria

1. WHEN evaluating a document, THE System SHALL assign higher importance to documents with incoming references
2. WHEN evaluating a document, THE System SHALL assign higher importance to recently modified documents
3. WHEN evaluating a document, THE System SHALL assign lower importance to documents with no references and old modification dates
4. WHEN evaluating a document, THE System SHALL assign lower importance to duplicate documents
5. WHEN evaluation completes, THE System SHALL calculate an importance score for each document

### Requirement 6: ステータス付与

**User Story:** As a user, I want each document to be assigned a status, so that I can quickly identify what action to take.

#### Acceptance Criteria

1. WHEN a document has high importance score, THE System SHALL assign Status "必要" (necessary)
2. WHEN a document has low importance score and no references, THE System SHALL assign Status "不要" (unnecessary)
3. WHEN a document is a duplicate, THE System SHALL assign Status "不要" (unnecessary) to all but one copy
4. WHEN a document has medium importance score, THE System SHALL assign Status "要確認" (needs review)
5. WHEN all documents are processed, THE System SHALL ensure every document has an assigned Status

### Requirement 7: 整理結果の出力

**User Story:** As a user, I want to receive an organization report in markdown format, so that I can review and act on the recommendations.

#### Acceptance Criteria

1. WHEN generating the report, THE System SHALL create an Organization_Report in markdown format
2. WHEN generating the report, THE System SHALL group documents by Status
3. WHEN generating the report, THE System SHALL include metadata for each document
4. WHEN generating the report, THE System SHALL include the importance score and reasoning for each document
5. WHEN generating the report, THE System SHALL save the Organization_Report to a file in the workspace root

### Requirement 8: アーカイブと削除の提案

**User Story:** As a user, I want to receive actionable recommendations for unnecessary documents, so that I can clean up my workspace.

#### Acceptance Criteria

1. WHEN a document has Status "不要", THE System SHALL include it in the deletion recommendations section
2. WHEN recommending deletion, THE System SHALL provide the reason why the document is considered unnecessary
3. WHEN recommending deletion, THE System SHALL suggest creating an archive directory for backup
4. WHEN generating recommendations, THE System SHALL provide command examples for moving or deleting files
5. WHEN the report is complete, THE System SHALL include a summary count of documents by Status

### Requirement 9: 設定可能なスキャン範囲

**User Story:** As a user, I want to configure which directories to scan, so that I can focus on specific areas of my workspace.

#### Acceptance Criteria

1. WHERE custom scan paths are provided, THE System SHALL scan only the specified directories
2. WHERE exclude patterns are provided, THE System SHALL skip directories matching those patterns
3. WHERE no configuration is provided, THE System SHALL use default scan paths (.agent, .kiro, backlog, docs)
4. WHEN configuration is invalid, THE System SHALL return an error message and use defaults
5. THE System SHALL allow configuration through a JSON configuration file

### Requirement 10: エラーハンドリング

**User Story:** As a developer, I want the system to handle errors gracefully, so that the scan can complete even if some files are inaccessible.

#### Acceptance Criteria

1. IF a file cannot be read, THEN THE System SHALL log the error and continue scanning
2. IF a directory cannot be accessed, THEN THE System SHALL log the error and skip that directory
3. IF metadata extraction fails, THEN THE System SHALL use default values and mark the document for review
4. IF the output file cannot be written, THEN THE System SHALL return an error message to the user
5. WHEN errors occur, THE System SHALL include an error summary in the Organization_Report

### Requirement 11: Kiro Skillとしての統合

**User Story:** As a Kiro user, I want to use this as a reusable skill, so that I can organize documents in any workspace.

#### Acceptance Criteria

1. THE System SHALL be packaged as a Kiro Skill with a SKILL.md configuration file
2. WHEN invoked as a skill, THE System SHALL accept workspace path as a parameter
3. WHEN invoked as a skill, THE System SHALL accept configuration options through skill parameters
4. THE System SHALL be discoverable through Kiro's skill registry
5. THE System SHALL follow Kiro's skill naming and structure conventions

### Requirement 12: Workflowとしての実行

**User Story:** As a Kiro user, I want to execute this as a workflow, so that I can automate document organization tasks.

#### Acceptance Criteria

1. THE System SHALL provide a workflow definition file for Kiro
2. WHEN executed as a Workflow, THE System SHALL perform all steps automatically
3. WHEN executed as a Workflow, THE System SHALL allow user confirmation before deletion
4. THE System SHALL support both interactive and non-interactive workflow modes
5. THE System SHALL log all workflow actions for audit purposes

**User Story:** As a developer, I want the system to handle errors gracefully, so that the scan can complete even if some files are inaccessible.

#### Acceptance Criteria

1. IF a file cannot be read, THEN THE System SHALL log the error and continue scanning
2. IF a directory cannot be accessed, THEN THE System SHALL log the error and skip that directory
3. IF metadata extraction fails, THEN THE System SHALL use default values and mark the document for review
4. IF the output file cannot be written, THEN THE System SHALL return an error message to the user
5. WHEN errors occur, THE System SHALL include an error summary in the Organization_Report
