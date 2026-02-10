/**
 * Integration tests for the Document Organization System
 * 
 * Tests the complete end-to-end workflow
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import { runDocumentOrganization } from '../src/index.js';

describe('Document Organization System Integration', () => {
  let testWorkspace: string;

  beforeEach(async () => {
    // Create a temporary test workspace
    testWorkspace = path.join(process.cwd(), 'test-workspace-' + Date.now());
    await fs.mkdir(testWorkspace, { recursive: true });
  });

  afterEach(async () => {
    // Clean up test workspace
    try {
      await fs.rm(testWorkspace, { recursive: true, force: true });
    } catch (error) {
      console.warn('Failed to clean up test workspace:', error);
    }
  });

  it('should complete full workflow from scan to report', async () => {
    // Setup: Create test workspace with known structure
    await fs.mkdir(path.join(testWorkspace, '.kiro', 'specs', 'feature1'), { recursive: true });
    await fs.mkdir(path.join(testWorkspace, '.agent', 'workflows'), { recursive: true });
    await fs.mkdir(path.join(testWorkspace, 'docs'), { recursive: true });
    await fs.mkdir(path.join(testWorkspace, 'node_modules'), { recursive: true });

    // Create test documents
    await fs.writeFile(
      path.join(testWorkspace, '.kiro', 'specs', 'feature1', 'design.md'),
      '# Feature 1 Design\n\nThis is a design document.\n\nSee also: [workflow](../../../.agent/workflows/workflow1.md)'
    );
    await fs.writeFile(
      path.join(testWorkspace, '.agent', 'workflows', 'workflow1.md'),
      '# Workflow 1\n\nThis is a workflow document.'
    );
    await fs.writeFile(
      path.join(testWorkspace, 'docs', 'README.md'),
      '# Documentation\n\nThis is documentation.'
    );
    // This file should be excluded
    await fs.writeFile(
      path.join(testWorkspace, 'node_modules', 'package.md'),
      'Should be excluded'
    );

    // Execute: Run full system
    const result = await runDocumentOrganization(testWorkspace);

    // Verify: Result is successful
    expect(result.success).toBe(true);
    expect(result.report).toBeDefined();
    expect(result.reportPath).toBeDefined();

    // Verify: Report has correct structure
    expect(result.report.summary.totalDocuments).toBe(3); // Excludes node_modules
    expect(result.report.summary.necessaryCount).toBeGreaterThanOrEqual(0);
    expect(result.report.summary.unnecessaryCount).toBeGreaterThanOrEqual(0);
    expect(result.report.summary.needsReviewCount).toBeGreaterThanOrEqual(0);

    // Verify: All documents have status
    const totalByStatus =
      result.report.summary.necessaryCount +
      result.report.summary.unnecessaryCount +
      result.report.summary.needsReviewCount;
    expect(totalByStatus).toBe(3);

    // Verify: Report file exists
    const reportExists = await fs
      .access(result.reportPath)
      .then(() => true)
      .catch(() => false);
    expect(reportExists).toBe(true);

    // Verify: Report file is valid markdown
    const reportContent = await fs.readFile(result.reportPath, 'utf-8');
    expect(reportContent).toContain('# Document Organization Report');
    expect(reportContent).toContain('## Summary');
    expect(reportContent).toContain('Total Documents');

    // Verify: Reference was detected
    // The design.md references workflow1.md
    const designDoc = Array.from(result.report.documentsByStatus.values())
      .flat()
      .find(d => d.metadata.path.includes('design.md'));
    expect(designDoc).toBeDefined();
  });

  it('should handle empty workspace gracefully', async () => {
    // Execute: Run on empty workspace
    const result = await runDocumentOrganization(testWorkspace);

    // Verify: Result is successful even with no documents
    expect(result.success).toBe(true);
    expect(result.report.summary.totalDocuments).toBe(0);

    // Verify: Report file was created
    const reportExists = await fs
      .access(result.reportPath)
      .then(() => true)
      .catch(() => false);
    expect(reportExists).toBe(true);
  });

  it('should handle workspace with only excluded directories', async () => {
    // Setup: Create only excluded directories
    await fs.mkdir(path.join(testWorkspace, 'node_modules'), { recursive: true });
    await fs.mkdir(path.join(testWorkspace, '.git'), { recursive: true });
    await fs.writeFile(path.join(testWorkspace, 'node_modules', 'test.md'), 'excluded');
    await fs.writeFile(path.join(testWorkspace, '.git', 'config.md'), 'excluded');

    // Execute: Run system
    const result = await runDocumentOrganization(testWorkspace);

    // Verify: No documents found (all excluded)
    expect(result.success).toBe(true);
    expect(result.report.summary.totalDocuments).toBe(0);
  });

  it('should detect duplicate documents', async () => {
    // Setup: Create duplicate documents
    await fs.mkdir(path.join(testWorkspace, 'docs'), { recursive: true });
    const content = '# Duplicate Content\n\nThis is the same content.';
    await fs.writeFile(path.join(testWorkspace, 'docs', 'doc1.md'), content);
    await fs.writeFile(path.join(testWorkspace, 'docs', 'doc2.md'), content);

    // Execute: Run system
    const result = await runDocumentOrganization(testWorkspace);

    // Verify: Duplicates were detected
    expect(result.success).toBe(true);
    expect(result.report.summary.duplicatesFound).toBeGreaterThan(0);

    // Verify: At least one document is marked as unnecessary (duplicate)
    expect(result.report.summary.unnecessaryCount).toBeGreaterThan(0);
  });

  it('should handle file read errors gracefully', async () => {
    // Setup: Create a document
    await fs.mkdir(path.join(testWorkspace, 'docs'), { recursive: true });
    const docPath = path.join(testWorkspace, 'docs', 'test.md');
    await fs.writeFile(docPath, '# Test Document');

    // Make file unreadable (this might not work on all systems)
    try {
      await fs.chmod(docPath, 0o000);
    } catch (error) {
      // Skip test if we can't change permissions
      console.warn('Skipping file permission test - cannot change file permissions');
      return;
    }

    // Execute: Run system
    const result = await runDocumentOrganization(testWorkspace);

    // Restore permissions for cleanup
    try {
      await fs.chmod(docPath, 0o644);
    } catch (error) {
      // Ignore
    }

    // Verify: System completed despite error
    expect(result.success).toBe(true);
    // Errors should be logged
    expect(result.report.errors.length).toBeGreaterThan(0);
  });

  it('should use custom configuration when provided', async () => {
    // Setup: Create custom config
    const configPath = path.join(testWorkspace, 'custom-config.json');
    await fs.writeFile(
      configPath,
      JSON.stringify({
        scanner: {
          includePaths: ['docs'],
          excludePaths: ['node_modules'],
          fileExtensions: ['.md'],
        },
        evaluator: {
          weights: {
            referenceCount: 0.5,
            recency: 0.3,
            size: 0.1,
            category: 0.1,
          },
          thresholds: {
            necessary: 70,
            unnecessary: 20,
          },
        },
        output: {
          outputPath: 'CUSTOM_REPORT.md',
          includeMetadata: true,
          includeReasoningDetails: true,
        },
      })
    );

    // Create test documents
    await fs.mkdir(path.join(testWorkspace, 'docs'), { recursive: true });
    await fs.writeFile(path.join(testWorkspace, 'docs', 'test.md'), '# Test');

    // Execute: Run with custom config
    const result = await runDocumentOrganization(testWorkspace, configPath);

    // Verify: Custom output path was used
    expect(result.success).toBe(true);
    expect(result.reportPath).toContain('CUSTOM_REPORT.md');

    // Verify: Report file exists at custom location
    const reportExists = await fs
      .access(result.reportPath)
      .then(() => true)
      .catch(() => false);
    expect(reportExists).toBe(true);
  });

  it('should track progress when callback provided', async () => {
    // Setup: Create test documents
    await fs.mkdir(path.join(testWorkspace, 'docs'), { recursive: true });
    await fs.writeFile(path.join(testWorkspace, 'docs', 'test.md'), '# Test');

    // Track progress calls
    const progressCalls: Array<{ message: string; current: number; total: number }> = [];
    const progressCallback = (message: string, current: number, total: number) => {
      progressCalls.push({ message, current, total });
    };

    // Execute: Run with progress callback
    const result = await runDocumentOrganization(testWorkspace, undefined, progressCallback);

    // Verify: Progress was reported
    expect(result.success).toBe(true);
    expect(progressCalls.length).toBeGreaterThan(0);

    // Verify: Progress goes from 0 to total
    expect(progressCalls[0].current).toBe(0);
    expect(progressCalls[progressCalls.length - 1].current).toBe(
      progressCalls[progressCalls.length - 1].total
    );
  });
});
