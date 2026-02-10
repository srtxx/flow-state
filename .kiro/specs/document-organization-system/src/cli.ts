#!/usr/bin/env node
/**
 * CLI Entry Point for Document Organization System
 * 
 * This module provides the command-line interface for the Document Organization System
 * when invoked as a Kiro Skill. It handles parameter parsing, configuration loading,
 * and execution of the main orchestrator.
 * 
 * Requirements:
 * - 11.2: Accept workspace path as a parameter
 * - 11.3: Accept configuration options through skill parameters
 */

import * as path from 'path';
import * as fs from 'fs';
import { runDocumentOrganization } from './index.js';
import { ConfigManager } from './config.js';
import { SystemConfig } from './types.js';

/**
 * Skill parameters that can be passed from Kiro
 */
interface SkillParameters {
  /** Workspace path to analyze (required) */
  workspacePath?: string;
  /** Path to custom configuration file (optional) */
  configPath?: string;
  /** Inline configuration options (optional) */
  config?: Partial<SystemConfig>;
  /** Paths to include in scan (optional, overrides config) */
  includePaths?: string[];
  /** Paths to exclude from scan (optional, overrides config) */
  excludePaths?: string[];
  /** File extensions to include (optional, overrides config) */
  fileExtensions?: string[];
  /** Output path for report (optional, overrides config) */
  outputPath?: string;
  /** Whether to include verbose output */
  verbose?: boolean;
}

/**
 * Parse command-line arguments into skill parameters
 * 
 * Supports the following argument formats:
 * - --workspace-path <path>
 * - --config-path <path>
 * - --include-paths <path1,path2,...>
 * - --exclude-paths <path1,path2,...>
 * - --file-extensions <.ext1,.ext2,...>
 * - --output-path <path>
 * - --verbose
 * 
 * @param args - Command-line arguments (typically process.argv.slice(2))
 * @returns Parsed skill parameters
 */
function parseArguments(args: string[]): SkillParameters {
  const params: SkillParameters = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];
    
    switch (arg) {
      case '--workspace-path':
      case '-w':
        if (nextArg) {
          params.workspacePath = nextArg;
          i++;
        }
        break;
        
      case '--config-path':
      case '-c':
        if (nextArg) {
          params.configPath = nextArg;
          i++;
        }
        break;
        
      case '--include-paths':
      case '-i':
        if (nextArg) {
          params.includePaths = nextArg.split(',').map(p => p.trim());
          i++;
        }
        break;
        
      case '--exclude-paths':
      case '-e':
        if (nextArg) {
          params.excludePaths = nextArg.split(',').map(p => p.trim());
          i++;
        }
        break;
        
      case '--file-extensions':
      case '-f':
        if (nextArg) {
          params.fileExtensions = nextArg.split(',').map(ext => {
            const trimmed = ext.trim();
            return trimmed.startsWith('.') ? trimmed : `.${trimmed}`;
          });
          i++;
        }
        break;
        
      case '--output-path':
      case '-o':
        if (nextArg) {
          params.outputPath = nextArg;
          i++;
        }
        break;
        
      case '--verbose':
      case '-v':
        params.verbose = true;
        break;
        
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
        break;
        
      default:
        // If it doesn't start with -, treat it as workspace path
        if (!arg.startsWith('-') && !params.workspacePath) {
          params.workspacePath = arg;
        }
    }
  }
  
  return params;
}

/**
 * Parse JSON parameters from stdin
 * This is used when Kiro invokes the skill with JSON parameters
 * 
 * @returns Promise resolving to parsed skill parameters
 */
async function parseJsonParameters(): Promise<SkillParameters> {
  return new Promise((resolve, reject) => {
    let data = '';
    
    process.stdin.on('data', chunk => {
      data += chunk;
    });
    
    process.stdin.on('end', () => {
      try {
        if (data.trim()) {
          const params = JSON.parse(data);
          resolve(params);
        } else {
          resolve({});
        }
      } catch (error) {
        reject(new Error(`Failed to parse JSON parameters: ${error}`));
      }
    });
    
    process.stdin.on('error', error => {
      reject(error);
    });
  });
}

/**
 * Merge configuration from multiple sources
 * Priority (highest to lowest):
 * 1. Inline parameters (from command line or JSON)
 * 2. Custom config file (if specified)
 * 3. Default config
 * 
 * @param params - Skill parameters
 * @returns Merged system configuration
 */
function mergeConfiguration(params: SkillParameters): SystemConfig {
  // Start with defaults
  let config: SystemConfig = ConfigManager.getDefaults();
  
  // Load custom config file if specified
  if (params.configPath) {
    try {
      config = ConfigManager.load(params.configPath);
    } catch (error) {
      console.warn(`Warning: Failed to load config from ${params.configPath}, using defaults`);
      console.warn(`Error: ${error}`);
    }
  }
  
  // Apply inline configuration overrides
  if (params.config) {
    config = {
      ...config,
      ...params.config,
      scanner: {
        ...config.scanner,
        ...(params.config.scanner || {}),
      },
      evaluator: {
        ...config.evaluator,
        ...(params.config.evaluator || {}),
      },
      output: {
        ...config.output,
        ...(params.config.output || {}),
      },
    };
  }
  
  // Apply individual parameter overrides
  if (params.includePaths) {
    config.scanner.includePaths = params.includePaths;
  }
  
  if (params.excludePaths) {
    config.scanner.excludePaths = params.excludePaths;
  }
  
  if (params.fileExtensions) {
    config.scanner.fileExtensions = params.fileExtensions;
  }
  
  if (params.outputPath) {
    config.output.outputPath = params.outputPath;
  }
  
  return config;
}

