/**
 * Metadata Collector
 * 
 * Collects metadata for each document including:
 * - File statistics (creation date, modification date, size)
 * - Line count
 * - Category determination
 * 
 * Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { DocumentMetadata, DocumentCategory, ScannedDocument } from './types.js';

/**
 * MetadataCollector class
 * 
 * Responsible for collecting metadata from scanned documents
 */
export class MetadataCollector {
  /**
   * Collect metadata for a document
   * 
   * @param document - The scanned document to collect metadata for
   * @returns Promise resolving to document metadata
   * @throws Error if file cannot be read or stats cannot be obtained
   */
  async collect(document: ScannedDocument): Promise<DocumentMetadata> {
    try {
      // Get file statistics
      const stats = await fs.stat(document.absolutePath);
      
      // Read file content for line counting
      const content = await fs.readFile(document.absolutePath, 'utf-8');
      
      // Collect all metadata
      return {
        path: document.path,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
        sizeBytes: stats.size,
        lineCount: this.countLines(content),
        category: this.determineCategory(document.path),
      };
    } catch (error) {
      throw new Error(
        `Failed to collect metadata for ${document.path}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Determine the category of a document based on its file path
   * 
   * Categories are determined by path patterns:
   * - SPEC: Files in .kiro/specs/ or containing 'spec' in path
   * - WORKFLOW: Files in .agent/workflows/ or .kiro/workflows/
   * - SKILL: Files in .agent/skills/ or .kiro/skills/
   * - BACKLOG: Files in backlog/ directory
   * - DOCS: Files in docs/ directory
   * - CONFIG: Configuration files (config.json, .config files, etc.)
   * - OTHER: Everything else
   * 
   * @param filePath - The file path to categorize
   * @returns The determined category
   */
  private determineCategory(filePath: string): DocumentCategory {
    const normalizedPath = filePath.toLowerCase().replace(/\\/g, '/');
    
    // Check for SPEC category
    if (
      normalizedPath.includes('.kiro/specs/') ||
      normalizedPath.includes('/specs/') ||
      normalizedPath.includes('spec')
    ) {
      return DocumentCategory.SPEC;
    }
    
    // Check for WORKFLOW category
    if (
      normalizedPath.includes('.agent/workflows/') ||
      normalizedPath.includes('.kiro/workflows/') ||
      normalizedPath.includes('/workflows/')
    ) {
      return DocumentCategory.WORKFLOW;
    }
    
    // Check for SKILL category
    if (
      normalizedPath.includes('.agent/skills/') ||
      normalizedPath.includes('.kiro/skills/') ||
      normalizedPath.includes('/skills/')
    ) {
      return DocumentCategory.SKILL;
    }
    
    // Check for BACKLOG category
    if (normalizedPath.includes('backlog/') || normalizedPath.startsWith('backlog/')) {
      return DocumentCategory.BACKLOG;
    }
    
    // Check for DOCS category
    if (normalizedPath.includes('docs/') || normalizedPath.startsWith('docs/')) {
      return DocumentCategory.DOCS;
    }
    
    // Check for CONFIG category
    const fileName = path.basename(filePath).toLowerCase();
    if (
      fileName.includes('config') ||
      fileName.startsWith('.config') ||
      fileName === 'package.json' ||
      fileName === 'tsconfig.json' ||
      fileName.endsWith('.config.js') ||
      fileName.endsWith('.config.ts')
    ) {
      return DocumentCategory.CONFIG;
    }
    
    // Default to OTHER
    return DocumentCategory.OTHER;
  }

  /**
   * Count the number of lines in a file content
   * 
   * Empty files have 0 lines.
   * Files with content have at least 1 line.
   * 
   * @param content - The file content to count lines in
   * @returns The number of lines
   */
  private countLines(content: string): number {
    if (content.length === 0) {
      return 0;
    }
    
    // Split by newlines and count
    // Add 1 if the file doesn't end with a newline
    const lines = content.split('\n');
    return lines.length;
  }
}
