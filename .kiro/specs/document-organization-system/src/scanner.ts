/**
 * Document Scanner
 * 
 * Responsibilities:
 * - Recursively scan workspace directories for document files
 * - Filter out excluded paths
 * - Check file extensions
 * - Record relative and absolute paths
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4
 */

import * as fs from 'fs';
import * as path from 'path';
import { ScannerConfig, ScannedDocument } from './types.js';

/**
 * Scanner class for discovering documents in a workspace
 */
export class Scanner {
  private config: ScannerConfig;

  /**
   * Create a new Scanner
   * 
   * @param config - Scanner configuration
   */
  constructor(config: ScannerConfig) {
    this.config = config;
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
   */
  async scan(workspacePath: string): Promise<ScannedDocument[]> {
    const documents: ScannedDocument[] = [];
    
    // Normalize workspace path
    const normalizedWorkspace = path.resolve(workspacePath);

    // Scan each included path
    for (const includePath of this.config.includePaths) {
      const fullPath = path.join(normalizedWorkspace, includePath);
      
      // Check if the path exists
      if (!fs.existsSync(fullPath)) {
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
            documents.push({
              path: relativePath,
              absolutePath: fullPath,
            });
          }
        }
        // Ignore symbolic links and other special files
      }
    } catch (error) {
      // Log error but continue scanning
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn(`Error scanning directory ${dirPath}: ${errorMessage}`);
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
