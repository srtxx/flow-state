/**
 * Document Scanner
 * 
 * Responsibilities:
 * - Recursively scan workspace directories for document files
 * - Filter out excluded paths
 * - Check file extensions
 * - Record relative and absolute paths
 * - Handle errors gracefully and continue scanning
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 10.1, 10.2
 */

import * as fs from 'fs';
import * as path from 'path';
import { ScannerConfig, ScannedDocument, ErrorInfo } from './types.js';

/**
 * Scanner class for discovering documents in a workspace
 */
export class Scanner {
  private config: ScannerConfig;
  private errors: ErrorInfo[];

  /**
   * Create a new Scanner
   * 
   * @param config - Scanner configuration
   */
  constructor(config: ScannerConfig) {
    this.config = config;
    this.errors = [];
  }

  /**
   * Get errors encountered during scanning
   * 
   * @returns Array of error information
   */
  getErrors(): ErrorInfo[] {
    return this.errors;
  }

  /**
   * Clear accumulated errors
   */
  clearErrors(): void {
    this.errors = [];
  }

  /**
   * Scan the workspace for documents
   * 
   * @param workspacePath - Absolute path to the workspace root
   * @returns Array of discovered documents
   * 
   * Requirements:
   * - 1.1: Recursively search all directories in the workspace
   * - 1.2: Include .md files and exclude specified directories
   * - 1.3: Record file path relative to workspace root
   * - 1.4: Return scan result containing all discovered documents
   * - 10.2: Handle directory access errors gracefully
   */
  async scan(workspacePath: string): Promise<ScannedDocument[]> {
    const documents: ScannedDocument[] = [];
    
    // Clear previous errors
    this.errors = [];
    
    // Normalize workspace path
    const normalizedWorkspace = path.resolve(workspacePath);

    // Verify workspace exists
    if (!fs.existsSync(normalizedWorkspace)) {
      this.logError(
        normalizedWorkspace,
        `Workspace path does not exist: ${normalizedWorkspace}`,
        'error'
      );
      return documents;
    }

    // Scan each included path
    for (const includePath of this.config.includePaths) {
      const fullPath = path.join(normalizedWorkspace, includePath);
      
      // Check if the path exists
      if (!fs.existsSync(fullPath)) {
        this.logError(
          fullPath,
          `Include path does not exist: ${includePath}`,
          'warning'
        );
        continue;
      }

      // Recursively scan this path
      await this.scanDirectory(fullPath, normalizedWorkspace, documents);
    }

    return documents;
  }

  /**
   * Recursively scan a directory for documents
   * 
   * @param dirPath - Absolute path to the directory to scan
   * @param workspacePath - Absolute path to the workspace root
   * @param documents - Array to accumulate discovered documents
   * 
   * Requirements:
   * - 10.2: Handle directory access errors, log and skip directory
   */
  private async scanDirectory(
    dirPath: string,
    workspacePath: string,
    documents: ScannedDocument[]
  ): Promise<void> {
    try {
      // Read directory contents
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        const relativePath = path.relative(workspacePath, fullPath);

        // Check if this path should be excluded
        if (this.isExcluded(relativePath)) {
          continue;
        }

        if (entry.isDirectory()) {
          // Recursively scan subdirectory
          await this.scanDirectory(fullPath, workspacePath, documents);
        } else if (entry.isFile()) {
          // Check if file has valid extension
          if (this.isValidExtension(entry.name)) {
            // Verify file is accessible before adding
            try {
              fs.accessSync(fullPath, fs.constants.R_OK);
              documents.push({
                path: relativePath,
                absolutePath: fullPath,
              });
            } catch (accessError) {
              // File exists but cannot be read
              this.logError(
                relativePath,
                `File cannot be read: ${accessError instanceof Error ? accessError.message : String(accessError)}`,
                'warning'
              );
            }
          }
        }
        // Ignore symbolic links and other special files
      }
    } catch (error) {
      // Log error but continue scanning (Requirement 10.2)
      const relativePath = path.relative(workspacePath, dirPath);
      this.logError(
        relativePath,
        `Cannot access directory: ${error instanceof Error ? error.message : String(error)}`,
        'error'
      );
    }
  }

  /**
   * Log an error encountered during scanning
   * 
   * @param filePath - Path where error occurred
   * @param message - Error message
   * @param severity - Error severity level
   * 
   * Requirement 10.5: Record errors for inclusion in report
   */
  private logError(filePath: string, message: string, severity: 'warning' | 'error'): void {
    this.errors.push({
      path: filePath,
      error: message,
      timestamp: new Date(),
      severity,
    });
    
    // Also log to console for immediate visibility
    if (severity === 'error') {
      console.error(`[Scanner Error] ${filePath}: ${message}`);
    } else {
      console.warn(`[Scanner Warning] ${filePath}: ${message}`);
    }
  }

  /**
   * Check if a path should be excluded from scanning
   * 
   * @param relativePath - Path relative to workspace root
   * @returns True if the path should be excluded
   * 
   * Requirement 1.2: Exclude specified directories (node_modules, .git, dist, etc.)
   */
  private isExcluded(relativePath: string): boolean {
    // Normalize path separators to forward slashes for consistent matching
    const normalizedPath = relativePath.split(path.sep).join('/');
    
    for (const excludePattern of this.config.excludePaths) {
      // Check if the path starts with or contains the exclude pattern
      const pathParts = normalizedPath.split('/');
      
      // Check if any part of the path matches the exclude pattern
      if (pathParts.includes(excludePattern)) {
        return true;
      }
      
      // Also check if the path starts with the exclude pattern
      if (normalizedPath.startsWith(excludePattern + '/') || normalizedPath === excludePattern) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if a file has a valid extension
   * 
   * @param filename - Name of the file
   * @returns True if the file extension is valid
   * 
   * Requirement 1.2: Include files with specified extensions (.md, .txt, etc.)
   */
  private isValidExtension(filename: string): boolean {
    const ext = path.extname(filename).toLowerCase();
    return this.config.fileExtensions.includes(ext);
  }
}
