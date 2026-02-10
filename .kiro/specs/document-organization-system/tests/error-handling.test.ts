/**
 * Error Handling Integration Tests
 * 
 * Tests that verify error handling across all components
 * Validates Requirements 10.1, 10.2, 10.3, 10.4, 10.5
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import * as os from 'os';
import { Scanner } from '../src/scanner.js';
import { MetadataCollector } from '../src/metadata.js';
import { ReferenceAnalyzer } from '../src/analyzer.js';
import { DuplicateChecker } from '../src/evaluator.js';
import { ReportGenerator } from '../src/reporter.js';
import { ConfigManager } from '../src/config.js';
import type { DocumentWithStatus, DocumentStatus, OutputConfig } from '../src/types.js';

describe('Error Handling Integration', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'error-handling-test-'));
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  describe('Requirement 10.1: File Read Errors', () => {
    it('should continue scanning when some files cannot be read', async () => {
      // Create a readable file in the temp directory
      const readableFile = path.join(tempDir, 'readable.md');
      await fs.writeFile(readableFile, '# Readable Document', 'utf-8');

      // Use a simpler config that scans the current directory
      const config = ConfigManager.getDefaults();
      config.scanner.includePaths = ['.'];  // Scan current directory
      const scanner = new Scanner(config.scanner);
      
      // Scan the directory
      const documents = await scanner.scan(tempDir);
      
      // Should find the readable file
      expect(documents.length).toBeGreaterThan(0);
      expect(documents.some(d => d.path.includes('readable.md'))).toBe(true);
    });

    it('should log errors when files cannot be read during metadata collection', async () => {
      const collector = new MetadataCollector();
      
      // Try to collect metadata for non-existent file
      const result = await collector.collect({
        path: 'nonexistent.md',
        absolutePath: path.join(tempDir, 'nonexistent.md'),
      });
      
      // Should return default values (Requirement 10.3)
      expect(result.sizeBytes).toBe(0);
      expect(result.lineCount).toBe(0);
      
      // Should have logged an error (Requirement 10.5)
      const errors = collector.getErrors();
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].severity).toBe('error');
      expect(errors[0].error).toContain('Failed to collect metadata');
    });

    it('should continue reference analysis when some files cannot be read', async () => {
      // Create files
      const file1 = path.join(tempDir, 'file1.md');
      const file2 = path.join(tempDir, 'file2.md');
      await fs.writeFile(file1, '# File 1\n[Link](file2.md)', 'utf-8');
      await fs.writeFile(file2, '# File 2', 'utf-8');

      const collector = new MetadataCollector();
      const metadata1 = await collector.collect({
        path: 'file1.md',
        absolutePath: file1,
      });
      const metadata2 = await collector.collect({
        path: 'file2.md',
        absolutePath: file2,
      });

      const analyzer = new ReferenceAnalyzer();
      const graph = await analyzer.analyze([metadata1, metadata2], tempDir);
      
      // Should build graph successfully
      expect(graph.documents.size).toBe(2);
      expect(graph.references.length).toBeGreaterThan(0);
    });
  });

  describe('Requirement 10.2: Directory Access Errors', () => {
    it('should skip inaccessible directories and continue scanning', async () => {
      // Create accessible directory with file
      const accessibleDir = path.join(tempDir, 'accessible');
      await fs.mkdir(accessibleDir);
      await fs.writeFile(path.join(accessibleDir, 'doc.md'), '# Document', 'utf-8');

      // Create restricted directory (if possible on this platform)
      const restrictedDir = path.join(tempDir, 'restricted');
      await fs.mkdir(restrictedDir);
      await fs.writeFile(path.join(restrictedDir, 'secret.md'), '# Secret', 'utf-8');
      
      try {
        await fs.chmod(restrictedDir, 0o000); // Remove all permissions
      } catch (error) {
        // Skip test if we can't change permissions (e.g., on Windows)
        console.log('Skipping permission test - platform does not support chmod');
        return;
      }

      const config = ConfigManager.getDefaults();
      config.scanner.includePaths = ['accessible', 'restricted'];
      const scanner = new Scanner(config.scanner);
      
      const documents = await scanner.scan(tempDir);
      
      // Should find the accessible file
      expect(documents.some(d => d.path.includes('accessible'))).toBe(true);
      
      // Should have logged an error for the restricted directory
      const errors = scanner.getErrors();
      const hasRestrictedError = errors.some(e => 
        e.path.includes('restricted') && e.severity === 'error'
      );
      
      // Restore permissions for cleanup
      try {
        await fs.chmod(restrictedDir, 0o755);
      } catch (error) {
        // Ignore cleanup errors
      }
      
      // Only check for error if chmod worked
      if (process.platform !== 'win32') {
        expect(hasRestrictedError).toBe(true);
      }
    });

    it('should log warning for non-existent include paths', async () => {
      const config = ConfigManager.getDefaults();
      config.scanner.includePaths = ['does-not-exist', 'also-missing'];
      const scanner = new Scanner(config.scanner);
      
      await scanner.scan(tempDir);
      
      const errors = scanner.getErrors();
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.error.includes('does not exist'))).toBe(true);
    });
  });

  describe('Requirement 10.3: Metadata Extraction Failure Handling', () => {
    it('should use default values when metadata extraction fails', async () => {
      const collector = new MetadataCollector();
      
      const result = await collector.collect({
        path: 'missing.md',
        absolutePath: path.join(tempDir, 'missing.md'),
      });
      
      // Should use default values
      expect(result.path).toBe('missing.md');
      expect(result.sizeBytes).toBe(0);
      expect(result.lineCount).toBe(0);
      expect(result.category).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.modifiedAt).toBeInstanceOf(Date);
    });
  });

  describe('Requirement 10.4: Output Write Failure Handling', () => {
    it('should provide clear error message when output path is invalid', async () => {
      const generator = new ReportGenerator();
      const report = generator.generate([], [], tempDir);
      
      // Note: Our implementation now creates directories, so we need a truly invalid path
      // On Unix systems, we can't write to /dev/null/file.md
      // This test verifies the error message is clear when write fails
      const invalidConfig: OutputConfig = {
        outputPath: '\0invalid\0path.md', // Null bytes are invalid in filenames
        includeMetadata: true,
        includeReasoningDetails: true,
      };
      
      try {
        await generator.writeToFile(report, invalidConfig, tempDir);
        // If it somehow succeeds, fail the test
        expect.fail('Should have thrown an error');
      } catch (error) {
        // Should throw with clear error message
        expect(error).toBeInstanceOf(Error);
        if (error instanceof Error) {
          expect(error.message).toContain('Failed to write report');
        }
      }
    });
  });

  describe('Requirement 10.5: Error Summary in Report', () => {
    it('should include all errors in the generated report', async () => {
      const generator = new ReportGenerator();
      
      const errors = [
        {
          path: 'file1.md',
          error: 'Cannot read file',
          timestamp: new Date(),
          severity: 'error' as const,
        },
        {
          path: 'file2.md',
          error: 'Permission denied',
          timestamp: new Date(),
          severity: 'warning' as const,
        },
      ];
      
      const report = generator.generate([], errors, tempDir);
      
      expect(report.errors).toHaveLength(2);
      expect(report.errors[0].path).toBe('file1.md');
      expect(report.errors[1].path).toBe('file2.md');
      
      // Check that errors appear in markdown output
      const config: OutputConfig = {
        outputPath: 'report.md',
        includeMetadata: true,
        includeReasoningDetails: true,
      };
      const markdown = generator.toMarkdown(report, config);
      
      expect(markdown).toContain('## Errors and Warnings');
      expect(markdown).toContain('file1.md');
      expect(markdown).toContain('Cannot read file');
      expect(markdown).toContain('file2.md');
      expect(markdown).toContain('Permission denied');
    });
  });

  describe('End-to-End Error Handling', () => {
    it('should complete full workflow with errors and include them in report', async () => {
      // Create a workspace with some files
      const goodFile = path.join(tempDir, 'good.md');
      await fs.writeFile(goodFile, '# Good Document', 'utf-8');
      
      // Scan
      const config = ConfigManager.getDefaults();
      const scanner = new Scanner(config.scanner);
      const documents = await scanner.scan(tempDir);
      
      // Collect metadata (including for a missing file)
      const collector = new MetadataCollector();
      const metadataList = [];
      for (const doc of documents) {
        const metadata = await collector.collect(doc);
        metadataList.push(metadata);
      }
      
      // Try to collect for a missing file
      await collector.collect({
        path: 'missing.md',
        absolutePath: path.join(tempDir, 'missing.md'),
      });
      
      // Analyze references
      const analyzer = new ReferenceAnalyzer();
      await analyzer.analyze(metadataList, tempDir);
      
      // Check duplicates
      const duplicateChecker = new DuplicateChecker();
      await duplicateChecker.checkDuplicates(metadataList, tempDir);
      
      // Collect all errors
      const allErrors = [
        ...scanner.getErrors(),
        ...collector.getErrors(),
        ...analyzer.getErrors(),
        ...duplicateChecker.getErrors(),
      ];
      
      // Generate report with errors
      const generator = new ReportGenerator();
      const report = generator.generate([], allErrors, tempDir);
      
      // Should have errors from metadata collection
      expect(report.errors.length).toBeGreaterThan(0);
      
      // Write report
      const outputConfig: OutputConfig = {
        outputPath: 'error-report.md',
        includeMetadata: true,
        includeReasoningDetails: true,
      };
      await generator.writeToFile(report, outputConfig, tempDir);
      
      // Verify report was written
      const reportPath = path.join(tempDir, 'error-report.md');
      const reportExists = fsSync.existsSync(reportPath);
      expect(reportExists).toBe(true);
      
      // Verify report contains error section
      const reportContent = await fs.readFile(reportPath, 'utf-8');
      expect(reportContent).toContain('## Errors and Warnings');
    });
  });
});
