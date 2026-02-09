/**
 * Unit tests for MetadataCollector
 * 
 * Tests specific examples and edge cases for metadata collection
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { MetadataCollector } from '../src/metadata.js';
import { DocumentCategory, ScannedDocument } from '../src/types.js';

describe('MetadataCollector', () => {
  let collector: MetadataCollector;
  let tempDir: string;

  beforeEach(async () => {
    collector = new MetadataCollector();
    // Create a temporary directory for test files
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'metadata-test-'));
  });

  afterEach(async () => {
    // Clean up temporary directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('collect', () => {
    it('should collect metadata for a simple file', async () => {
      const content = 'Line 1\nLine 2\nLine 3';
      const filePath = path.join(tempDir, 'test.md');
      await fs.writeFile(filePath, content, 'utf-8');

      const document: ScannedDocument = {
        path: 'test.md',
        absolutePath: filePath,
      };

      const metadata = await collector.collect(document);

      expect(metadata.path).toBe('test.md');
      expect(metadata.sizeBytes).toBe(content.length);
      expect(metadata.lineCount).toBe(3);
      expect(metadata.category).toBe(DocumentCategory.OTHER);
      expect(metadata.createdAt).toBeInstanceOf(Date);
      expect(metadata.modifiedAt).toBeInstanceOf(Date);
    });

    it('should handle empty files correctly', async () => {
      const filePath = path.join(tempDir, 'empty.md');
      await fs.writeFile(filePath, '', 'utf-8');

      const document: ScannedDocument = {
        path: 'empty.md',
        absolutePath: filePath,
      };

      const metadata = await collector.collect(document);

      expect(metadata.sizeBytes).toBe(0);
      expect(metadata.lineCount).toBe(0);
      expect(metadata.category).toBe(DocumentCategory.OTHER);
    });

    it('should handle files with only newlines', async () => {
      const content = '\n\n\n';
      const filePath = path.join(tempDir, 'newlines.md');
      await fs.writeFile(filePath, content, 'utf-8');

      const document: ScannedDocument = {
        path: 'newlines.md',
        absolutePath: filePath,
      };

      const metadata = await collector.collect(document);

      expect(metadata.lineCount).toBe(4); // 3 newlines = 4 lines
    });

    it('should handle files without trailing newline', async () => {
      const content = 'Line 1\nLine 2';
      const filePath = path.join(tempDir, 'no-trailing.md');
      await fs.writeFile(filePath, content, 'utf-8');

      const document: ScannedDocument = {
        path: 'no-trailing.md',
        absolutePath: filePath,
      };

      const metadata = await collector.collect(document);

      expect(metadata.lineCount).toBe(2);
    });

    it('should handle single line files', async () => {
      const content = 'Single line';
      const filePath = path.join(tempDir, 'single.md');
      await fs.writeFile(filePath, content, 'utf-8');

      const document: ScannedDocument = {
        path: 'single.md',
        absolutePath: filePath,
      };

      const metadata = await collector.collect(document);

      expect(metadata.lineCount).toBe(1);
    });

    it('should throw error for non-existent file', async () => {
      const document: ScannedDocument = {
        path: 'nonexistent.md',
        absolutePath: path.join(tempDir, 'nonexistent.md'),
      };

      await expect(collector.collect(document)).rejects.toThrow();
    });

    it('should handle files with special characters in content', async () => {
      const content = 'Special: 日本語\n中文\n한글\nEmoji: 🎉';
      const filePath = path.join(tempDir, 'special.md');
      await fs.writeFile(filePath, content, 'utf-8');

      const document: ScannedDocument = {
        path: 'special.md',
        absolutePath: filePath,
      };

      const metadata = await collector.collect(document);

      expect(metadata.lineCount).toBe(4);
      expect(metadata.sizeBytes).toBeGreaterThan(0);
    });
  });

  describe('category determination', () => {
    it('should categorize .kiro/specs files as SPEC', async () => {
      const filePath = path.join(tempDir, 'test.md');
      await fs.writeFile(filePath, 'content', 'utf-8');

      const document: ScannedDocument = {
        path: '.kiro/specs/feature/design.md',
        absolutePath: filePath,
      };

      const metadata = await collector.collect(document);
      expect(metadata.category).toBe(DocumentCategory.SPEC);
    });

    it('should categorize files with "spec" in path as SPEC', async () => {
      const filePath = path.join(tempDir, 'test.md');
      await fs.writeFile(filePath, 'content', 'utf-8');

      const document: ScannedDocument = {
        path: 'my-spec-document.md',
        absolutePath: filePath,
      };

      const metadata = await collector.collect(document);
      expect(metadata.category).toBe(DocumentCategory.SPEC);
    });

    it('should categorize .agent/workflows files as WORKFLOW', async () => {
      const filePath = path.join(tempDir, 'test.md');
      await fs.writeFile(filePath, 'content', 'utf-8');

      const document: ScannedDocument = {
        path: '.agent/workflows/my-workflow.md',
        absolutePath: filePath,
      };

      const metadata = await collector.collect(document);
      expect(metadata.category).toBe(DocumentCategory.WORKFLOW);
    });

    it('should categorize .kiro/workflows files as WORKFLOW', async () => {
      const filePath = path.join(tempDir, 'test.md');
      await fs.writeFile(filePath, 'content', 'utf-8');

      const document: ScannedDocument = {
        path: '.kiro/workflows/workflow.md',
        absolutePath: filePath,
      };

      const metadata = await collector.collect(document);
      expect(metadata.category).toBe(DocumentCategory.WORKFLOW);
    });

    it('should categorize .agent/skills files as SKILL', async () => {
      const filePath = path.join(tempDir, 'test.md');
      await fs.writeFile(filePath, 'content', 'utf-8');

      const document: ScannedDocument = {
        path: '.agent/skills/my-skill.md',
        absolutePath: filePath,
      };

      const metadata = await collector.collect(document);
      expect(metadata.category).toBe(DocumentCategory.SKILL);
    });

    it('should categorize .kiro/skills files as SKILL', async () => {
      const filePath = path.join(tempDir, 'test.md');
      await fs.writeFile(filePath, 'content', 'utf-8');

      const document: ScannedDocument = {
        path: '.kiro/skills/skill.md',
        absolutePath: filePath,
      };

      const metadata = await collector.collect(document);
      expect(metadata.category).toBe(DocumentCategory.SKILL);
    });

    it('should categorize backlog files as BACKLOG', async () => {
      const filePath = path.join(tempDir, 'test.md');
      await fs.writeFile(filePath, 'content', 'utf-8');

      const document: ScannedDocument = {
        path: 'backlog/task-123.md',
        absolutePath: filePath,
      };

      const metadata = await collector.collect(document);
      expect(metadata.category).toBe(DocumentCategory.BACKLOG);
    });

    it('should categorize docs files as DOCS', async () => {
      const filePath = path.join(tempDir, 'test.md');
      await fs.writeFile(filePath, 'content', 'utf-8');

      const document: ScannedDocument = {
        path: 'docs/README.md',
        absolutePath: filePath,
      };

      const metadata = await collector.collect(document);
      expect(metadata.category).toBe(DocumentCategory.DOCS);
    });

    it('should categorize config.json as CONFIG', async () => {
      const filePath = path.join(tempDir, 'config.json');
      await fs.writeFile(filePath, '{}', 'utf-8');

      const document: ScannedDocument = {
        path: 'config.json',
        absolutePath: filePath,
      };

      const metadata = await collector.collect(document);
      expect(metadata.category).toBe(DocumentCategory.CONFIG);
    });

    it('should categorize package.json as CONFIG', async () => {
      const filePath = path.join(tempDir, 'package.json');
      await fs.writeFile(filePath, '{}', 'utf-8');

      const document: ScannedDocument = {
        path: 'package.json',
        absolutePath: filePath,
      };

      const metadata = await collector.collect(document);
      expect(metadata.category).toBe(DocumentCategory.CONFIG);
    });

    it('should categorize tsconfig.json as CONFIG', async () => {
      const filePath = path.join(tempDir, 'tsconfig.json');
      await fs.writeFile(filePath, '{}', 'utf-8');

      const document: ScannedDocument = {
        path: 'tsconfig.json',
        absolutePath: filePath,
      };

      const metadata = await collector.collect(document);
      expect(metadata.category).toBe(DocumentCategory.CONFIG);
    });

    it('should categorize .config files as CONFIG', async () => {
      const filePath = path.join(tempDir, '.config.md');
      await fs.writeFile(filePath, 'content', 'utf-8');

      const document: ScannedDocument = {
        path: '.config.md',
        absolutePath: filePath,
      };

      const metadata = await collector.collect(document);
      expect(metadata.category).toBe(DocumentCategory.CONFIG);
    });

    it('should categorize files with .config.ts extension as CONFIG', async () => {
      const filePath = path.join(tempDir, 'vitest.config.ts');
      await fs.writeFile(filePath, 'content', 'utf-8');

      const document: ScannedDocument = {
        path: 'vitest.config.ts',
        absolutePath: filePath,
      };

      const metadata = await collector.collect(document);
      expect(metadata.category).toBe(DocumentCategory.CONFIG);
    });

    it('should categorize unknown files as OTHER', async () => {
      const filePath = path.join(tempDir, 'random.md');
      await fs.writeFile(filePath, 'content', 'utf-8');

      const document: ScannedDocument = {
        path: 'random.md',
        absolutePath: filePath,
      };

      const metadata = await collector.collect(document);
      expect(metadata.category).toBe(DocumentCategory.OTHER);
    });

    it('should handle Windows-style paths', async () => {
      const filePath = path.join(tempDir, 'test.md');
      await fs.writeFile(filePath, 'content', 'utf-8');

      const document: ScannedDocument = {
        path: '.kiro\\specs\\feature\\design.md',
        absolutePath: filePath,
      };

      const metadata = await collector.collect(document);
      expect(metadata.category).toBe(DocumentCategory.SPEC);
    });

    it('should be case-insensitive for category determination', async () => {
      const filePath = path.join(tempDir, 'test.md');
      await fs.writeFile(filePath, 'content', 'utf-8');

      const document: ScannedDocument = {
        path: '.KIRO/SPECS/feature/design.md',
        absolutePath: filePath,
      };

      const metadata = await collector.collect(document);
      expect(metadata.category).toBe(DocumentCategory.SPEC);
    });
  });

  describe('line counting edge cases', () => {
    it('should count lines correctly for files with CRLF line endings', async () => {
      const content = 'Line 1\r\nLine 2\r\nLine 3';
      const filePath = path.join(tempDir, 'crlf.md');
      await fs.writeFile(filePath, content, 'utf-8');

      const document: ScannedDocument = {
        path: 'crlf.md',
        absolutePath: filePath,
      };

      const metadata = await collector.collect(document);
      // CRLF is treated as one line ending
      expect(metadata.lineCount).toBe(3);
    });

    it('should count lines correctly for files with mixed line endings', async () => {
      const content = 'Line 1\nLine 2\r\nLine 3';
      const filePath = path.join(tempDir, 'mixed.md');
      await fs.writeFile(filePath, content, 'utf-8');

      const document: ScannedDocument = {
        path: 'mixed.md',
        absolutePath: filePath,
      };

      const metadata = await collector.collect(document);
      expect(metadata.lineCount).toBe(3);
    });

    it('should handle very large files', async () => {
      // Create a file with 10000 lines
      const lines = Array(10000).fill('test line');
      const content = lines.join('\n');
      const filePath = path.join(tempDir, 'large.md');
      await fs.writeFile(filePath, content, 'utf-8');

      const document: ScannedDocument = {
        path: 'large.md',
        absolutePath: filePath,
      };

      const metadata = await collector.collect(document);
      expect(metadata.lineCount).toBe(10000);
      expect(metadata.sizeBytes).toBeGreaterThan(0);
    });
  });
});
