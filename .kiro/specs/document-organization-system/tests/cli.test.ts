/**
 * Unit tests for CLI entry point
 * 
 * Tests parameter parsing, configuration merging, and validation
 * 
 * Requirements:
 * - 11.2: Accept workspace path as a parameter
 * - 11.3: Accept configuration options through skill parameters
 */

import { describe, it, expect } from 'vitest';
import { parseArguments, mergeConfiguration, validateParameters } from '../src/cli.js';
import { ConfigManager } from '../src/config.js';

describe('CLI Parameter Parsing', () => {
  describe('parseArguments', () => {
    it('should parse workspace path from positional argument', () => {
      const args = ['/path/to/workspace'];
      const params = parseArguments(args);
      
      expect(params.workspacePath).toBe('/path/to/workspace');
    });
    
    it('should parse workspace path from --workspace-path flag', () => {
      const args = ['--workspace-path', '/path/to/workspace'];
      const params = parseArguments(args);
      
      expect(params.workspacePath).toBe('/path/to/workspace');
    });
    
    it('should parse workspace path from -w flag', () => {
      const args = ['-w', '/path/to/workspace'];
      const params = parseArguments(args);
      
      expect(params.workspacePath).toBe('/path/to/workspace');
    });
    
    it('should parse config path from --config-path flag', () => {
      const args = ['--config-path', './config.json'];
      const params = parseArguments(args);
      
      expect(params.configPath).toBe('./config.json');
    });
    
    it('should parse include paths from --include-paths flag', () => {
      const args = ['--include-paths', '.kiro,.agent,docs'];
      const params = parseArguments(args);
      
      expect(params.includePaths).toEqual(['.kiro', '.agent', 'docs']);
    });
    
    it('should parse exclude paths from --exclude-paths flag', () => {
      const args = ['--exclude-paths', 'node_modules,.git'];
      const params = parseArguments(args);
      
      expect(params.excludePaths).toEqual(['node_modules', '.git']);
    });
    
    it('should parse file extensions from --file-extensions flag', () => {
      const args = ['--file-extensions', '.md,.txt,.rst'];
      const params = parseArguments(args);
      
      expect(params.fileExtensions).toEqual(['.md', '.txt', '.rst']);
    });
    
    it('should add dot prefix to file extensions if missing', () => {
      const args = ['--file-extensions', 'md,txt'];
      const params = parseArguments(args);
      
      expect(params.fileExtensions).toEqual(['.md', '.txt']);
    });
    
    it('should parse output path from --output-path flag', () => {
      const args = ['--output-path', 'my-report.md'];
      const params = parseArguments(args);
      
      expect(params.outputPath).toBe('my-report.md');
    });
    
    it('should parse verbose flag', () => {
      const args = ['--verbose'];
      const params = parseArguments(args);
      
      expect(params.verbose).toBe(true);
    });
    
    it('should parse multiple flags together', () => {
      const args = [
        '--workspace-path', '/path/to/workspace',
        '--include-paths', '.kiro,docs',
        '--output-path', 'report.md',
        '--verbose'
      ];
      const params = parseArguments(args);
      
      expect(params.workspacePath).toBe('/path/to/workspace');
      expect(params.includePaths).toEqual(['.kiro', 'docs']);
      expect(params.outputPath).toBe('report.md');
      expect(params.verbose).toBe(true);
    });
    
    it('should handle short flags', () => {
      const args = [
        '-w', '/path/to/workspace',
        '-i', '.kiro',
        '-o', 'report.md',
        '-v'
      ];
      const params = parseArguments(args);
      
      expect(params.workspacePath).toBe('/path/to/workspace');
      expect(params.includePaths).toEqual(['.kiro']);
      expect(params.outputPath).toBe('report.md');
      expect(params.verbose).toBe(true);
    });
  });
  
  describe('mergeConfiguration', () => {
    it('should use defaults when no parameters provided', () => {
      const params = {};
      const config = mergeConfiguration(params);
      const defaults = ConfigManager.getDefaults();
      
      expect(config).toEqual(defaults);
    });
    
    it('should override include paths from parameters', () => {
      const params = {
        includePaths: ['.kiro', 'docs']
      };
      const config = mergeConfiguration(params);
      
      expect(config.scanner.includePaths).toEqual(['.kiro', 'docs']);
    });
    
    it('should override exclude paths from parameters', () => {
      const params = {
        excludePaths: ['node_modules', '.git', 'custom']
      };
      const config = mergeConfiguration(params);
      
      expect(config.scanner.excludePaths).toEqual(['node_modules', '.git', 'custom']);
    });
    
    it('should override file extensions from parameters', () => {
      const params = {
        fileExtensions: ['.md', '.rst']
      };
      const config = mergeConfiguration(params);
      
      expect(config.scanner.fileExtensions).toEqual(['.md', '.rst']);
    });
    
    it('should override output path from parameters', () => {
      const params = {
        outputPath: 'custom-report.md'
      };
      const config = mergeConfiguration(params);
      
      expect(config.output.outputPath).toBe('custom-report.md');
    });
    
    it('should merge inline config with defaults', () => {
      const params = {
        config: {
          scanner: {
            includePaths: ['.custom'],
            excludePaths: ['exclude'],
            fileExtensions: ['.md']
          }
        }
      };
      const config = mergeConfiguration(params);
      
      expect(config.scanner.includePaths).toEqual(['.custom']);
      expect(config.scanner.excludePaths).toEqual(['exclude']);
      expect(config.scanner.fileExtensions).toEqual(['.md']);
    });
    
    it('should prioritize individual parameters over inline config', () => {
      const params = {
        config: {
          scanner: {
            includePaths: ['.config']
          }
        },
        includePaths: ['.param']
      };
      const config = mergeConfiguration(params);
      
      // Individual parameter should win
      expect(config.scanner.includePaths).toEqual(['.param']);
    });
  });
  
  describe('validateParameters', () => {
    it('should throw error if workspace path is missing', () => {
      const params = {};
      
      expect(() => validateParameters(params)).toThrow('Workspace path is required');
    });
    
    it('should throw error if workspace path does not exist', () => {
      const params = {
        workspacePath: '/nonexistent/path/that/does/not/exist'
      };
      
      expect(() => validateParameters(params)).toThrow('Workspace path does not exist');
    });
    
    it('should throw error if workspace path is not a directory', () => {
      const params = {
        workspacePath: './package.json' // This is a file, not a directory
      };
      
      expect(() => validateParameters(params)).toThrow('Workspace path is not a directory');
    });
    
    it('should not throw error for valid workspace path', () => {
      const params = {
        workspacePath: '.' // Current directory should exist
      };
      
      expect(() => validateParameters(params)).not.toThrow();
    });
  });
});

describe('CLI Integration', () => {
  it('should handle complete parameter flow', () => {
    // Parse arguments
    const args = [
      '--workspace-path', '.',
      '--include-paths', '.kiro,docs',
      '--output-path', 'test-report.md',
      '--verbose'
    ];
    const params = parseArguments(args);
    
    // Validate parameters
    expect(() => validateParameters(params)).not.toThrow();
    
    // Merge configuration
    const config = mergeConfiguration(params);
    
    // Verify final configuration
    expect(config.scanner.includePaths).toEqual(['.kiro', 'docs']);
    expect(config.output.outputPath).toBe('test-report.md');
  });
  
  it('should handle JSON-style parameters', () => {
    // Simulate JSON input from stdin
    const jsonParams = {
      workspacePath: '.',
      includePaths: ['.kiro', 'docs'],
      outputPath: 'json-report.md',
      verbose: true
    };
    
    // Validate
    expect(() => validateParameters(jsonParams)).not.toThrow();
    
    // Merge configuration
    const config = mergeConfiguration(jsonParams);
    
    // Verify
    expect(config.scanner.includePaths).toEqual(['.kiro', 'docs']);
    expect(config.output.outputPath).toBe('json-report.md');
  });
});
