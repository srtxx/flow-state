---
name: Document Organization System
description: Scans, analyzes, and organizes workspace documents with importance evaluation
---

# Document Organization System

A comprehensive tool for organizing and managing documents in your workspace. This skill scans your workspace for document files, analyzes their relationships, evaluates their importance, and provides actionable recommendations for cleanup and organization.

## Core Responsibilities

1. **Document Discovery**: Recursively scan workspace for all document files (.md, .txt) in specified directories
2. **Metadata Collection**: Extract creation date, modification date, file size, line count, and category for each document
3. **Reference Analysis**: Build a reference graph showing document relationships through markdown links and file path references
4. **Duplicate Detection**: Identify exact duplicates (via content hash) and similar documents (via size/line count comparison)
5. **Importance Evaluation**: Score documents (0-100) based on:
   - Reference count (40% weight): Documents referenced by others are more important
   - Recency (30% weight): Recently modified documents are more important
   - Category (20% weight): Certain categories (specs, workflows) have higher base importance
   - Size (10% weight): Larger documents may contain more valuable content
   - Duplicate penalty: Duplicate documents receive lower scores
6. **Status Assignment**: Categorize each document as:
   - **必要 (Necessary)**: Score ≥ 60, should be kept
   - **不要 (Unnecessary)**: Score ≤ 30 with no references, can be deleted
   - **要確認 (Needs Review)**: Score between 30-60, requires manual review
7. **Report Generation**: Create a comprehensive markdown report with:
   - Summary statistics (total documents, counts by status, duplicates found)
   - Documents grouped by status with metadata and reasoning
   - Deletion recommendations with command examples
   - Error summary (if any issues occurred during scanning)

## When to use this skill

- When you have accumulated many documents and need to organize them
- When you want to identify unused, outdated, or redundant documentation
- When you need to understand document relationships and dependencies
- When preparing for workspace cleanup or documentation audit
- When you want to ensure important documents are properly referenced
- Before archiving or migrating documentation to a new system

## Configuration

The skill accepts configuration through a `config.json` file or parameters. Default configuration:

```json
{
  "scanner": {
    "includePaths": [".agent", ".kiro", "backlog", "docs"],
    "excludePaths": ["node_modules", ".git", "dist", "build", ".vercel", ".npm-cache"],
    "fileExtensions": [".md", ".txt"]
  },
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
  },
  "output": {
    "outputPath": "DOCUMENT_ORGANIZATION_REPORT.md",
    "includeMetadata": true,
    "includeReasoningDetails": true
  }
}
```

### Configuration Options

**Scanner Configuration:**
- `includePaths`: Array of directory paths to scan (relative to workspace root)
- `excludePaths`: Array of directory patterns to exclude from scanning
- `fileExtensions`: Array of file extensions to include (e.g., [".md", ".txt"])

**Evaluator Configuration:**
- `weights`: Importance factor weights (must sum to 1.0)
  - `referenceCount`: Weight for number of incoming references (default: 0.4)
  - `recency`: Weight for last modification date (default: 0.3)
  - `size`: Weight for file size (default: 0.1)
  - `category`: Weight for document category (default: 0.2)
- `thresholds`: Score thresholds for status assignment
  - `necessary`: Minimum score for "必要" status (default: 60)
  - `unnecessary`: Maximum score for "不要" status (default: 30)

**Output Configuration:**
- `outputPath`: Path for the generated report (relative to workspace root)
- `includeMetadata`: Include detailed metadata in report (default: true)
- `includeReasoningDetails`: Include detailed reasoning for each document's score (default: true)

## Output Format

The skill generates a markdown report (`DOCUMENT_ORGANIZATION_REPORT.md` by default) with the following structure:

### 1. Summary Section
- Total documents scanned
- Count by status (必要/不要/要確認)
- Number of duplicates found
- Total size of all documents

### 2. Documents by Status
For each status category, documents are listed with:
- File path (relative to workspace root)
- Category (spec, workflow, skill, backlog, docs, config, other)
- Importance score (0-100)
- Metadata: size, line count, last modified date
- Reasoning: Explanation of why this score was assigned
- Incoming references: Count and list of documents that reference this one

