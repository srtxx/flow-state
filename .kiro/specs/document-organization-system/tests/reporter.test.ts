/**
 * Unit tests for ReportGenerator
 * 
 * Tests specific examples and edge cases for report generation
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { ReportGenerator } from '../src/reporter.js';
import {
  DocumentWithStatus,
  DocumentStatus,
  DocumentCategory,
  ErrorInfo,
  OutputConfig,
} from '../src/types.js';

describe('ReportGenerator', () => {
  let generator: ReportGenerator;
  let tempDir: string;

  beforeEach(async () => {
    generator = new ReportGenerator();
    // Create a temporary directory for test files
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'reporter-test-'));
  });

  afterEach(async () => {
    // Clean up temporary directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('generate', () => {
    it('should generate a report with correct summary statistics', () => {
      const documents: DocumentWithStatus[] = [
        createTestDocument('doc1.md', DocumentStatus.NECESSARY, 80),
        createTestDocument('doc2.md', DocumentStatus.UNNECESSARY, 20),
        createTestDocument('doc3.md', DocumentStatus.NEEDS_REVIEW, 50),
        createTestDocument('doc4.md', DocumentStatus.NECESSARY, 90),
      ];

      const report = generator.generate(documents, [], tempDir);

      expect(report.summary.totalDocuments).toBe(4);
      expect(report.summary.necessaryCount).toBe(2);
      expect(report.summary.unnecessaryCount).toBe(1);
      expect(report.summary.needsReviewCount).toBe(1);
      expect(report.workspacePath).toBe(tempDir);
      expect(report.generatedAt).toBeInstanceOf(Date);
    });

    it('should group documents by status correctly', () => {
      const documents: DocumentWithStatus[] = [
        createTestDocument('doc1.md', DocumentStatus.NECESSARY, 80),
        createTestDocument('doc2.md', DocumentStatus.UNNECESSARY, 20),
        createTestDocument('doc3.md', DocumentStatus.NEEDS_REVIEW, 50),
      ];

      const report = generator.generate(documents, [], tempDir);

      expect(report.documentsByStatus.get(DocumentStatus.NECESSARY)).toHaveLength(1);
      expect(report.documentsByStatus.get(DocumentStatus.UNNECESSARY)).toHaveLength(1);
      expect(report.documentsByStatus.get(DocumentStatus.NEEDS_REVIEW)).toHaveLength(1);
    });

    it('should handle empty document list', () => {
      const report = generator.generate([], [], tempDir);

      expect(report.summary.totalDocuments).toBe(0);
      expect(report.summary.necessaryCount).toBe(0);
      expect(report.summary.unnecessaryCount).toBe(0);
      expect(report.summary.needsReviewCount).toBe(0);
      expect(report.summary.duplicatesFound).toBe(0);
      expect(report.summary.totalSizeBytes).toBe(0);
    });

    it('should calculate total size correctly', () => {
      const documents: DocumentWithStatus[] = [
        createTestDocument('doc1.md', DocumentStatus.NECESSARY, 80, 1000),
        createTestDocument('doc2.md', DocumentStatus.UNNECESSARY, 20, 2000),
        createTestDocument('doc3.md', DocumentStatus.NEEDS_REVIEW, 50, 3000),
      ];

      const report = generator.generate(documents, [], tempDir);

      expect(report.summary.totalSizeBytes).toBe(6000);
    });

    it('should count duplicates correctly', () => {
      const documents: DocumentWithStatus[] = [
        createTestDocument('doc1.md', DocumentStatus.NECESSARY, 80),
        createTestDocument('doc2.md', DocumentStatus.UNNECESSARY, 20, 1000, 'This is a duplicate'),
        createTestDocument('doc3.md', DocumentStatus.UNNECESSARY, 20, 1000, 'duplicate of doc1.md'),
      ];

      const report = generator.generate(documents, [], tempDir);

      expect(report.summary.duplicatesFound).toBe(2);
    });

    it('should include errors in the report', () => {
      const errors: ErrorInfo[] = [
        {
          path: 'error1.md',
          error: 'File not found',
          timestamp: new Date(),
          severity: 'error',
        },
        {
          path: 'error2.md',
          error: 'Permission denied',
          timestamp: new Date(),
          severity: 'warning',
        },
      ];

      const report = generator.generate([], errors, tempDir);

      expect(report.errors).toHaveLength(2);
      expect(report.errors[0].path).toBe('error1.md');
      expect(report.errors[1].path).toBe('error2.md');
    });
  });

  describe('toMarkdown', () => {
    const defaultConfig: OutputConfig = {
      outputPath: 'report.md',
      includeMetadata: true,
      includeReasoningDetails: true,
    };

    it('should generate valid markdown with all sections', () => {
      const documents: DocumentWithStatus[] = [
        createTestDocument('doc1.md', DocumentStatus.NECESSARY, 80),
        createTestDocument('doc2.md', DocumentStatus.UNNECESSARY, 20),
      ];

      const report = generator.generate(documents, [], tempDir);
      const markdown = generator.toMarkdown(report, defaultConfig);

      expect(markdown).toContain('# Document Organization Report');
      expect(markdown).toContain('## Summary');
      expect(markdown).toContain('## 必要 Documents');
      expect(markdown).toContain('## 不要 Documents');
      expect(markdown).toContain('## Deletion Recommendations');
    });

    it('should include summary statistics in markdown', () => {
      const documents: DocumentWithStatus[] = [
        createTestDocument('doc1.md', DocumentStatus.NECESSARY, 80),
        createTestDocument('doc2.md', DocumentStatus.UNNECESSARY, 20),
        createTestDocument('doc3.md', DocumentStatus.NEEDS_REVIEW, 50),
      ];

      const report = generator.generate(documents, [], tempDir);
      const markdown = generator.toMarkdown(report, defaultConfig);

      expect(markdown).toContain('**Total Documents**: 3');
      expect(markdown).toContain('**Necessary (必要)**: 1');
      expect(markdown).toContain('**Needs Review (要確認)**: 1');
      expect(markdown).toContain('**Unnecessary (不要)**: 1');
    });

    it('should include metadata when config.includeMetadata is true', () => {
      const documents: DocumentWithStatus[] = [
        createTestDocument('doc1.md', DocumentStatus.NECESSARY, 80),
      ];

      const report = generator.generate(documents, [], tempDir);
      const markdown = generator.toMarkdown(report, defaultConfig);

      expect(markdown).toContain('**Metadata**:');
      expect(markdown).toContain('Category:');
      expect(markdown).toContain('Size:');
      expect(markdown).toContain('Lines:');
      expect(markdown).toContain('Modified:');
      expect(markdown).toContain('Created:');
    });

    it('should exclude metadata when config.includeMetadata is false', () => {
      const documents: DocumentWithStatus[] = [
        createTestDocument('doc1.md', DocumentStatus.NECESSARY, 80),
      ];

      const config: OutputConfig = {
        ...defaultConfig,
        includeMetadata: false,
      };

      const report = generator.generate(documents, [], tempDir);
      const markdown = generator.toMarkdown(report, config);

      expect(markdown).not.toContain('**Metadata**:');
    });
  });

  describe('writeToFile', () => {
    const defaultConfig: OutputConfig = {
      outputPath: 'test-report.md',
      includeMetadata: true,
      includeReasoningDetails: true,
    };

    it('should write report to file successfully', async () => {
      const documents: DocumentWithStatus[] = [
        createTestDocument('doc1.md', DocumentStatus.NECESSARY, 80),
      ];

      const report = generator.generate(documents, [], tempDir);
      await generator.writeToFile(report, defaultConfig, tempDir);

      const outputPath = path.join(tempDir, defaultConfig.outputPath);
      const fileExists = await fs.access(outputPath).then(() => true).catch(() => false);
      expect(fileExists).toBe(true);

      const content = await fs.readFile(outputPath, 'utf-8');
      expect(content).toContain('# Document Organization Report');
    });

    it('should create directories and write file successfully', async () => {
      const documents: DocumentWithStatus[] = [
        createTestDocument('doc1.md', DocumentStatus.NECESSARY, 80),
      ];

      const report = generator.generate(documents, [], tempDir);
      const nestedConfig: OutputConfig = {
        ...defaultConfig,
        outputPath: 'nested/path/report.md',
      };

      // Should create nested directories and write successfully
      await generator.writeToFile(report, nestedConfig, tempDir);
      
      const outputPath = path.join(tempDir, 'nested/path/report.md');
      const fileExists = await fs.access(outputPath).then(() => true).catch(() => false);
      expect(fileExists).toBe(true);
    });
  });
});

/**
 * Helper function to create a test document
 */
function createTestDocument(
  path: string,
  status: DocumentStatus,
  score: number,
  sizeBytes: number = 1000,
  recommendation?: string
): DocumentWithStatus {
  return {
    metadata: {
      path,
      createdAt: new Date('2024-01-01'),
      modifiedAt: new Date('2024-01-15'),
      sizeBytes,
      lineCount: 50,
      category: DocumentCategory.OTHER,
    },
    importance: {
      path,
      score,
      factors: [
        {
          name: 'reference_count',
          weight: 0.4,
          value: score / 100,
          contribution: (score / 100) * 0.4,
        },
        {
          name: 'recency',
          weight: 0.3,
          value: score / 100,
          contribution: (score / 100) * 0.3,
        },
        {
          name: 'category',
          weight: 0.2,
          value: score / 100,
          contribution: (score / 100) * 0.2,
        },
        {
          name: 'size',
          weight: 0.1,
          value: score / 100,
          contribution: (score / 100) * 0.1,
        },
      ],
      reasoning: `Document has importance score of ${score} based on various factors.`,
    },
    status,
    recommendation: recommendation || `This document is ${status}.`,
  };
}
