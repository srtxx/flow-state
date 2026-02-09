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

## Installation

```bash
npm install
```

## Usage

### As a Kiro Skill

This system is designed to be used as a Kiro Skill. See `SKILL.md` for details.

### Development

```bash
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

## Configuration

The system can be configured through a `config.json` file. See `config/config.json` for the default configuration.

### Configuration Options

- **scanner.includePaths**: Directories to scan (default: `.agent`, `.kiro`, `backlog`, `docs`)
- **scanner.excludePaths**: Directories to exclude (default: `node_modules`, `.git`, `dist`, etc.)
- **scanner.fileExtensions**: File extensions to include (default: `.md`, `.txt`)
- **evaluator.weights**: Weights for importance factors
- **evaluator.thresholds**: Score thresholds for status assignment
- **output.outputPath**: Where to save the report (default: `DOCUMENT_ORGANIZATION_REPORT.md`)

## Project Structure

```
document-organization-system/
├── src/
│   ├── types.ts              # Core type definitions
│   ├── scanner.ts            # Document scanner
│   ├── metadata.ts           # Metadata collector
│   ├── analyzer.ts           # Reference analyzer
│   ├── evaluator.ts          # Importance evaluator
│   ├── reporter.ts           # Report generator
│   └── config.ts             # Configuration manager
├── tests/
│   ├── scanner.test.ts
│   ├── metadata.test.ts
│   ├── analyzer.test.ts
│   ├── evaluator.test.ts
│   └── reporter.test.ts
├── config/
│   └── config.json           # Default configuration
├── SKILL.md                  # Kiro Skill definition
├── workflow.md               # Workflow definition
└── package.json
```

## Testing

This project uses a dual testing approach:

- **Unit Tests**: Verify specific examples and edge cases
- **Property-Based Tests**: Verify universal properties across all inputs using fast-check

All tests are written using Vitest.

## Safety

This system **NEVER** deletes files automatically. It only provides recommendations. Users must manually review and execute any deletion or archival actions.

## License

MIT