### 3. Deletion Recommendations
For documents marked as "不要":
- List of files recommended for deletion
- Reason for each recommendation
- Suggested commands for archival or deletion
- Warning about reviewing before executing

### 4. Error Summary (if applicable)
- List of any errors encountered during scanning
- File paths where errors occurred
- Error messages and timestamps

## Usage

### Command Line Interface

The skill can be invoked from the command line:

```bash
# Basic usage - analyze current directory
document-organization-system .

# Analyze specific workspace
document-organization-system --workspace-path /path/to/workspace

# With custom configuration file
document-organization-system . --config-path ./config.json

# With inline configuration options
document-organization-system . --include-paths ".kiro,.agent,docs" --output-path "my-report.md"

# With verbose output
document-organization-system . --verbose

# Show help
document-organization-system --help
```

### JSON Input (for Kiro Integration)

The skill can accept parameters as JSON via stdin, which is useful for Kiro integration:

```bash
echo '{"workspacePath": ".", "includePaths": [".kiro", "docs"]}' | document-organization-system
```

### Programmatic Usage

```typescript
import { runDocumentOrganization } from './src/index';
import { ConfigManager } from './src/config';

// Use default configuration
const config = ConfigManager.getDefaults();

// Or load custom configuration
// const config = ConfigManager.load('./custom-config.json');

// Run the organization system
const result = await runDocumentOrganization('/path/to/workspace', config);

console.log(`Report generated: ${result.reportPath}`);
console.log(`Total documents: ${result.report.summary.totalDocuments}`);
console.log(`Unnecessary: ${result.report.summary.unnecessaryCount}`);
```

## Safety Features

**This skill NEVER deletes files automatically.** It only provides analysis and recommendations. Users must:
1. Review the generated report carefully
2. Manually verify recommendations
3. Execute any deletion or archival commands themselves

The skill is designed to be safe and non-destructive, allowing users to make informed decisions about their documentation.

## Document Categories

The skill automatically categorizes documents based on their file path:

- **spec**: Files in `.kiro/specs/` directories (design docs, requirements, tasks)
- **workflow**: Files in `.agent/workflows/` or `.kiro/workflows/` directories
- **skill**: Files in `.agent/skills/` or `.kiro/skills/` directories
- **backlog**: Files in `backlog/` directory
- **docs**: Files in `docs/` or `documentation/` directories
- **config**: Configuration files (`.json`, `.yaml`, `.yml`, `.toml`)
- **other**: All other documents

Categories influence importance scoring, with specs, workflows, and skills receiving higher base scores.

## Error Handling

The skill handles errors gracefully:

- **File read errors**: Logged and included in error summary, scanning continues
- **Directory access errors**: Logged and skipped, scanning continues with other directories
- **Metadata extraction failures**: Default values used, document marked for review
- **Invalid configuration**: Error message returned, defaults used as fallback
- **Output write failures**: Clear error message returned to user

All errors are collected and included in the final report for transparency.

## Performance Considerations

- **Large workspaces**: Files are processed in batches to manage memory
- **Content hashing**: Uses efficient hashing for duplicate detection without loading full content
- **Streaming**: Large files are read in streams to minimize memory usage
- **Progress reporting**: Provides progress updates for long-running scans

## Best Practices

1. **Review before deletion**: Always review the report carefully before deleting any files
2. **Create backups**: Archive unnecessary files before deletion for safety
3. **Customize configuration**: Adjust weights and thresholds based on your workspace needs
4. **Run periodically**: Regular scans help maintain a clean workspace
5. **Check references**: Verify that "unnecessary" documents truly have no dependencies
6. **Update regularly**: Keep the skill updated to benefit from improvements

## Limitations

- Only scans markdown (.md) and text (.txt) files by default
- Reference detection is based on markdown links and file paths (may miss some references)
- Similarity detection uses simple heuristics (size and line count)
- Does not analyze file content semantically (no NLP)
- Cannot detect references from code files to documentation

## Future Enhancements

- Interactive CLI mode for reviewing and acting on recommendations
- Git history integration for better importance evaluation
- Content-based similarity using NLP techniques
- Visual reference graph generation
- Support for additional file formats
- Automated archival with user confirmation
- Incremental scanning for large workspaces