/**
 * Validate skill parameters
 * 
 * @param params - Skill parameters to validate
 * @throws Error if validation fails
 */
function validateParameters(params: SkillParameters): void {
  // Workspace path is required
  if (!params.workspacePath) {
    throw new Error('Workspace path is required. Use --workspace-path <path> or provide it as the first argument.');
  }
  
  // Check if workspace path exists
  const workspacePath = path.resolve(params.workspacePath);
  if (!fs.existsSync(workspacePath)) {
    throw new Error(`Workspace path does not exist: ${workspacePath}`);
  }
  
  // Check if workspace path is a directory
  const stats = fs.statSync(workspacePath);
  if (!stats.isDirectory()) {
    throw new Error(`Workspace path is not a directory: ${workspacePath}`);
  }
}

/**
 * Print help message
 */
function printHelp(): void {
  console.log(`
Document Organization System - Kiro Skill

Usage:
  document-organization-system [options] [workspace-path]

Options:
  -w, --workspace-path <path>     Path to workspace to analyze (required)
  -c, --config-path <path>        Path to custom configuration file
  -i, --include-paths <paths>     Comma-separated list of paths to include
  -e, --exclude-paths <paths>     Comma-separated list of paths to exclude
  -f, --file-extensions <exts>    Comma-separated list of file extensions
  -o, --output-path <path>        Path for output report
  -v, --verbose                   Enable verbose output
  -h, --help                      Show this help message

Examples:
  # Analyze current directory with defaults
  document-organization-system .

  # Analyze specific workspace with custom config
  document-organization-system --workspace-path /path/to/workspace --config-path ./config.json

  # Analyze with custom include paths
  document-organization-system . --include-paths ".kiro,.agent,docs"

  # Analyze with custom output path
  document-organization-system . --output-path "my-report.md"

JSON Input (via stdin):
  The skill can also accept parameters as JSON via stdin:
  echo '{"workspacePath": ".", "includePaths": [".kiro", "docs"]}' | document-organization-system

Configuration:
  See SKILL.md for detailed configuration options and examples.
`);
}

/**
 * Main entry point for the CLI
 * 
 * This function:
 * 1. Parses parameters from command line or stdin
 * 2. Validates parameters
 * 3. Merges configuration from multiple sources
 * 4. Executes the document organization system
 * 5. Reports results
 * 
 * Requirements:
 * - 11.2: Accepts workspace path as parameter
 * - 11.3: Accepts configuration options through skill parameters
 */
async function main(): Promise<void> {
  try {
    let params: SkillParameters;
    
    // Check if stdin has data (JSON parameters from Kiro)
    if (!process.stdin.isTTY) {
      // Read JSON parameters from stdin
      params = await parseJsonParameters();
      
      // If no workspace path in JSON, check command line args
      if (!params.workspacePath && process.argv.length > 2) {
        const cliParams = parseArguments(process.argv.slice(2));
        params = { ...params, ...cliParams };
      }
    } else {
      // Parse command line arguments
      params = parseArguments(process.argv.slice(2));
    }
    
    // Validate parameters
    validateParameters(params);
    
    // Merge configuration
    const config = mergeConfiguration(params);
    
    // Resolve workspace path
    const workspacePath = path.resolve(params.workspacePath!);
    
    // Print configuration if verbose
    if (params.verbose) {
      console.log('=== Configuration ===');
      console.log(`Workspace: ${workspacePath}`);
      console.log(`Include paths: ${config.scanner.includePaths.join(', ')}`);
      console.log(`Exclude paths: ${config.scanner.excludePaths.join(', ')}`);
      console.log(`File extensions: ${config.scanner.fileExtensions.join(', ')}`);
      console.log(`Output path: ${config.output.outputPath}`);
      console.log('====================\n');
    }
    
    // Create progress callback
    const progressCallback = params.verbose
      ? (message: string, current: number, total: number) => {
          const percentage = Math.round((current / total) * 100);
          console.log(`[${percentage}%] ${message}`);
        }
      : undefined;
    
    // Run document organization
    console.log('Starting document organization...\n');
    
    const result = await runDocumentOrganization(
      workspacePath,
      params.configPath,
      progressCallback
    );
    
    // Report results
    if (result.success) {
      console.log('\n✓ Document organization completed successfully!');
      console.log(`\nReport saved to: ${result.reportPath}`);
      
      // Print summary
      console.log('\n=== Summary ===');
      console.log(`Total documents: ${result.report.summary.totalDocuments}`);
      console.log(`Necessary: ${result.report.summary.necessaryCount}`);
      console.log(`Needs review: ${result.report.summary.needsReviewCount}`);
      console.log(`Unnecessary: ${result.report.summary.unnecessaryCount}`);
      console.log(`Duplicates: ${result.report.summary.duplicatesFound}`);
      
      if (result.report.errors.length > 0) {
        console.log(`\n⚠ Errors encountered: ${result.report.errors.length}`);
        console.log('See report for details.');
      }
      
      process.exit(0);
    } else {
      console.error('\n✗ Document organization failed!');
      if (result.errorMessage) {
        console.error(`Error: ${result.errorMessage}`);
      }
      if (result.reportPath) {
        console.error(`\nPartial report saved to: ${result.reportPath}`);
      }
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n✗ Error:', error instanceof Error ? error.message : String(error));
    
    if (error instanceof Error && error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    
    process.exit(1);
  }
}

// Run main function if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

// Export for testing
export { parseArguments, mergeConfiguration, validateParameters, SkillParameters };
