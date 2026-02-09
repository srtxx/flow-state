/**
 * Unit tests for Scanner class
 * 
 * Tests:
 * - Basic scanning functionality
 * - Exclusion of specified paths
 * - File extension filtering
 * - Relative path recording
 * - Error handling
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { Scanner } from '../src/scanner.js';
import { ScannerConfig } from '../src/types.js';

describe('Scanner', () => {
  let testWorkspace: string;
  let defaultConfig: ScannerConfig;

  beforeEach(() => {
    // Create a temporary test workspace
    testWorkspace = fs.mkdtempSync(path.join(os.tmpdir(), 'scanner-test-'));
    
    defaultConfig = {
      includePaths: ['.'],
      excludePaths: ['node_modules', '.git', 'dist'],
      fileExtensions: ['.md', '.txt'],
    };
  });

  afterEach(() => {
    // Clean up test workspace
    if (fs.existsSync(testWorkspace)) {
      fs.rmSync(testWorkspace, { recursive: true, force: true });
    }
  });

  describe('Basic Scanning', () => {
    it('should discover markdown files in the workspace', async () => {
      // Setup: Create test files
      fs.writeFileSync(path.join(testWorkspace, 'README.md'), '# Test');
      fs.writeFileSync(path.join(testWorkspace, 'notes.txt'), 'Notes');
      
      // Execute
      const scanner = new Scanner(defaultConfig);
      const results = await scanner.scan(testWorkspace);
      
      // Verify
      expect(results).toHaveLength(2);
      expect(results.map(d => d.path).sort()).toEqual(['README.md', 'notes.txt']);
    });

    it('should discover files in subdirectories', async () => {
      // Setup: Create nested directory structure
      fs.mkdirSync(path.join(testWorkspace, 'docs'));
      fs.mkdirSync(path.join(testWorkspace, 'docs', 'guides'));
      fs.writeFileSync(path.join(testWorkspace, 'docs', 'README.md'), '# Docs');
      fs.writeFileSync(path.join(testWorkspace, 'docs', 'guides', 'guide.md'), '# Guide');
      
      // Execute
      const scanner = new Scanner(defaultConfig);
      const results = await scanner.scan(testWorkspace);
      
      // Verify
      expect(results).toHaveLength(2);
      const paths = results.map(d => d.path).sort();
      expect(paths).toContain(path.join('docs', 'README.md'));
      expect(paths).toContain(path.join('docs', 'guides', 'guide.md'));
    });

    it('should record both relative and absolute paths', async () => {
      // Setup
      fs.writeFileSync(path.join(testWorkspace, 'test.md'), '# Test');
      
      // Execute
      const scanner = new Scanner(defaultConfig);
      const results = await scanner.scan(testWorkspace);
      
      // Verify
      expect(results).toHaveLength(1);
      expect(results[0].path).toBe('test.md');
      expect(results[0].absolutePath).toBe(path.join(testWorkspace, 'test.md'));
    });

    it('should return empty array for empty workspace', async () => {
      // Execute (empty workspace)
      const scanner = new Scanner(defaultConfig);
      const results = await scanner.scan(testWorkspace);
      
      // Verify
      expect(results).toHaveLength(0);
    });
  });

  describe('Path Exclusion', () => {
    it('should exclude node_modules directory', async () => {
      // Setup
      fs.mkdirSync(path.join(testWorkspace, 'node_modules'));
      fs.writeFileSync(path.join(testWorkspace, 'README.md'), '# Root');
      fs.writeFileSync(path.join(testWorkspace, 'node_modules', 'package.md'), '# Package');
      
      // Execute
      const scanner = new Scanner(defaultConfig);
      const results = await scanner.scan(testWorkspace);
      
      // Verify
      expect(results).toHaveLength(1);
      expect(results[0].path).toBe('README.md');
    });

    it('should exclude .git directory', async () => {
      // Setup
      fs.mkdirSync(path.join(testWorkspace, '.git'));
      fs.writeFileSync(path.join(testWorkspace, 'README.md'), '# Root');
      fs.writeFileSync(path.join(testWorkspace, '.git', 'config.txt'), 'config');
      
      // Execute
      const scanner = new Scanner(defaultConfig);
      const results = await scanner.scan(testWorkspace);
      
      // Verify
      expect(results).toHaveLength(1);
      expect(results[0].path).toBe('README.md');
    });

    it('should exclude dist directory', async () => {
      // Setup
      fs.mkdirSync(path.join(testWorkspace, 'dist'));
      fs.writeFileSync(path.join(testWorkspace, 'README.md'), '# Root');
      fs.writeFileSync(path.join(testWorkspace, 'dist', 'output.md'), '# Output');
      
      // Execute
      const scanner = new Scanner(defaultConfig);
      const results = await scanner.scan(testWorkspace);
      
      // Verify
      expect(results).toHaveLength(1);
      expect(results[0].path).toBe('README.md');
    });

    it('should exclude nested excluded directories', async () => {
      // Setup
      fs.mkdirSync(path.join(testWorkspace, 'src'));
      fs.mkdirSync(path.join(testWorkspace, 'src', 'node_modules'));
      fs.writeFileSync(path.join(testWorkspace, 'src', 'README.md'), '# Src');
      fs.writeFileSync(path.join(testWorkspace, 'src', 'node_modules', 'lib.md'), '# Lib');
      
      // Execute
      const scanner = new Scanner(defaultConfig);
      const results = await scanner.scan(testWorkspace);
      
      // Verify
      expect(results).toHaveLength(1);
      expect(results[0].path).toBe(path.join('src', 'README.md'));
    });
  });

  describe('File Extension Filtering', () => {
    it('should only include files with specified extensions', async () => {
      // Setup
      fs.writeFileSync(path.join(testWorkspace, 'README.md'), '# Test');
      fs.writeFileSync(path.join(testWorkspace, 'notes.txt'), 'Notes');
      fs.writeFileSync(path.join(testWorkspace, 'script.js'), 'console.log()');
      fs.writeFileSync(path.join(testWorkspace, 'data.json'), '{}');
      
      // Execute
      const scanner = new Scanner(defaultConfig);
      const results = await scanner.scan(testWorkspace);
      
      // Verify
      expect(results).toHaveLength(2);
      const paths = results.map(d => d.path).sort();
      expect(paths).toEqual(['README.md', 'notes.txt']);
    });

    it('should handle case-insensitive extensions', async () => {
      // Setup
      fs.writeFileSync(path.join(testWorkspace, 'README.MD'), '# Test');
      fs.writeFileSync(path.join(testWorkspace, 'notes.TXT'), 'Notes');
      
      // Execute
      const scanner = new Scanner(defaultConfig);
      const results = await scanner.scan(testWorkspace);
      
      // Verify
      expect(results).toHaveLength(2);
    });

    it('should handle files without extensions', async () => {
      // Setup
      fs.writeFileSync(path.join(testWorkspace, 'README'), 'No extension');
      fs.writeFileSync(path.join(testWorkspace, 'test.md'), '# Test');
      
      // Execute
      const scanner = new Scanner(defaultConfig);
      const results = await scanner.scan(testWorkspace);
      
      // Verify
      expect(results).toHaveLength(1);
      expect(results[0].path).toBe('test.md');
    });
  });

  describe('Include Paths Configuration', () => {
    it('should only scan specified include paths', async () => {
      // Setup
      fs.mkdirSync(path.join(testWorkspace, 'docs'));
      fs.mkdirSync(path.join(testWorkspace, 'other'));
      fs.writeFileSync(path.join(testWorkspace, 'docs', 'README.md'), '# Docs');
      fs.writeFileSync(path.join(testWorkspace, 'other', 'file.md'), '# Other');
      
      // Execute with custom config
      const config: ScannerConfig = {
        includePaths: ['docs'],
        excludePaths: [],
        fileExtensions: ['.md'],
      };
      const scanner = new Scanner(config);
      const results = await scanner.scan(testWorkspace);
      
      // Verify
      expect(results).toHaveLength(1);
      expect(results[0].path).toBe(path.join('docs', 'README.md'));
    });

    it('should scan multiple include paths', async () => {
      // Setup
      fs.mkdirSync(path.join(testWorkspace, 'docs'));
      fs.mkdirSync(path.join(testWorkspace, 'guides'));
      fs.writeFileSync(path.join(testWorkspace, 'docs', 'README.md'), '# Docs');
      fs.writeFileSync(path.join(testWorkspace, 'guides', 'guide.md'), '# Guide');
      
      // Execute with custom config
      const config: ScannerConfig = {
        includePaths: ['docs', 'guides'],
        excludePaths: [],
        fileExtensions: ['.md'],
      };
      const scanner = new Scanner(config);
      const results = await scanner.scan(testWorkspace);
      
      // Verify
      expect(results).toHaveLength(2);
    });

    it('should handle non-existent include paths gracefully', async () => {
      // Setup
      fs.writeFileSync(path.join(testWorkspace, 'README.md'), '# Test');
      
      // Execute with non-existent path
      const config: ScannerConfig = {
        includePaths: ['non-existent', '.'],
        excludePaths: [],
        fileExtensions: ['.md'],
      };
      const scanner = new Scanner(config);
      const results = await scanner.scan(testWorkspace);
      
      // Verify - should still find files in existing paths
      expect(results).toHaveLength(1);
      expect(results[0].path).toBe('README.md');
    });
  });

  describe('Edge Cases', () => {
    it('should handle files with special characters in names', async () => {
      // Setup
      fs.writeFileSync(path.join(testWorkspace, 'file with spaces.md'), '# Test');
      fs.writeFileSync(path.join(testWorkspace, 'file-with-dashes.md'), '# Test');
      fs.writeFileSync(path.join(testWorkspace, 'file_with_underscores.md'), '# Test');
      
      // Execute
      const scanner = new Scanner(defaultConfig);
      const results = await scanner.scan(testWorkspace);
      
      // Verify
      expect(results).toHaveLength(3);
    });

    it('should handle deeply nested directories', async () => {
      // Setup - create deep nesting
      let currentPath = testWorkspace;
      for (let i = 0; i < 10; i++) {
        currentPath = path.join(currentPath, `level${i}`);
        fs.mkdirSync(currentPath);
      }
      fs.writeFileSync(path.join(currentPath, 'deep.md'), '# Deep');
      
      // Execute
      const scanner = new Scanner(defaultConfig);
      const results = await scanner.scan(testWorkspace);
      
      // Verify
      expect(results).toHaveLength(1);
      expect(results[0].path).toContain('deep.md');
    });

    it('should handle empty directories', async () => {
      // Setup
      fs.mkdirSync(path.join(testWorkspace, 'empty1'));
      fs.mkdirSync(path.join(testWorkspace, 'empty2'));
      
      // Execute
      const scanner = new Scanner(defaultConfig);
      const results = await scanner.scan(testWorkspace);
      
      // Verify
      expect(results).toHaveLength(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle permission errors gracefully', async () => {
      // This test is platform-dependent and may not work on all systems
      // Skip on Windows where permission handling is different
      if (process.platform === 'win32') {
        return;
      }

      // Setup
      const restrictedDir = path.join(testWorkspace, 'restricted');
      fs.mkdirSync(restrictedDir);
      fs.writeFileSync(path.join(restrictedDir, 'file.md'), '# Test');
      fs.chmodSync(restrictedDir, 0o000); // Remove all permissions
      
      fs.writeFileSync(path.join(testWorkspace, 'accessible.md'), '# Accessible');
      
      try {
        // Execute
        const scanner = new Scanner(defaultConfig);
        const results = await scanner.scan(testWorkspace);
        
        // Verify - should continue and find accessible files
        expect(results.length).toBeGreaterThanOrEqual(1);
        expect(results.some(d => d.path === 'accessible.md')).toBe(true);
      } finally {
        // Cleanup - restore permissions
        fs.chmodSync(restrictedDir, 0o755);
      }
    });
  });
});
