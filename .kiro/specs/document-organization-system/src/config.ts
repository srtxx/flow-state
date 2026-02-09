/**
 * Configuration Manager for the Document Organization System
 * 
 * Responsibilities:
 * - Load configuration from JSON files
 * - Provide default configuration
 * - Validate configuration values
 * 
 * Requirements: 9.3, 9.4, 9.5
 */

import * as fs from 'fs';
import { SystemConfig, ScannerConfig, EvaluatorConfig, OutputConfig } from './types.js';

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: SystemConfig = {
  scanner: {
    includePaths: ['.agent', '.kiro', 'backlog', 'docs'],
    excludePaths: ['node_modules', '.git', 'dist', 'build', '.vercel', '.npm-cache'],
    fileExtensions: ['.md', '.txt'],
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
    outputPath: 'DOCUMENT_ORGANIZATION_REPORT.md',
    includeMetadata: true,
    includeReasoningDetails: true,
  },
};

/**
 * Configuration Manager
 * 
 * Handles loading, validation, and management of system configuration
 */
export class ConfigManager {
  /**
   * Load configuration from a file or use defaults
   * 
   * @param configPath - Optional path to configuration file
   * @returns System configuration
   * 
   * If configPath is provided and the file exists, loads configuration from the file.
   * If the file doesn't exist or is invalid, returns default configuration.
   * If configPath is not provided, returns default configuration.
   */
  static load(configPath?: string): SystemConfig {
    // If no config path provided, return defaults
    if (!configPath) {
      return ConfigManager.getDefaults();
    }

    try {
      // Check if file exists
      if (!fs.existsSync(configPath)) {
        console.warn(`Configuration file not found: ${configPath}. Using defaults.`);
        return ConfigManager.getDefaults();
      }

      // Read and parse the configuration file
      const fileContent = fs.readFileSync(configPath, 'utf-8');
      const parsedConfig = JSON.parse(fileContent);

      // Merge with defaults to ensure all required fields are present
      const config = ConfigManager.mergeWithDefaults(parsedConfig);

      // Validate the configuration
      if (!ConfigManager.validate(config)) {
        console.error('Invalid configuration. Using defaults.');
        return ConfigManager.getDefaults();
      }

      return config;
    } catch (error) {
      // Handle any errors (file read errors, JSON parse errors, etc.)
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error loading configuration: ${errorMessage}. Using defaults.`);
      return ConfigManager.getDefaults();
    }
  }

  /**
   * Get default configuration
   * 
   * @returns Default system configuration
   */
  static getDefaults(): SystemConfig {
    // Return a deep copy to prevent modifications to the default
    return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
  }

  /**
   * Validate configuration
   * 
   * @param config - Configuration to validate
   * @returns True if configuration is valid, false otherwise
   * 
   * Validates:
   * - All required fields are present
   * - Weights sum to approximately 1.0
   * - Thresholds are in valid range (0-100)
   * - Arrays are not empty where required
   */
  private static validate(config: SystemConfig): boolean {
    try {
      // Validate scanner config
      if (!ConfigManager.validateScannerConfig(config.scanner)) {
        return false;
      }

      // Validate evaluator config
      if (!ConfigManager.validateEvaluatorConfig(config.evaluator)) {
        return false;
      }

      // Validate output config
      if (!ConfigManager.validateOutputConfig(config.output)) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Validation error:', error);
      return false;
    }
  }

  /**
   * Validate scanner configuration
   */
  private static validateScannerConfig(scanner: ScannerConfig): boolean {
    // Check required fields exist
    if (!scanner.includePaths || !scanner.excludePaths || !scanner.fileExtensions) {
      console.error('Scanner config missing required fields');
      return false;
    }

    // Check arrays are actually arrays
    if (!Array.isArray(scanner.includePaths) || 
        !Array.isArray(scanner.excludePaths) || 
        !Array.isArray(scanner.fileExtensions)) {
      console.error('Scanner config fields must be arrays');
      return false;
    }

    // Check includePaths is not empty
    if (scanner.includePaths.length === 0) {
      console.error('Scanner config must have at least one include path');
      return false;
    }

    // Check fileExtensions is not empty
    if (scanner.fileExtensions.length === 0) {
      console.error('Scanner config must have at least one file extension');
      return false;
    }

    return true;
  }

  /**
   * Validate evaluator configuration
   */
  private static validateEvaluatorConfig(evaluator: EvaluatorConfig): boolean {
    // Check required fields exist
    if (!evaluator.weights || !evaluator.thresholds) {
      console.error('Evaluator config missing required fields');
      return false;
    }

    // Check all weight fields exist
    const { referenceCount, recency, size, category } = evaluator.weights;
    if (referenceCount === undefined || recency === undefined || 
        size === undefined || category === undefined) {
      console.error('Evaluator weights missing required fields');
      return false;
    }

    // Check weights are numbers and non-negative
    if (typeof referenceCount !== 'number' || referenceCount < 0 ||
        typeof recency !== 'number' || recency < 0 ||
        typeof size !== 'number' || size < 0 ||
        typeof category !== 'number' || category < 0) {
      console.error('Evaluator weights must be non-negative numbers');
      return false;
    }

    // Check weights sum to approximately 1.0 (allow small floating point errors)
    const weightSum = referenceCount + recency + size + category;
    if (Math.abs(weightSum - 1.0) > 0.01) {
      console.error(`Evaluator weights must sum to 1.0 (got ${weightSum})`);
      return false;
    }

    // Check threshold fields exist
    const { necessary, unnecessary } = evaluator.thresholds;
    if (necessary === undefined || unnecessary === undefined) {
      console.error('Evaluator thresholds missing required fields');
      return false;
    }

    // Check thresholds are numbers in valid range
    if (typeof necessary !== 'number' || necessary < 0 || necessary > 100 ||
        typeof unnecessary !== 'number' || unnecessary < 0 || unnecessary > 100) {
      console.error('Evaluator thresholds must be numbers between 0 and 100');
      return false;
    }

    // Check that necessary threshold is greater than unnecessary threshold
    if (necessary <= unnecessary) {
      console.error('Necessary threshold must be greater than unnecessary threshold');
      return false;
    }

    return true;
  }

  /**
   * Validate output configuration
   */
  private static validateOutputConfig(output: OutputConfig): boolean {
    // Check required fields exist
    if (!output.outputPath) {
      console.error('Output config missing outputPath');
      return false;
    }

    // Check outputPath is a string
    if (typeof output.outputPath !== 'string' || output.outputPath.trim() === '') {
      console.error('Output path must be a non-empty string');
      return false;
    }

    // Check boolean flags
    if (typeof output.includeMetadata !== 'boolean' ||
        typeof output.includeReasoningDetails !== 'boolean') {
      console.error('Output config boolean flags must be booleans');
      return false;
    }

    return true;
  }

  /**
   * Merge partial configuration with defaults
   * 
   * @param partial - Partial configuration from file
   * @returns Complete configuration with defaults filled in
   */
  private static mergeWithDefaults(partial: any): SystemConfig {
    const defaults = ConfigManager.getDefaults();

    return {
      scanner: {
        includePaths: partial.scanner?.includePaths ?? defaults.scanner.includePaths,
        excludePaths: partial.scanner?.excludePaths ?? defaults.scanner.excludePaths,
        fileExtensions: partial.scanner?.fileExtensions ?? defaults.scanner.fileExtensions,
      },
      evaluator: {
        weights: {
          referenceCount: partial.evaluator?.weights?.referenceCount ?? defaults.evaluator.weights.referenceCount,
          recency: partial.evaluator?.weights?.recency ?? defaults.evaluator.weights.recency,
          size: partial.evaluator?.weights?.size ?? defaults.evaluator.weights.size,
          category: partial.evaluator?.weights?.category ?? defaults.evaluator.weights.category,
        },
        thresholds: {
          necessary: partial.evaluator?.thresholds?.necessary ?? defaults.evaluator.thresholds.necessary,
          unnecessary: partial.evaluator?.thresholds?.unnecessary ?? defaults.evaluator.thresholds.unnecessary,
        },
      },
      output: {
        outputPath: partial.output?.outputPath ?? defaults.output.outputPath,
        includeMetadata: partial.output?.includeMetadata ?? defaults.output.includeMetadata,
        includeReasoningDetails: partial.output?.includeReasoningDetails ?? defaults.output.includeReasoningDetails,
      },
    };
  }
}
