/**
 * Unit tests for ConfigManager
 * 
 * Tests:
 * - Loading default configuration
 * - Loading configuration from file
 * - Handling missing files
 * - Handling invalid JSON
 * - Validating configuration values
 * - Merging partial configurations with defaults
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigManager } from '../src/config.js';
import { SystemConfig } from '../src/types.js';

describe('ConfigManager', () => {
  const testConfigDir = path.join(process.cwd(), 'tests', 'test-configs');
  
  beforeEach(() => {
    // Create test config directory
    if (!fs.existsSync(testConfigDir)) {
      fs.mkdirSync(testConfigDir, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up test config files
    if (fs.existsSync(testConfigDir)) {
      const files = fs.readdirSync(testConfigDir);
      files.forEach(file => {
        fs.unlinkSync(path.join(testConfigDir, file));
      });
      fs.rmdirSync(testConfigDir);
    }
  });

  describe('getDefaults', () => {
    it('should return default configuration', () => {
      const config = ConfigManager.getDefaults();

      expect(config).toBeDefined();
      expect(config.scanner).toBeDefined();
      expect(config.evaluator).toBeDefined();
      expect(config.output).toBeDefined();
    });

    it('should return a copy, not the original', () => {
      const config1 = ConfigManager.getDefaults();
      const config2 = ConfigManager.getDefaults();

      // Modify config1
      config1.scanner.includePaths.push('test');

      // config2 should not be affected
      expect(config2.scanner.includePaths).not.toContain('test');
    });

    it('should have valid default values', () => {
      const config = ConfigManager.getDefaults();

      // Scanner defaults
      expect(config.scanner.includePaths).toContain('.kiro');
      expect(config.scanner.excludePaths).toContain('node_modules');
      expect(config.scanner.fileExtensions).toContain('.md');

      // Evaluator defaults
      expect(config.evaluator.weights.referenceCount).toBeGreaterThan(0);
      expect(config.evaluator.thresholds.necessary).toBeGreaterThan(config.evaluator.thresholds.unnecessary);

      // Output defaults
      expect(config.output.outputPath).toBe('DOCUMENT_ORGANIZATION_REPORT.md');
      expect(config.output.includeMetadata).toBe(true);
    });
  });

  describe('load', () => {
    it('should return defaults when no config path provided', () => {
      const config = ConfigManager.load();
      const defaults = ConfigManager.getDefaults();

      expect(config).toEqual(defaults);
    });

    it('should return defaults when config file does not exist', () => {
      const nonExistentPath = path.join(testConfigDir, 'nonexistent.json');
      const config = ConfigManager.load(nonExistentPath);
      const defaults = ConfigManager.getDefaults();

      expect(config).toEqual(defaults);
    });

    it('should load valid configuration from file', () => {
      const testConfig: SystemConfig = {
        scanner: {
          includePaths: ['custom-path'],
          excludePaths: ['custom-exclude'],
          fileExtensions: ['.txt'],
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
          includeMetadata: false,
          includeReasoningDetails: false,
        },
      };

      const configPath = path.join(testConfigDir, 'valid-config.json');
      fs.writeFileSync(configPath, JSON.stringify(testConfig, null, 2));

      const loadedConfig = ConfigManager.load(configPath);

      expect(loadedConfig.scanner.includePaths).toEqual(['custom-path']);
      expect(loadedConfig.evaluator.weights.referenceCount).toBe(0.5);
      expect(loadedConfig.output.outputPath).toBe('CUSTOM_REPORT.md');
    });

    it('should merge partial configuration with defaults', () => {
      const partialConfig = {
        scanner: {
          includePaths: ['custom-path'],
        },
        evaluator: {
          weights: {
            referenceCount: 0.5,
            recency: 0.3,
            size: 0.1,
            category: 0.1,
          },
        },
      };

      const configPath = path.join(testConfigDir, 'partial-config.json');
      fs.writeFileSync(configPath, JSON.stringify(partialConfig, null, 2));

      const loadedConfig = ConfigManager.load(configPath);
      const defaults = ConfigManager.getDefaults();

      // Custom values should be used
      expect(loadedConfig.scanner.includePaths).toEqual(['custom-path']);
      expect(loadedConfig.evaluator.weights.referenceCount).toBe(0.5);

      // Missing values should use defaults
      expect(loadedConfig.scanner.excludePaths).toEqual(defaults.scanner.excludePaths);
      expect(loadedConfig.scanner.fileExtensions).toEqual(defaults.scanner.fileExtensions);
      expect(loadedConfig.output).toEqual(defaults.output);
    });

    it('should return defaults when JSON is invalid', () => {
      const configPath = path.join(testConfigDir, 'invalid-json.json');
      fs.writeFileSync(configPath, '{ invalid json }');

      const config = ConfigManager.load(configPath);
      const defaults = ConfigManager.getDefaults();

      expect(config).toEqual(defaults);
    });

    it('should return defaults when configuration is invalid', () => {
      const invalidConfig = {
        scanner: {
          includePaths: [], // Empty array - invalid
          excludePaths: ['node_modules'],
          fileExtensions: ['.md'],
        },
        evaluator: {
          weights: {
            referenceCount: 0.4,
            recency: 0.3,
            size: 0.1,
            category: 0.2,
          },
          thresholds: {
            necessary: 60,
            unnecessary: 30,
          },
        },
        output: {
          outputPath: 'REPORT.md',
          includeMetadata: true,
          includeReasoningDetails: true,
        },
      };

      const configPath = path.join(testConfigDir, 'invalid-config.json');
      fs.writeFileSync(configPath, JSON.stringify(invalidConfig, null, 2));

      const config = ConfigManager.load(configPath);
      const defaults = ConfigManager.getDefaults();

      expect(config).toEqual(defaults);
    });
  });

  describe('validation', () => {
    it('should reject config with empty includePaths', () => {
      const invalidConfig = {
        scanner: {
          includePaths: [],
          excludePaths: ['node_modules'],
          fileExtensions: ['.md'],
        },
        evaluator: {
          weights: {
            referenceCount: 0.4,
            recency: 0.3,
            size: 0.1,
            category: 0.2,
          },
          thresholds: {
            necessary: 60,
            unnecessary: 30,
          },
        },
        output: {
          outputPath: 'REPORT.md',
          includeMetadata: true,
          includeReasoningDetails: true,
        },
      };

      const configPath = path.join(testConfigDir, 'empty-includes.json');
      fs.writeFileSync(configPath, JSON.stringify(invalidConfig, null, 2));

      const config = ConfigManager.load(configPath);
      const defaults = ConfigManager.getDefaults();

      expect(config).toEqual(defaults);
    });

    it('should reject config with weights not summing to 1.0', () => {
      const invalidConfig = {
        scanner: {
          includePaths: ['.kiro'],
          excludePaths: ['node_modules'],
          fileExtensions: ['.md'],
        },
        evaluator: {
          weights: {
            referenceCount: 0.5,
            recency: 0.3,
            size: 0.1,
            category: 0.3, // Sum = 1.2, not 1.0
          },
          thresholds: {
            necessary: 60,
            unnecessary: 30,
          },
        },
        output: {
          outputPath: 'REPORT.md',
          includeMetadata: true,
          includeReasoningDetails: true,
        },
      };

      const configPath = path.join(testConfigDir, 'invalid-weights.json');
      fs.writeFileSync(configPath, JSON.stringify(invalidConfig, null, 2));

      const config = ConfigManager.load(configPath);
      const defaults = ConfigManager.getDefaults();

      expect(config).toEqual(defaults);
    });

    it('should reject config with invalid thresholds', () => {
      const invalidConfig = {
        scanner: {
          includePaths: ['.kiro'],
          excludePaths: ['node_modules'],
          fileExtensions: ['.md'],
        },
        evaluator: {
          weights: {
            referenceCount: 0.4,
            recency: 0.3,
            size: 0.1,
            category: 0.2,
          },
          thresholds: {
            necessary: 30, // Less than unnecessary - invalid
            unnecessary: 60,
          },
        },
        output: {
          outputPath: 'REPORT.md',
          includeMetadata: true,
          includeReasoningDetails: true,
        },
      };

      const configPath = path.join(testConfigDir, 'invalid-thresholds.json');
      fs.writeFileSync(configPath, JSON.stringify(invalidConfig, null, 2));

      const config = ConfigManager.load(configPath);
      const defaults = ConfigManager.getDefaults();

      expect(config).toEqual(defaults);
    });

    it('should reject config with empty outputPath', () => {
      const invalidConfig = {
        scanner: {
          includePaths: ['.kiro'],
          excludePaths: ['node_modules'],
          fileExtensions: ['.md'],
        },
        evaluator: {
          weights: {
            referenceCount: 0.4,
            recency: 0.3,
            size: 0.1,
            category: 0.2,
          },
          thresholds: {
            necessary: 60,
            unnecessary: 30,
          },
        },
        output: {
          outputPath: '', // Empty string - invalid
          includeMetadata: true,
          includeReasoningDetails: true,
        },
      };

      const configPath = path.join(testConfigDir, 'empty-output.json');
      fs.writeFileSync(configPath, JSON.stringify(invalidConfig, null, 2));

      const config = ConfigManager.load(configPath);
      const defaults = ConfigManager.getDefaults();

      expect(config).toEqual(defaults);
    });

    it('should reject config with negative weights', () => {
      const invalidConfig = {
        scanner: {
          includePaths: ['.kiro'],
          excludePaths: ['node_modules'],
          fileExtensions: ['.md'],
        },
        evaluator: {
          weights: {
            referenceCount: -0.1, // Negative - invalid
            recency: 0.5,
            size: 0.3,
            category: 0.3,
          },
          thresholds: {
            necessary: 60,
            unnecessary: 30,
          },
        },
        output: {
          outputPath: 'REPORT.md',
          includeMetadata: true,
          includeReasoningDetails: true,
        },
      };

      const configPath = path.join(testConfigDir, 'negative-weights.json');
      fs.writeFileSync(configPath, JSON.stringify(invalidConfig, null, 2));

      const config = ConfigManager.load(configPath);
      const defaults = ConfigManager.getDefaults();

      expect(config).toEqual(defaults);
    });

    it('should reject config with thresholds out of range', () => {
      const invalidConfig = {
        scanner: {
          includePaths: ['.kiro'],
          excludePaths: ['node_modules'],
          fileExtensions: ['.md'],
        },
        evaluator: {
          weights: {
            referenceCount: 0.4,
            recency: 0.3,
            size: 0.1,
            category: 0.2,
          },
          thresholds: {
            necessary: 150, // > 100 - invalid
            unnecessary: 30,
          },
        },
        output: {
          outputPath: 'REPORT.md',
          includeMetadata: true,
          includeReasoningDetails: true,
        },
      };

      const configPath = path.join(testConfigDir, 'threshold-out-of-range.json');
      fs.writeFileSync(configPath, JSON.stringify(invalidConfig, null, 2));

      const config = ConfigManager.load(configPath);
      const defaults = ConfigManager.getDefaults();

      expect(config).toEqual(defaults);
    });
  });

  describe('edge cases', () => {
    it('should handle config with extra fields', () => {
      const configWithExtra = {
        scanner: {
          includePaths: ['custom'],
          excludePaths: ['exclude'],
          fileExtensions: ['.md'],
          extraField: 'should be ignored',
        },
        evaluator: {
          weights: {
            referenceCount: 0.4,
            recency: 0.3,
            size: 0.1,
            category: 0.2,
          },
          thresholds: {
            necessary: 60,
            unnecessary: 30,
          },
        },
        output: {
          outputPath: 'REPORT.md',
          includeMetadata: true,
          includeReasoningDetails: true,
        },
        extraTopLevel: 'also ignored',
      };

      const configPath = path.join(testConfigDir, 'extra-fields.json');
      fs.writeFileSync(configPath, JSON.stringify(configWithExtra, null, 2));

      const config = ConfigManager.load(configPath);

      // Should load successfully, ignoring extra fields
      expect(config.scanner.includePaths).toEqual(['custom']);
    });

    it('should handle file read permission errors', () => {
      const configPath = path.join(testConfigDir, 'unreadable.json');
      fs.writeFileSync(configPath, JSON.stringify(ConfigManager.getDefaults(), null, 2));
      
      // Make file unreadable (this might not work on all systems)
      try {
        fs.chmodSync(configPath, 0o000);
        
        const config = ConfigManager.load(configPath);
        const defaults = ConfigManager.getDefaults();

        expect(config).toEqual(defaults);
        
        // Restore permissions for cleanup
        fs.chmodSync(configPath, 0o644);
      } catch (error) {
        // Skip test if chmod is not supported
        console.log('Skipping permission test - not supported on this system');
      }
    });

    it('should accept weights that sum to 1.0 with floating point precision', () => {
      const config = {
        scanner: {
          includePaths: ['.kiro'],
          excludePaths: ['node_modules'],
          fileExtensions: ['.md'],
        },
        evaluator: {
          weights: {
            referenceCount: 0.33333333,
            recency: 0.33333333,
            size: 0.16666667,
            category: 0.16666667, // Sum is very close to 1.0
          },
          thresholds: {
            necessary: 60,
            unnecessary: 30,
          },
        },
        output: {
          outputPath: 'REPORT.md',
          includeMetadata: true,
          includeReasoningDetails: true,
        },
      };

      const configPath = path.join(testConfigDir, 'floating-point.json');
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

      const loadedConfig = ConfigManager.load(configPath);

      // Should load successfully despite floating point imprecision
      expect(loadedConfig.evaluator.weights.referenceCount).toBeCloseTo(0.33333333);
    });
  });
});
