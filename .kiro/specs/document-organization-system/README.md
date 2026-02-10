# Document Organization System

A comprehensive tool for organizing and managing documents in your workspace. This system scans, analyzes, and evaluates documents to help you identify which files are necessary, unnecessary, or need review.

## Features

- **Document Discovery**: Recursively scan workspace for all document files
- **Metadata Collection**: Extract creation date, modification date, size, and category
- **Reference Analysis**: Build reference graph showing document relationships
- **Duplicate Detection**: Identify exact and similar duplicates
- **Importance Evaluation**: Score documents based on references, recency, and other factors
- **Status Assignment**: Categorize documents as necessary, unnecessary, or needs review
- **Report Generation**: Create comprehensive markdown report with recommendations

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Command Line Interface](#command-line-interface)
  - [Programmatic Usage](#programmatic-usage)
  - [As a Kiro Skill](#as-a-kiro-skill)
- [Configuration Options](#configuration-options)
- [Output Report](#output-report)
- [Development](#development)
- [Troubleshooting](#troubleshooting)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Safety](#safety)
- [License](#license)

## Installation

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

### Local Installation

1. Clone or download this repository
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

4. Build the project:

```bash
npm run build
```

### Global Installation

To use the tool from anywhere on your system:

```bash
npm link
```

After linking, you can use the `document-organization-system` command globally.

### As a Dependency

To use this as a library in your project:

```bash
npm install /path/to/document-organization-system
```

Or if published to npm:

```bash
npm install document-organization-system
```

## Usage

### Command Line Interface

#### Basic Usage

```bash
# Analyze current directory with default settings
document-organization-system .

# Analyze specific workspace
document-organization-system /path/to/workspace

# Show help
document-organization-system --help
```

#### Advanced Options

```bash
# Use custom configuration file
document-organization-system . --config-path ./my-config.json

# Override specific paths to scan
document-organization-system . --include-paths ".kiro,.agent,docs,backlog"

# Exclude additional paths
document-organization-system . --exclude-paths "node_modules,.git,dist,temp"

# Specify file extensions to analyze
document-organization-system . --file-extensions ".md,.txt,.rst"

# Custom output path for report
document-organization-system . --output-path "reports/organization-report.md"

# Enable verbose output for debugging
document-organization-system . --verbose

# Combine multiple options
document-organization-system /path/to/workspace \
  --config-path ./config.json \
  --include-paths ".kiro,docs" \
  --output-path "my-report.md" \
  --verbose
```

#### Command Line Options

| Option | Short | Description | Example |
|--------|-------|-------------|---------|
| `--workspace-path` | `-w` | Path to workspace to analyze (required) | `-w /path/to/workspace` |
| `--config-path` | `-c` | Path to custom configuration file | `-c ./config.json` |
| `--include-paths` | `-i` | Comma-separated list of paths to include | `-i ".kiro,.agent,docs"` |
| `--exclude-paths` | `-e` | Comma-separated list of paths to exclude | `-e "node_modules,.git"` |
| `--file-extensions` | `-f` | Comma-separated list of file extensions | `-f ".md,.txt"` |
| `--output-path` | `-o` | Path for output report | `-o "report.md"` |
| `--verbose` | `-v` | Enable verbose output | `-v` |
| `--help` | `-h` | Show help message | `-h` |

#### Using Built Binary (After Build)

If you haven't linked the package globally, you can use the built CLI directly:

```bash
node dist/cli.js .
```

### Programmatic Usage

#### Basic Example

```typescript
import { runDocumentOrganization, ConfigManager } from 'document-organization-system';

// Use default configuration
const result = await runDocumentOrganization('/path/to/workspace');

if (result.success) {
  console.log(`Report generated: ${result.reportPath}`);
  console.log(`Total documents: ${result.report.summary.totalDocuments}`);
  console.log(`Necessary: ${result.report.summary.necessaryCount}`);
  console.log(`Unnecessary: ${result.report.summary.unnecessaryCount}`);
} else {
  console.error(`Error: ${result.errorMessage}`);
}
```

#### With Custom Configuration

```typescript
import { runDocumentOrganization, ConfigManager } from 'document-organization-system';

// Load custom configuration
const config = ConfigManager.load('./my-config.json');

// Or create configuration programmatically
const customConfig = {
  scanner: {
    includePaths: ['.kiro', '.agent', 'docs'],
    excludePaths: ['node_modules', '.git', 'dist'],
    fileExtensions: ['.md', '.txt']
  },
  evaluator: {
    weights: {
      referenceCount: 0.5,
      recency: 0.3,
      size: 0.1,
      category: 0.1
    },
    thresholds: {
      necessary: 70,
      unnecessary: 25
    }
  },
  output: {
    outputPath: 'custom-report.md',
    includeMetadata: true,
    includeReasoningDetails: true
  }
};

const result = await runDocumentOrganization('/path/to/workspace', customConfig);
```

#### With Progress Callback

```typescript
import { runDocumentOrganization } from 'document-organization-system';

const progressCallback = (message: string, current: number, total: number) => {
  const percentage = Math.round((current / total) * 100);
  console.log(`[${percentage}%] ${message}`);
};

const result = await runDocumentOrganization(
  '/path/to/workspace',
  undefined, // Use default config
  progressCallback
);
```

### As a Kiro Skill

This system is designed to be used as a Kiro Skill. See `SKILL.md` for detailed information about Kiro integration.

#### JSON Input (for Kiro Integration)

The skill can accept parameters as JSON via stdin:

```bash
echo '{"workspacePath": ".", "includePaths": [".kiro", "docs"]}' | document-organization-system
```

Example JSON parameters:

```json
{
  "workspacePath": "/path/to/workspace",
  "configPath": "./config.json",
  "includePaths": [".kiro", ".agent", "docs"],
  "excludePaths": ["node_modules", ".git"],
  "fileExtensions": [".md", ".txt"],
  "outputPath": "organization-report.md",
  "verbose": true
}
```

## Configuration Options

The system can be configured through a JSON configuration file. Create a `config.json` file with the following structure:

### Complete Configuration Example

```json
{
  "scanner": {
    "includePaths": [
      ".agent",
      ".kiro",
      "backlog",
      "docs"
    ],
    "excludePaths": [
      "node_modules",
      ".git",
      "dist",
      "build",
      ".vercel",
      ".npm-cache"
    ],
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

### Configuration Sections

#### Scanner Configuration

Controls which files are scanned and analyzed.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `includePaths` | `string[]` | `[".agent", ".kiro", "backlog", "docs"]` | Directories to scan for documents |
| `excludePaths` | `string[]` | `["node_modules", ".git", "dist", "build", ".vercel", ".npm-cache"]` | Directories to exclude from scanning |
| `fileExtensions` | `string[]` | `[".md", ".txt"]` | File extensions to include in analysis |

#### Evaluator Configuration

Controls how document importance is calculated.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `weights.referenceCount` | `number` | `0.4` | Weight for number of incoming references (0-1) |
| `weights.recency` | `number` | `0.3` | Weight for last modification date (0-1) |
| `weights.size` | `number` | `0.1` | Weight for file size (0-1) |
| `weights.category` | `number` | `0.2` | Weight for document category (0-1) |
| `thresholds.necessary` | `number` | `60` | Score threshold for "必要" (necessary) status (0-100) |
| `thresholds.unnecessary` | `number` | `30` | Score threshold for "不要" (unnecessary) status (0-100) |

**Note**: Weights should sum to 1.0 for balanced scoring. Documents with scores between the two thresholds are marked as "要確認" (needs review).

#### Output Configuration

Controls report generation.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `outputPath` | `string` | `"DOCUMENT_ORGANIZATION_REPORT.md"` | Path where the report will be saved |
| `includeMetadata` | `boolean` | `true` | Include detailed metadata in report |
| `includeReasoningDetails` | `boolean` | `true` | Include reasoning for importance scores |

### Configuration Priority

When multiple configuration sources are provided, they are merged in the following priority order (highest to lowest):

1. **Command-line arguments** (e.g., `--include-paths`)
2. **Custom configuration file** (specified with `--config-path`)
3. **Default configuration** (from `config/config.json`)

## Output Report

The system generates a comprehensive markdown report with the following sections:

### Report Structure

1. **Summary Statistics**
   - Total documents analyzed
   - Count by status (necessary, unnecessary, needs review)
   - Number of duplicates found
   - Total size of analyzed documents

2. **Documents by Status**
   - **必要 (Necessary)**: Documents that should be kept
   - **要確認 (Needs Review)**: Documents that require manual review
   - **不要 (Unnecessary)**: Documents that can be archived or deleted

3. **Document Details**
   For each document, the report includes:
   - File path
   - Importance score (0-100)
   - Status
   - Metadata (size, last modified, category)
   - Number of incoming/outgoing references
   - Reasoning for the assigned score
   - Duplicate information (if applicable)

4. **Deletion Recommendations**
   - List of documents marked as unnecessary
   - Reasons for each recommendation
   - Suggested commands for archival or deletion

5. **Error Summary** (if applicable)
   - Files that couldn't be read
   - Directories that couldn't be accessed
   - Other errors encountered during analysis

### Example Report Output

```markdown
# Document Organization Report

Generated: 2024-01-15 10:30:00

## Summary

- Total Documents: 45
- Necessary: 28
- Needs Review: 10
- Unnecessary: 7
- Duplicates Found: 3
- Total Size: 2.4 MB

## 必要 (Necessary) - 28 documents

### .kiro/specs/feature/design.md
- **Score**: 85/100
- **Status**: 必要
- **Size**: 15.2 KB
- **Last Modified**: 2024-01-10
- **Category**: spec
- **References**: 5 incoming, 3 outgoing
- **Reasoning**: High importance due to multiple references and recent updates

...
```

## Development

### Setup Development Environment

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format
```

### Project Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Compile TypeScript to JavaScript |
| `npm test` | Run all tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Generate test coverage report |
| `npm run lint` | Check code for linting errors |
| `npm run format` | Format code with Prettier |

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (auto-rerun on changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npx vitest run tests/scanner.test.ts
```

## Troubleshooting

### Common Issues and Solutions

#### Issue: "Workspace path is required" error

**Cause**: No workspace path was provided to the CLI.

**Solution**: Provide a workspace path as an argument:
```bash
document-organization-system /path/to/workspace
# or
document-organization-system . # for current directory
```

#### Issue: "Workspace path does not exist" error

**Cause**: The provided path doesn't exist on the filesystem.

**Solution**: 
- Check that the path is correct
- Use absolute paths if relative paths aren't working
- Ensure you have read permissions for the directory

```bash
# Use absolute path
document-organization-system /home/user/projects/my-workspace

# Or navigate to the directory first
cd /path/to/workspace
document-organization-system .
```

#### Issue: No documents found in scan

**Cause**: The default include paths don't match your workspace structure, or all directories are being excluded.

**Solution**: Customize the include paths:
```bash
# Specify which directories to scan
document-organization-system . --include-paths "docs,documentation,notes"

# Check what's being scanned with verbose mode
document-organization-system . --verbose
```

#### Issue: Too many/too few documents marked as unnecessary

**Cause**: The importance thresholds may not match your needs.

**Solution**: Adjust the thresholds in your configuration:
```json
{
  "evaluator": {
    "thresholds": {
      "necessary": 70,    // Increase to be more strict
      "unnecessary": 20   // Decrease to be more strict
    }
  }
}
```

#### Issue: Important documents marked as unnecessary

**Cause**: The document has no references and hasn't been modified recently.

**Solution**: 
1. Review the "要確認" (needs review) section first
2. Adjust the evaluator weights to prioritize different factors:
```json
{
  "evaluator": {
    "weights": {
      "referenceCount": 0.3,  // Reduce reference weight
      "recency": 0.4,         // Increase recency weight
      "size": 0.1,
      "category": 0.2
    }
  }
}
```

#### Issue: "Failed to load config" warning

**Cause**: The configuration file has invalid JSON or doesn't exist.

**Solution**:
- Validate your JSON using a JSON validator
- Check that the file path is correct
- Ensure the file has proper read permissions
- Use the default config by omitting `--config-path`

```bash
# Validate JSON
cat config.json | python -m json.tool

# Use default config
document-organization-system . # without --config-path
```

#### Issue: Permission denied errors during scan

**Cause**: The tool doesn't have permission to read certain files or directories.

**Solution**:
- Run with appropriate permissions
- Add problematic directories to `excludePaths`
- Check file/directory permissions

```bash
# Add to exclude paths
document-organization-system . --exclude-paths "node_modules,.git,restricted-folder"
```

#### Issue: Out of memory errors on large workspaces

**Cause**: Too many files being processed at once.

**Solution**:
- Increase Node.js memory limit
- Scan smaller portions of the workspace
- Exclude large directories

```bash
# Increase memory limit
NODE_OPTIONS="--max-old-space-size=4096" document-organization-system .

# Scan specific directories only
document-organization-system . --include-paths ".kiro,docs"
```

#### Issue: Report not generated or empty

**Cause**: Output path is not writable or scan found no documents.

**Solution**:
- Check write permissions for the output directory
- Verify documents exist in include paths
- Use verbose mode to see what's happening

```bash
# Use verbose mode for debugging
document-organization-system . --verbose

# Specify writable output path
document-organization-system . --output-path "./reports/output.md"
```

#### Issue: Duplicate detection not working as expected

**Cause**: Files have different content despite appearing similar.

**Solution**:
- The system uses content hashing for exact duplicates
- Similar files (by size/line count) are marked as "potential duplicates"
- Review the similarity threshold in the evaluator logic
- Check the report's duplicate section for details

#### Issue: Build errors

**Cause**: TypeScript compilation errors or missing dependencies.

**Solution**:
```bash
# Clean and reinstall dependencies
rm -rf node_modules dist
npm install

# Check TypeScript version
npx tsc --version

# Build with verbose output
npm run build -- --verbose
```

#### Issue: Test failures

**Cause**: Environment differences or outdated dependencies.

**Solution**:
```bash
# Update dependencies
npm update

# Clear test cache
npx vitest run --clearCache

# Run tests with verbose output
npm test -- --reporter=verbose
```

### Getting Help

If you encounter issues not covered here:

1. **Check the verbose output**: Run with `--verbose` flag to see detailed execution logs
2. **Review the error report**: Check the error section in the generated report
3. **Examine the configuration**: Ensure your config.json is valid and appropriate
4. **Check file permissions**: Ensure the tool has read access to workspace and write access to output location
5. **Review the logs**: Look for error messages in the console output

### Debug Mode

For detailed debugging information:

```bash
# Enable verbose output
document-organization-system . --verbose

# Check Node.js version
node --version  # Should be 18.x or higher

# Verify installation
npm list document-organization-system

# Test with minimal configuration
document-organization-system . --include-paths "." --file-extensions ".md"
```

## Project Structure

```
document-organization-system/
├── src/
│   ├── types.ts              # Core type definitions and interfaces
│   ├── scanner.ts            # Document scanner implementation
│   ├── metadata.ts           # Metadata collector
│   ├── analyzer.ts           # Reference analyzer
│   ├── evaluator.ts          # Importance evaluator and status assigner
│   ├── reporter.ts           # Report generator
│   ├── config.ts             # Configuration manager
│   ├── index.ts              # Main orchestrator
│   └── cli.ts                # Command-line interface
├── tests/
│   ├── scanner.test.ts       # Scanner unit and property tests
│   ├── metadata.test.ts      # Metadata collector tests
│   ├── analyzer.test.ts      # Reference analyzer tests
│   ├── evaluator.test.ts     # Evaluator tests
│   └── reporter.test.ts      # Reporter tests
├── config/
│   └── config.json           # Default configuration
├── dist/                     # Compiled JavaScript (generated)
├── SKILL.md                  # Kiro Skill definition
├── workflow.md               # Workflow definition
├── README.md                 # This file
├── package.json              # Project metadata and dependencies
├── tsconfig.json             # TypeScript configuration
└── vitest.config.ts          # Test configuration
```

## Testing

This project uses a comprehensive dual testing approach to ensure correctness:

### Testing Approach

- **Unit Tests**: Verify specific examples, edge cases, and error conditions
- **Property-Based Tests**: Verify universal properties across all inputs using fast-check

All tests are written using Vitest as the test runner.

### Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (auto-rerun on changes)
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run specific test file
npx vitest run tests/scanner.test.ts

# Run tests matching a pattern
npx vitest run -t "Scanner"
```

### Test Coverage

The project aims for:
- **Line Coverage**: Minimum 80%
- **Branch Coverage**: Minimum 75%
- **Property Tests**: One test per correctness property (21 properties defined)
- **Unit Tests**: Coverage of all edge cases and error conditions

### Writing Tests

When contributing, ensure:
1. New features include both unit and property tests
2. Edge cases are covered with unit tests
3. Universal properties are verified with property-based tests
4. Tests are descriptive and well-documented

## Safety

⚠️ **IMPORTANT SAFETY NOTICE** ⚠️

This system **NEVER** deletes files automatically. It only provides recommendations and analysis.

### What the System Does

- ✅ Scans and analyzes documents
- ✅ Generates reports with recommendations
- ✅ Identifies duplicates and unnecessary files
- ✅ Provides suggested commands for cleanup

### What the System Does NOT Do

- ❌ Delete files automatically
- ❌ Move files without user action
- ❌ Modify file contents
- ❌ Change file permissions

### User Responsibility

Users must:
1. **Review the report carefully** before taking any action
2. **Manually execute** any deletion or archival commands
3. **Create backups** before deleting files
4. **Verify recommendations** match their needs

### Recommended Workflow

1. Run the analysis and generate the report
2. Review the report thoroughly
3. Create a backup or archive directory:
   ```bash
   mkdir -p archive/$(date +%Y%m%d)
   ```
4. Move unnecessary files to archive (don't delete immediately):
   ```bash
   mv path/to/unnecessary/file.md archive/$(date +%Y%m%d)/
   ```
5. Test your workspace to ensure nothing is broken
6. Only after verification, permanently delete archived files if desired

## License

MIT

---

## Additional Resources

- **SKILL.md**: Detailed Kiro Skill integration documentation
- **workflow.md**: Workflow definition for automated execution
- **design.md**: System architecture and design decisions
- **requirements.md**: Complete requirements specification

## Contributing

Contributions are welcome! Please ensure:
- All tests pass (`npm test`)
- Code is properly formatted (`npm run format`)
- No linting errors (`npm run lint`)
- New features include tests and documentation

## Version History

- **1.0.0**: Initial release with core functionality
  - Document scanning and metadata collection
  - Reference analysis and duplicate detection
  - Importance evaluation and status assignment
  - Report generation
  - CLI and programmatic interfaces
  - Kiro Skill integration
