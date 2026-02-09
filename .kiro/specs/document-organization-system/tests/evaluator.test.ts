/**
 * Tests for Evaluator Module (DuplicateChecker)
 * 
 * Tests duplicate detection functionality including:
 * - Content hash calculation
 * - Exact duplicate detection
 * - Similarity calculation
 * - Similar document detection
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { DuplicateChecker, ImportanceEvaluator, StatusAssigner } from '../src/evaluator.js';
import { DocumentMetadata, DocumentCategory, DocumentNode, DuplicateInfo, ImportanceScore, DocumentStatus } from '../src/types.js';

describe('DuplicateChecker', () => {
  let tempDir: string;
  let checker: DuplicateChecker;

  beforeEach(async () => {
    // Create a temporary directory for test files
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'duplicate-checker-test-'));
    checker = new DuplicateChecker();
  });

  afterEach(async () => {
    // Clean up temporary directory
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  describe('Exact Duplicate Detection', () => {
    it('should detect exact duplicates with identical content', async () => {
      // Create two files with identical content
      const content = 'This is test content\nWith multiple lines\n';
      const file1 = path.join(tempDir, 'file1.md');
      const file2 = path.join(tempDir, 'file2.md');
      
      await fs.writeFile(file1, content);
      await fs.writeFile(file2, content);
      
      const docs: DocumentMetadata[] = [
        {
          path: file1,
          createdAt: new Date(),
          modifiedAt: new Date(),
          sizeBytes: content.length,
          lineCount: 3,
          category: DocumentCategory.OTHER,
        },
        {
          path: file2,
          createdAt: new Date(),
          modifiedAt: new Date(),
          sizeBytes: content.length,
          lineCount: 3,
          category: DocumentCategory.OTHER,
        },
      ];
      
      const result = await checker.checkDuplicates(docs);
      
      // First file should not be marked as duplicate
      const info1 = result.get(file1);
      expect(info1).toBeDefined();
      expect(info1?.duplicateOf).toBeNull();
      expect(info1?.contentHash).toBeTruthy();
      
      // Second file should be marked as duplicate of first
      const info2 = result.get(file2);
      expect(info2).toBeDefined();
      expect(info2?.duplicateOf).toBe(file1);
      expect(info2?.similarity).toBe(1.0);
      expect(info2?.contentHash).toBe(info1?.contentHash);
    });

    it('should not mark different files as duplicates', async () => {
      const content1 = 'This is file 1\n';
      const content2 = 'This is file 2\n';
      const file1 = path.join(tempDir, 'file1.md');
      const file2 = path.join(tempDir, 'file2.md');
      
      await fs.writeFile(file1, content1);
      await fs.writeFile(file2, content2);
      
      const docs: DocumentMetadata[] = [
        {
          path: file1,
          createdAt: new Date(),
          modifiedAt: new Date(),
          sizeBytes: content1.length,
          lineCount: 2,
          category: DocumentCategory.OTHER,
        },
        {
          path: file2,
          createdAt: new Date(),
          modifiedAt: new Date(),
          sizeBytes: content2.length,
          lineCount: 2,
          category: DocumentCategory.OTHER,
        },
      ];
      
      const result = await checker.checkDuplicates(docs);
      
      const info1 = result.get(file1);
      const info2 = result.get(file2);
      
      expect(info1?.duplicateOf).toBeNull();
      expect(info2?.duplicateOf).toBeNull();
      expect(info1?.contentHash).not.toBe(info2?.contentHash);
    });

    it('should handle empty files correctly', async () => {
      const file1 = path.join(tempDir, 'empty1.md');
      const file2 = path.join(tempDir, 'empty2.md');
      
      await fs.writeFile(file1, '');
      await fs.writeFile(file2, '');
      
      const docs: DocumentMetadata[] = [
        {
          path: file1,
          createdAt: new Date(),
          modifiedAt: new Date(),
          sizeBytes: 0,
          lineCount: 0,
          category: DocumentCategory.OTHER,
        },
        {
          path: file2,
          createdAt: new Date(),
          modifiedAt: new Date(),
          sizeBytes: 0,
          lineCount: 0,
          category: DocumentCategory.OTHER,
        },
      ];
      
      const result = await checker.checkDuplicates(docs);
      
      // Empty files should be detected as duplicates
      const info1 = result.get(file1);
      const info2 = result.get(file2);
      
      expect(info1?.duplicateOf).toBeNull();
      expect(info2?.duplicateOf).toBe(file1);
      expect(info1?.contentHash).toBe(info2?.contentHash);
    });
  });

  describe('Similarity Detection', () => {
    it('should detect similar documents based on size and line count', async () => {
      // Create files with similar but not identical content
      const content1 = 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5\n';
      const content2 = 'Line A\nLine B\nLine C\nLine D\nLine E\n';
      const file1 = path.join(tempDir, 'similar1.md');
      const file2 = path.join(tempDir, 'similar2.md');
      
      await fs.writeFile(file1, content1);
      await fs.writeFile(file2, content2);
      
      const docs: DocumentMetadata[] = [
        {
          path: file1,
          createdAt: new Date(),
          modifiedAt: new Date(),
          sizeBytes: content1.length,
          lineCount: 6,
          category: DocumentCategory.OTHER,
        },
        {
          path: file2,
          createdAt: new Date(),
          modifiedAt: new Date(),
          sizeBytes: content2.length,
          lineCount: 6,
          category: DocumentCategory.OTHER,
        },
      ];
      
      const result = await checker.checkDuplicates(docs);
      
      const info1 = result.get(file1);
      const info2 = result.get(file2);
      
      // Should not be exact duplicates
      expect(info1?.duplicateOf).toBeNull();
      expect(info2?.duplicateOf).toBeNull();
      
      // Should be marked as similar (high similarity score)
      expect(info1?.similarTo).toContain(file2);
      expect(info2?.similarTo).toContain(file1);
      expect(info1?.similarity).toBeGreaterThan(0.8);
      expect(info2?.similarity).toBeGreaterThan(0.8);
    });

    it('should not mark very different documents as similar', async () => {
      const content1 = 'Short\n';
      const content2 = 'This is a much longer document\nWith many more lines\nAnd much more content\nTo make it different\n';
      const file1 = path.join(tempDir, 'short.md');
      const file2 = path.join(tempDir, 'long.md');
      
      await fs.writeFile(file1, content1);
      await fs.writeFile(file2, content2);
      
      const docs: DocumentMetadata[] = [
        {
          path: file1,
          createdAt: new Date(),
          modifiedAt: new Date(),
          sizeBytes: content1.length,
          lineCount: 2,
          category: DocumentCategory.OTHER,
        },
        {
          path: file2,
          createdAt: new Date(),
          modifiedAt: new Date(),
          sizeBytes: content2.length,
          lineCount: 5,
          category: DocumentCategory.OTHER,
        },
      ];
      
      const result = await checker.checkDuplicates(docs);
      
      const info1 = result.get(file1);
      const info2 = result.get(file2);
      
      expect(info1?.similarTo).not.toContain(file2);
      expect(info2?.similarTo).not.toContain(file1);
      expect(info1?.similarity).toBeLessThan(0.8);
    });

    it('should calculate similarity correctly for edge cases', async () => {
      // Test with zero-size files
      const file1 = path.join(tempDir, 'zero1.md');
      const file2 = path.join(tempDir, 'zero2.md');
      
      await fs.writeFile(file1, '');
      await fs.writeFile(file2, '');
      
      const docs: DocumentMetadata[] = [
        {
          path: file1,
          createdAt: new Date(),
          modifiedAt: new Date(),
          sizeBytes: 0,
          lineCount: 0,
          category: DocumentCategory.OTHER,
        },
        {
          path: file2,
          createdAt: new Date(),
          modifiedAt: new Date(),
          sizeBytes: 0,
          lineCount: 0,
          category: DocumentCategory.OTHER,
        },
      ];
      
      const result = await checker.checkDuplicates(docs);
      
      // Zero-size files should be exact duplicates, not just similar
      const info2 = result.get(file2);
      expect(info2?.duplicateOf).toBe(file1);
    });
  });

  describe('Multiple Duplicates', () => {
    it('should handle multiple duplicates of the same file', async () => {
      const content = 'Duplicate content\n';
      const file1 = path.join(tempDir, 'original.md');
      const file2 = path.join(tempDir, 'copy1.md');
      const file3 = path.join(tempDir, 'copy2.md');
      
      await fs.writeFile(file1, content);
      await fs.writeFile(file2, content);
      await fs.writeFile(file3, content);
      
      const docs: DocumentMetadata[] = [
        {
          path: file1,
          createdAt: new Date(),
          modifiedAt: new Date(),
          sizeBytes: content.length,
          lineCount: 2,
          category: DocumentCategory.OTHER,
        },
        {
          path: file2,
          createdAt: new Date(),
          modifiedAt: new Date(),
          sizeBytes: content.length,
          lineCount: 2,
          category: DocumentCategory.OTHER,
        },
        {
          path: file3,
          createdAt: new Date(),
          modifiedAt: new Date(),
          sizeBytes: content.length,
          lineCount: 2,
          category: DocumentCategory.OTHER,
        },
      ];
      
      const result = await checker.checkDuplicates(docs);
      
      const info1 = result.get(file1);
      const info2 = result.get(file2);
      const info3 = result.get(file3);
      
      // First file should be the original
      expect(info1?.duplicateOf).toBeNull();
      
      // Both copies should point to the first file
      expect(info2?.duplicateOf).toBe(file1);
      expect(info3?.duplicateOf).toBe(file1);
      
      // All should have the same hash
      expect(info1?.contentHash).toBe(info2?.contentHash);
      expect(info2?.contentHash).toBe(info3?.contentHash);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing files gracefully', async () => {
      const nonExistentFile = path.join(tempDir, 'does-not-exist.md');
      
      const docs: DocumentMetadata[] = [
        {
          path: nonExistentFile,
          createdAt: new Date(),
          modifiedAt: new Date(),
          sizeBytes: 0,
          lineCount: 0,
          category: DocumentCategory.OTHER,
        },
      ];
      
      const result = await checker.checkDuplicates(docs);
      
      // Should create a default entry for the missing file
      const info = result.get(nonExistentFile);
      expect(info).toBeDefined();
      expect(info?.contentHash).toBe('');
      expect(info?.duplicateOf).toBeNull();
      expect(info?.similarTo).toEqual([]);
    });
  });
});

describe('ImportanceEvaluator', () => {
  let evaluator: ImportanceEvaluator;

  beforeEach(() => {
    // Use default weights
    evaluator = new ImportanceEvaluator();
  });

  describe('Reference Score Calculation', () => {
    it('should return 0 for documents with no references', () => {
      const metadata: DocumentMetadata = {
        path: 'test.md',
        createdAt: new Date(),
        modifiedAt: new Date(),
        sizeBytes: 100,
        lineCount: 10,
        category: DocumentCategory.OTHER,
      };

      const refNode: DocumentNode = {
        path: 'test.md',
        incomingRefs: 0,
        outgoingRefs: 0,
        referencedBy: [],
        references: [],
      };

      const duplicateInfo: DuplicateInfo = {
        path: 'test.md',
        duplicateOf: null,
        similarTo: [],
        contentHash: 'abc123',
        similarity: 0,
      };

      const result = evaluator.evaluate(metadata, refNode, duplicateInfo);
      
      // With 0 references, reference score should be 0
      const refFactor = result.factors.find(f => f.name === 'reference_count');
      expect(refFactor?.value).toBe(0);
    });

    it('should assign higher scores for documents with more references', () => {
      const metadata: DocumentMetadata = {
        path: 'test.md',
        createdAt: new Date(),
        modifiedAt: new Date(),
        sizeBytes: 100,
        lineCount: 10,
        category: DocumentCategory.OTHER,
      };

      const refNode1: DocumentNode = {
        path: 'test.md',
        incomingRefs: 1,
        outgoingRefs: 0,
        referencedBy: ['other.md'],
        references: [],
      };

      const refNode5: DocumentNode = {
        path: 'test.md',
        incomingRefs: 5,
        outgoingRefs: 0,
        referencedBy: ['a.md', 'b.md', 'c.md', 'd.md', 'e.md'],
        references: [],
      };

      const duplicateInfo: DuplicateInfo = {
        path: 'test.md',
        duplicateOf: null,
        similarTo: [],
        contentHash: 'abc123',
        similarity: 0,
      };

      const result1 = evaluator.evaluate(metadata, refNode1, duplicateInfo);
      const result5 = evaluator.evaluate(metadata, refNode5, duplicateInfo);

      expect(result5.score).toBeGreaterThan(result1.score);
    });
  });

  describe('Recency Score Calculation', () => {
    it('should assign high scores to recently modified documents', () => {
      const recentDate = new Date();
      const metadata: DocumentMetadata = {
        path: 'recent.md',
        createdAt: recentDate,
        modifiedAt: recentDate,
        sizeBytes: 100,
        lineCount: 10,
        category: DocumentCategory.OTHER,
      };

      const refNode: DocumentNode = {
        path: 'recent.md',
        incomingRefs: 0,
        outgoingRefs: 0,
        referencedBy: [],
        references: [],
      };

      const duplicateInfo: DuplicateInfo = {
        path: 'recent.md',
        duplicateOf: null,
        similarTo: [],
        contentHash: 'abc123',
        similarity: 0,
      };

      const result = evaluator.evaluate(metadata, refNode, duplicateInfo);
      
      const recencyFactor = result.factors.find(f => f.name === 'recency');
      expect(recencyFactor?.value).toBe(100); // Should be maximum for recent files
    });

    it('should assign low scores to old documents', () => {
      const oldDate = new Date();
      oldDate.setFullYear(oldDate.getFullYear() - 2); // 2 years ago

      const metadata: DocumentMetadata = {
        path: 'old.md',
        createdAt: oldDate,
        modifiedAt: oldDate,
        sizeBytes: 100,
        lineCount: 10,
        category: DocumentCategory.OTHER,
      };

      const refNode: DocumentNode = {
        path: 'old.md',
        incomingRefs: 0,
        outgoingRefs: 0,
        referencedBy: [],
        references: [],
      };

      const duplicateInfo: DuplicateInfo = {
        path: 'old.md',
        duplicateOf: null,
        similarTo: [],
        contentHash: 'abc123',
        similarity: 0,
      };

      const result = evaluator.evaluate(metadata, refNode, duplicateInfo);
      
      const recencyFactor = result.factors.find(f => f.name === 'recency');
      expect(recencyFactor?.value).toBe(0); // Should be minimum for very old files
    });
  });

  describe('Category Score Calculation', () => {
    it('should assign high scores to important categories like SPEC', () => {
      const metadata: DocumentMetadata = {
        path: 'spec.md',
        createdAt: new Date(),
        modifiedAt: new Date(),
        sizeBytes: 100,
        lineCount: 10,
        category: DocumentCategory.SPEC,
      };

      const refNode: DocumentNode = {
        path: 'spec.md',
        incomingRefs: 0,
        outgoingRefs: 0,
        referencedBy: [],
        references: [],
      };

      const duplicateInfo: DuplicateInfo = {
        path: 'spec.md',
        duplicateOf: null,
        similarTo: [],
        contentHash: 'abc123',
        similarity: 0,
      };

      const result = evaluator.evaluate(metadata, refNode, duplicateInfo);
      
      const categoryFactor = result.factors.find(f => f.name === 'category');
      expect(categoryFactor?.value).toBe(100); // SPEC should have highest category score
    });

    it('should assign lower scores to less important categories', () => {
      const metadata: DocumentMetadata = {
        path: 'other.md',
        createdAt: new Date(),
        modifiedAt: new Date(),
        sizeBytes: 100,
        lineCount: 10,
        category: DocumentCategory.OTHER,
      };

      const refNode: DocumentNode = {
        path: 'other.md',
        incomingRefs: 0,
        outgoingRefs: 0,
        referencedBy: [],
        references: [],
      };

      const duplicateInfo: DuplicateInfo = {
        path: 'other.md',
        duplicateOf: null,
        similarTo: [],
        contentHash: 'abc123',
        similarity: 0,
      };

      const result = evaluator.evaluate(metadata, refNode, duplicateInfo);
      
      const categoryFactor = result.factors.find(f => f.name === 'category');
      expect(categoryFactor?.value).toBe(30); // OTHER should have lowest category score
    });
  });

  describe('Duplicate Penalty Calculation', () => {
    it('should apply heavy penalty for exact duplicates', () => {
      const metadata: DocumentMetadata = {
        path: 'duplicate.md',
        createdAt: new Date(),
        modifiedAt: new Date(),
        sizeBytes: 100,
        lineCount: 10,
        category: DocumentCategory.OTHER,
      };

      const refNode: DocumentNode = {
        path: 'duplicate.md',
        incomingRefs: 0,
        outgoingRefs: 0,
        referencedBy: [],
        references: [],
      };

      const duplicateInfo: DuplicateInfo = {
        path: 'duplicate.md',
        duplicateOf: 'original.md',
        similarTo: [],
        contentHash: 'abc123',
        similarity: 1.0,
      };

      const result = evaluator.evaluate(metadata, refNode, duplicateInfo);
      
      const duplicateFactor = result.factors.find(f => f.name === 'duplicate');
      expect(duplicateFactor?.value).toBe(-50); // Heavy penalty for exact duplicates
    });

    it('should apply moderate penalty for similar documents', () => {
      const metadata: DocumentMetadata = {
        path: 'similar.md',
        createdAt: new Date(),
        modifiedAt: new Date(),
        sizeBytes: 100,
        lineCount: 10,
        category: DocumentCategory.OTHER,
      };

      const refNode: DocumentNode = {
        path: 'similar.md',
        incomingRefs: 0,
        outgoingRefs: 0,
        referencedBy: [],
        references: [],
      };

      const duplicateInfo: DuplicateInfo = {
        path: 'similar.md',
        duplicateOf: null,
        similarTo: ['other.md'],
        contentHash: 'abc123',
        similarity: 0.9,
      };

      const result = evaluator.evaluate(metadata, refNode, duplicateInfo);
      
      const duplicateFactor = result.factors.find(f => f.name === 'duplicate');
      expect(duplicateFactor?.value).toBeLessThan(0); // Should have negative penalty
      expect(duplicateFactor?.value).toBeGreaterThan(-50); // But less than exact duplicate
    });

    it('should not apply penalty for unique documents', () => {
      const metadata: DocumentMetadata = {
        path: 'unique.md',
        createdAt: new Date(),
        modifiedAt: new Date(),
        sizeBytes: 100,
        lineCount: 10,
        category: DocumentCategory.OTHER,
      };

      const refNode: DocumentNode = {
        path: 'unique.md',
        incomingRefs: 0,
        outgoingRefs: 0,
        referencedBy: [],
        references: [],
      };

      const duplicateInfo: DuplicateInfo = {
        path: 'unique.md',
        duplicateOf: null,
        similarTo: [],
        contentHash: 'abc123',
        similarity: 0,
      };

      const result = evaluator.evaluate(metadata, refNode, duplicateInfo);
      
      const duplicateFactor = result.factors.find(f => f.name === 'duplicate');
      expect(duplicateFactor?.value).toBe(0); // No penalty for unique documents
    });
  });

  describe('Total Score Calculation', () => {
    it('should calculate total score within bounds [0, 100]', () => {
      const metadata: DocumentMetadata = {
        path: 'test.md',
        createdAt: new Date(),
        modifiedAt: new Date(),
        sizeBytes: 100,
        lineCount: 10,
        category: DocumentCategory.SPEC,
      };

      const refNode: DocumentNode = {
        path: 'test.md',
        incomingRefs: 10,
        outgoingRefs: 5,
        referencedBy: Array(10).fill('other.md'),
        references: [],
      };

      const duplicateInfo: DuplicateInfo = {
        path: 'test.md',
        duplicateOf: null,
        similarTo: [],
        contentHash: 'abc123',
        similarity: 0,
      };

      const result = evaluator.evaluate(metadata, refNode, duplicateInfo);
      
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should ensure duplicate penalty does not make score negative', () => {
      const metadata: DocumentMetadata = {
        path: 'duplicate.md',
        createdAt: new Date('2020-01-01'), // Old file
        modifiedAt: new Date('2020-01-01'),
        sizeBytes: 100,
        lineCount: 10,
        category: DocumentCategory.OTHER,
      };

      const refNode: DocumentNode = {
        path: 'duplicate.md',
        incomingRefs: 0,
        outgoingRefs: 0,
        referencedBy: [],
        references: [],
      };

      const duplicateInfo: DuplicateInfo = {
        path: 'duplicate.md',
        duplicateOf: 'original.md',
        similarTo: [],
        contentHash: 'abc123',
        similarity: 1.0,
      };

      const result = evaluator.evaluate(metadata, refNode, duplicateInfo);
      
      expect(result.score).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Reasoning Generation', () => {
    it('should generate meaningful reasoning in Japanese', () => {
      const metadata: DocumentMetadata = {
        path: 'test.md',
        createdAt: new Date(),
        modifiedAt: new Date(),
        sizeBytes: 100,
        lineCount: 10,
        category: DocumentCategory.SPEC,
      };

      const refNode: DocumentNode = {
        path: 'test.md',
        incomingRefs: 3,
        outgoingRefs: 2,
        referencedBy: ['a.md', 'b.md', 'c.md'],
        references: [],
      };

      const duplicateInfo: DuplicateInfo = {
        path: 'test.md',
        duplicateOf: null,
        similarTo: [],
        contentHash: 'abc123',
        similarity: 0,
      };

      const result = evaluator.evaluate(metadata, refNode, duplicateInfo);
      
      expect(result.reasoning).toBeTruthy();
      expect(result.reasoning).toContain('3個のドキュメントから参照されています');
      expect(result.reasoning).toContain('カテゴリ: 仕様書');
    });

    it('should mention when document has no references', () => {
      const metadata: DocumentMetadata = {
        path: 'isolated.md',
        createdAt: new Date(),
        modifiedAt: new Date(),
        sizeBytes: 100,
        lineCount: 10,
        category: DocumentCategory.OTHER,
      };

      const refNode: DocumentNode = {
        path: 'isolated.md',
        incomingRefs: 0,
        outgoingRefs: 0,
        referencedBy: [],
        references: [],
      };

      const duplicateInfo: DuplicateInfo = {
        path: 'isolated.md',
        duplicateOf: null,
        similarTo: [],
        contentHash: 'abc123',
        similarity: 0,
      };

      const result = evaluator.evaluate(metadata, refNode, duplicateInfo);
      
      expect(result.reasoning).toContain('他のドキュメントから参照されていません');
    });

    it('should mention duplicate status in reasoning', () => {
      const metadata: DocumentMetadata = {
        path: 'duplicate.md',
        createdAt: new Date(),
        modifiedAt: new Date(),
        sizeBytes: 100,
        lineCount: 10,
        category: DocumentCategory.OTHER,
      };

      const refNode: DocumentNode = {
        path: 'duplicate.md',
        incomingRefs: 0,
        outgoingRefs: 0,
        referencedBy: [],
        references: [],
      };

      const duplicateInfo: DuplicateInfo = {
        path: 'duplicate.md',
        duplicateOf: 'original.md',
        similarTo: [],
        contentHash: 'abc123',
        similarity: 1.0,
      };

      const result = evaluator.evaluate(metadata, refNode, duplicateInfo);
      
      expect(result.reasoning).toContain('重複ドキュメント');
      expect(result.reasoning).toContain('original.md');
    });
  });

  describe('Custom Weights', () => {
    it('should respect custom weights configuration', () => {
      const customEvaluator = new ImportanceEvaluator({
        weights: {
          referenceCount: 0.8, // Very high weight on references
          recency: 0.1,
          size: 0.05,
          category: 0.05,
        },
      });

      const metadata: DocumentMetadata = {
        path: 'test.md',
        createdAt: new Date(),
        modifiedAt: new Date(),
        sizeBytes: 100,
        lineCount: 10,
        category: DocumentCategory.OTHER,
      };

      const refNode: DocumentNode = {
        path: 'test.md',
        incomingRefs: 5,
        outgoingRefs: 0,
        referencedBy: ['a.md', 'b.md', 'c.md', 'd.md', 'e.md'],
        references: [],
      };

      const duplicateInfo: DuplicateInfo = {
        path: 'test.md',
        duplicateOf: null,
        similarTo: [],
        contentHash: 'abc123',
        similarity: 0,
      };

      const result = customEvaluator.evaluate(metadata, refNode, duplicateInfo);
      
      const refFactor = result.factors.find(f => f.name === 'reference_count');
      expect(refFactor?.weight).toBe(0.8);
    });
  });
});

describe('StatusAssigner', () => {
  let assigner: StatusAssigner;

  beforeEach(() => {
    // Use default thresholds (necessary: 60, unnecessary: 30)
    assigner = new StatusAssigner();
  });

  describe('Status Assignment Rules', () => {
    it('should assign UNNECESSARY status to exact duplicates', () => {
      const importance: ImportanceScore = {
        path: 'duplicate.md',
        score: 80, // Even with high score
        factors: [],
        reasoning: 'Test',
      };

      const duplicateInfo: DuplicateInfo = {
        path: 'duplicate.md',
        duplicateOf: 'original.md',
        similarTo: [],
        contentHash: 'abc123',
        similarity: 1.0,
      };

      const refNode: DocumentNode = {
        path: 'duplicate.md',
        incomingRefs: 5,
        outgoingRefs: 0,
        referencedBy: ['a.md', 'b.md', 'c.md', 'd.md', 'e.md'],
        references: [],
      };

      const status = assigner.assignStatus(importance, duplicateInfo, refNode);
      
      expect(status).toBe(DocumentStatus.UNNECESSARY);
    });

    it('should assign NECESSARY status to documents with high importance score', () => {
      const importance: ImportanceScore = {
        path: 'important.md',
        score: 75, // Above threshold (60)
        factors: [],
        reasoning: 'Test',
      };

      const duplicateInfo: DuplicateInfo = {
        path: 'important.md',
        duplicateOf: null,
        similarTo: [],
        contentHash: 'abc123',
        similarity: 0,
      };

      const refNode: DocumentNode = {
        path: 'important.md',
        incomingRefs: 5,
        outgoingRefs: 0,
        referencedBy: ['a.md', 'b.md', 'c.md', 'd.md', 'e.md'],
        references: [],
      };

      const status = assigner.assignStatus(importance, duplicateInfo, refNode);
      
      expect(status).toBe(DocumentStatus.NECESSARY);
    });

    it('should assign UNNECESSARY status to low score documents with no references', () => {
      const importance: ImportanceScore = {
        path: 'unused.md',
        score: 20, // Below threshold (30)
        factors: [],
        reasoning: 'Test',
      };

      const duplicateInfo: DuplicateInfo = {
        path: 'unused.md',
        duplicateOf: null,
        similarTo: [],
        contentHash: 'abc123',
        similarity: 0,
      };

      const refNode: DocumentNode = {
        path: 'unused.md',
        incomingRefs: 0, // No references
        outgoingRefs: 0,
        referencedBy: [],
        references: [],
      };

      const status = assigner.assignStatus(importance, duplicateInfo, refNode);
      
      expect(status).toBe(DocumentStatus.UNNECESSARY);
    });

    it('should assign NEEDS_REVIEW status to low score documents WITH references', () => {
      const importance: ImportanceScore = {
        path: 'review.md',
        score: 25, // Below threshold (30)
        factors: [],
        reasoning: 'Test',
      };

      const duplicateInfo: DuplicateInfo = {
        path: 'review.md',
        duplicateOf: null,
        similarTo: [],
        contentHash: 'abc123',
        similarity: 0,
      };

      const refNode: DocumentNode = {
        path: 'review.md',
        incomingRefs: 2, // Has references
        outgoingRefs: 0,
        referencedBy: ['a.md', 'b.md'],
        references: [],
      };

      const status = assigner.assignStatus(importance, duplicateInfo, refNode);
      
      expect(status).toBe(DocumentStatus.NEEDS_REVIEW);
    });

    it('should assign NEEDS_REVIEW status to medium score documents', () => {
      const importance: ImportanceScore = {
        path: 'medium.md',
        score: 45, // Between thresholds (30-60)
        factors: [],
        reasoning: 'Test',
      };

      const duplicateInfo: DuplicateInfo = {
        path: 'medium.md',
        duplicateOf: null,
        similarTo: [],
        contentHash: 'abc123',
        similarity: 0,
      };

      const refNode: DocumentNode = {
        path: 'medium.md',
        incomingRefs: 1,
        outgoingRefs: 0,
        referencedBy: ['a.md'],
        references: [],
      };

      const status = assigner.assignStatus(importance, duplicateInfo, refNode);
      
      expect(status).toBe(DocumentStatus.NEEDS_REVIEW);
    });

    it('should handle edge case at necessary threshold boundary', () => {
      const importance: ImportanceScore = {
        path: 'boundary.md',
        score: 60, // Exactly at threshold
        factors: [],
        reasoning: 'Test',
      };

      const duplicateInfo: DuplicateInfo = {
        path: 'boundary.md',
        duplicateOf: null,
        similarTo: [],
        contentHash: 'abc123',
        similarity: 0,
      };

      const refNode: DocumentNode = {
        path: 'boundary.md',
        incomingRefs: 2,
        outgoingRefs: 0,
        referencedBy: ['a.md', 'b.md'],
        references: [],
      };

      const status = assigner.assignStatus(importance, duplicateInfo, refNode);
      
      expect(status).toBe(DocumentStatus.NECESSARY);
    });

    it('should handle edge case at unnecessary threshold boundary', () => {
      const importance: ImportanceScore = {
        path: 'boundary.md',
        score: 30, // Exactly at threshold
        factors: [],
        reasoning: 'Test',
      };

      const duplicateInfo: DuplicateInfo = {
        path: 'boundary.md',
        duplicateOf: null,
        similarTo: [],
        contentHash: 'abc123',
        similarity: 0,
      };

      const refNode: DocumentNode = {
        path: 'boundary.md',
        incomingRefs: 0, // No references
        outgoingRefs: 0,
        referencedBy: [],
        references: [],
      };

      const status = assigner.assignStatus(importance, duplicateInfo, refNode);
      
      expect(status).toBe(DocumentStatus.UNNECESSARY);
    });
  });

  describe('Recommendation Generation', () => {
    it('should generate appropriate recommendation for NECESSARY documents', () => {
      const importance: ImportanceScore = {
        path: 'important.md',
        score: 80,
        factors: [],
        reasoning: 'Test',
      };

      const duplicateInfo: DuplicateInfo = {
        path: 'important.md',
        duplicateOf: null,
        similarTo: [],
        contentHash: 'abc123',
        similarity: 0,
      };

      const recommendation = assigner.generateRecommendation(
        DocumentStatus.NECESSARY,
        importance,
        duplicateInfo
      );

      expect(recommendation).toContain('保持');
      expect(recommendation).toContain('推奨');
    });

    it('should generate recommendation for UNNECESSARY duplicate documents', () => {
      const importance: ImportanceScore = {
        path: 'duplicate.md',
        score: 20,
        factors: [],
        reasoning: 'Test',
      };

      const duplicateInfo: DuplicateInfo = {
        path: 'duplicate.md',
        duplicateOf: 'original.md',
        similarTo: [],
        contentHash: 'abc123',
        similarity: 1.0,
      };

      const recommendation = assigner.generateRecommendation(
        DocumentStatus.UNNECESSARY,
        importance,
        duplicateInfo
      );

      expect(recommendation).toContain('重複');
      expect(recommendation).toContain('original.md');
      expect(recommendation).toContain('削除');
    });

    it('should generate recommendation for UNNECESSARY similar documents', () => {
      const importance: ImportanceScore = {
        path: 'similar.md',
        score: 20,
        factors: [],
        reasoning: 'Test',
      };

      const duplicateInfo: DuplicateInfo = {
        path: 'similar.md',
        duplicateOf: null,
        similarTo: ['other.md'],
        contentHash: 'abc123',
        similarity: 0.9,
      };

      const recommendation = assigner.generateRecommendation(
        DocumentStatus.UNNECESSARY,
        importance,
        duplicateInfo
      );

      expect(recommendation).toContain('類似');
      expect(recommendation).toContain('削除');
    });

    it('should generate recommendation for UNNECESSARY unreferenced documents', () => {
      const importance: ImportanceScore = {
        path: 'unused.md',
        score: 20,
        factors: [],
        reasoning: 'Test',
      };

      const duplicateInfo: DuplicateInfo = {
        path: 'unused.md',
        duplicateOf: null,
        similarTo: [],
        contentHash: 'abc123',
        similarity: 0,
      };

      const recommendation = assigner.generateRecommendation(
        DocumentStatus.UNNECESSARY,
        importance,
        duplicateInfo
      );

      expect(recommendation).toContain('参照されておらず');
      expect(recommendation).toContain('削除');
    });

    it('should generate recommendation for NEEDS_REVIEW with similar documents', () => {
      const importance: ImportanceScore = {
        path: 'review.md',
        score: 45,
        factors: [],
        reasoning: 'Test',
      };

      const duplicateInfo: DuplicateInfo = {
        path: 'review.md',
        duplicateOf: null,
        similarTo: ['other.md'],
        contentHash: 'abc123',
        similarity: 0.85,
      };

      const recommendation = assigner.generateRecommendation(
        DocumentStatus.NEEDS_REVIEW,
        importance,
        duplicateInfo
      );

      expect(recommendation).toContain('類似');
      expect(recommendation).toContain('確認');
    });

    it('should generate recommendation for NEEDS_REVIEW without similar documents', () => {
      const importance: ImportanceScore = {
        path: 'review.md',
        score: 45,
        factors: [],
        reasoning: 'Test',
      };

      const duplicateInfo: DuplicateInfo = {
        path: 'review.md',
        duplicateOf: null,
        similarTo: [],
        contentHash: 'abc123',
        similarity: 0,
      };

      const recommendation = assigner.generateRecommendation(
        DocumentStatus.NEEDS_REVIEW,
        importance,
        duplicateInfo
      );

      expect(recommendation).toContain('必要性を確認');
      expect(recommendation).toContain('見直して');
    });
  });

  describe('Custom Thresholds', () => {
    it('should respect custom threshold configuration', () => {
      const customAssigner = new StatusAssigner({
        thresholds: {
          necessary: 80, // Higher threshold
          unnecessary: 20, // Lower threshold
        },
      });

      const importance: ImportanceScore = {
        path: 'test.md',
        score: 70, // Would be NECESSARY with default, but NEEDS_REVIEW with custom
        factors: [],
        reasoning: 'Test',
      };

      const duplicateInfo: DuplicateInfo = {
        path: 'test.md',
        duplicateOf: null,
        similarTo: [],
        contentHash: 'abc123',
        similarity: 0,
      };

      const refNode: DocumentNode = {
        path: 'test.md',
        incomingRefs: 3,
        outgoingRefs: 0,
        referencedBy: ['a.md', 'b.md', 'c.md'],
        references: [],
      };

      const status = customAssigner.assignStatus(importance, duplicateInfo, refNode);
      
      expect(status).toBe(DocumentStatus.NEEDS_REVIEW);
    });
  });

  describe('Complete Status Assignment', () => {
    it('should always assign exactly one status', () => {
      const testCases = [
        { score: 0, refs: 0, duplicate: null },
        { score: 30, refs: 0, duplicate: null },
        { score: 30, refs: 1, duplicate: null },
        { score: 60, refs: 0, duplicate: null },
        { score: 100, refs: 10, duplicate: null },
        { score: 80, refs: 5, duplicate: 'original.md' },
      ];

      for (const testCase of testCases) {
        const importance: ImportanceScore = {
          path: 'test.md',
          score: testCase.score,
          factors: [],
          reasoning: 'Test',
        };

        const duplicateInfo: DuplicateInfo = {
          path: 'test.md',
          duplicateOf: testCase.duplicate,
          similarTo: [],
          contentHash: 'abc123',
          similarity: testCase.duplicate ? 1.0 : 0,
        };

        const refNode: DocumentNode = {
          path: 'test.md',
          incomingRefs: testCase.refs,
          outgoingRefs: 0,
          referencedBy: [],
          references: [],
        };

        const status = assigner.assignStatus(importance, duplicateInfo, refNode);
        
        // Should be one of the three valid statuses
        expect([
          DocumentStatus.NECESSARY,
          DocumentStatus.UNNECESSARY,
          DocumentStatus.NEEDS_REVIEW,
        ]).toContain(status);
      }
    });
  });
});
