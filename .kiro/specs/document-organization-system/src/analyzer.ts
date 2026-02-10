/**
 * Reference Analyzer
 * 
 * Analyzes reference relationships between documents:
 * - Extracts markdown links
 * - Extracts file path references
 * - Builds reference graph
 * - Counts incoming references
 * - Handles errors gracefully
 * 
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 10.1
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import {
  DocumentMetadata,
  DocumentReference,
  ReferenceType,
  ReferenceGraph,
  DocumentNode,
  ErrorInfo,
} from './types.js';

/**
 * ReferenceAnalyzer class
 * 
 * Analyzes reference relationships between documents
 */
export class ReferenceAnalyzer {
  private errors: ErrorInfo[];

  constructor() {
    this.errors = [];
  }

  /**
   * Get errors encountered during reference analysis
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
   * Analyze reference relationships between documents
   * 
   * @param documents - Array of documents with metadata
   * @param workspacePath - Absolute path to the workspace root
   * @returns Promise resolving to a reference graph
   * 
   * Requirements:
   * - 3.1: Scan content for markdown links
   * - 3.2: Scan content for file path references
   * - 3.3: Record source and target document paths
   * - 3.4: Build reference graph showing all relationships
   * - 3.5: Count incoming references for each document
   * - 10.1: Handle file read errors gracefully
   */
  async analyze(
    documents: DocumentMetadata[],
    workspacePath: string
  ): Promise<ReferenceGraph> {
    const allReferences: DocumentReference[] = [];
    
    // Clear previous errors
    this.errors = [];
    
    // Extract references from each document
    for (const doc of documents) {
      try {
        const absolutePath = path.join(workspacePath, doc.path);
        const content = await fs.readFile(absolutePath, 'utf-8');
        const references = await this.extractReferences(content, doc.path, workspacePath);
        allReferences.push(...references);
      } catch (error) {
        // Log error but continue processing (Requirement 10.1)
        this.logError(
          doc.path,
          `Cannot read file for reference analysis: ${error instanceof Error ? error.message : String(error)}`,
          'warning'
        );
      }
    }
    
    // Build and return the reference graph
    return this.buildGraph(allReferences, documents);
  }

  /**
   * Log an error encountered during reference analysis
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
      console.error(`[ReferenceAnalyzer Error] ${filePath}: ${message}`);
    } else {
      console.warn(`[ReferenceAnalyzer Warning] ${filePath}: ${message}`);
    }
  }

  /**
   * Extract all references from a document's content
   * 
   * @param content - The document content
   * @param sourcePath - Path of the source document (relative to workspace)
   * @param workspacePath - Absolute path to the workspace root
   * @returns Array of document references
   * 
   * Requirements:
   * - 3.1: Extract markdown links
   * - 3.2: Extract file path references
   * - 3.3: Record source and target paths
   */
  private async extractReferences(
    content: string,
    sourcePath: string,
    workspacePath: string
  ): Promise<DocumentReference[]> {
    const references: DocumentReference[] = [];
    
    // Extract markdown links
    const markdownLinks = this.extractMarkdownLinks(content);
    for (const link of markdownLinks) {
      const targetPath = this.resolveRelativePath(link, sourcePath, workspacePath);
      if (targetPath) {
        references.push({
          sourcePath,
          targetPath,
          referenceType: ReferenceType.MARKDOWN_LINK,
        });
      }
    }
    
    // Extract file path references
    const filePaths = this.extractFilePaths(content);
    for (const filePath of filePaths) {
      const targetPath = this.resolveRelativePath(filePath, sourcePath, workspacePath);
      if (targetPath) {
        references.push({
          sourcePath,
          targetPath,
          referenceType: ReferenceType.FILE_PATH,
        });
      }
    }
    
    return references;
  }

  /**
   * Extract markdown links from content
   * 
   * Matches patterns like:
   * - [text](path/to/file.md)
   * - [text](./relative/path.md)
   * - [text](../parent/path.md)
   * 
   * @param content - The document content
   * @returns Array of link targets (file paths)
   * 
   * Requirement 3.1: Scan content for markdown links
   */
  private extractMarkdownLinks(content: string): string[] {
    const links: string[] = [];
    
    // Regex to match markdown links: [text](url)
    // Captures the URL part, excluding external URLs (http://, https://, etc.)
    const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    
    let match;
    while ((match = markdownLinkRegex.exec(content)) !== null) {
      const url = match[2].trim();
      
      // Skip external URLs, anchors, and mailto links
      if (
        url.startsWith('http://') ||
        url.startsWith('https://') ||
        url.startsWith('#') ||
        url.startsWith('mailto:')
      ) {
        continue;
      }
      
      // Remove anchor fragments from the URL
      const urlWithoutAnchor = url.split('#')[0];
      
      if (urlWithoutAnchor) {
        links.push(urlWithoutAnchor);
      }
    }
    
    return links;
  }

  /**
   * Extract file path references from content
   * 
   * Matches patterns like:
   * - path/to/file.md
   * - ./relative/path.md
   * - ../parent/path.md
   * - .kiro/specs/feature/design.md
   * 
   * This is a heuristic approach that looks for path-like strings
   * 
   * @param content - The document content
   * @returns Array of file paths
   * 
   * Requirement 3.2: Scan content for file path references
   */
  private extractFilePaths(content: string): string[] {
    const paths: string[] = [];
    
    // Regex to match file paths with common extensions
    // Matches: path/to/file.md, ./path/file.txt, ../path/file.md
    const filePathRegex = /(?:^|\s|['"`])([.\/]?[\w\-./]+\.(?:md|txt|json|yaml|yml|ts|js|tsx|jsx))(?:\s|['"`]|$)/gm;
    
    let match;
    while ((match = filePathRegex.exec(content)) !== null) {
      const filePath = match[1].trim();
      
      // Skip if it looks like a URL
      if (filePath.includes('://')) {
        continue;
      }
      
      paths.push(filePath);
    }
    
    return paths;
  }

  /**
   * Resolve a relative path reference to an absolute path relative to workspace
   * 
   * @param referencePath - The path reference from the document
   * @param sourcePath - Path of the source document (relative to workspace)
   * @param workspacePath - Absolute path to the workspace root
   * @returns Resolved path relative to workspace, or null if invalid
   */
  private resolveRelativePath(
    referencePath: string,
    sourcePath: string,
    workspacePath: string
  ): string | null {
    try {
      // Get the directory of the source document
      const sourceDir = path.dirname(sourcePath);
      
      // Resolve the reference path relative to the source directory
      let resolvedPath: string;
      
      if (path.isAbsolute(referencePath)) {
        // If it's an absolute path, make it relative to workspace
        resolvedPath = path.relative(workspacePath, referencePath);
      } else if (referencePath.startsWith('./') || referencePath.startsWith('../')) {
        // Relative path from source document
        resolvedPath = path.normalize(path.join(sourceDir, referencePath));
      } else {
        // Could be relative to workspace root or relative to source
        // Try both and see which one exists
        const fromWorkspace = path.normalize(referencePath);
        const fromSource = path.normalize(path.join(sourceDir, referencePath));
        
        // Prefer the path from workspace root if it doesn't start with '..'
        if (!fromWorkspace.startsWith('..')) {
          resolvedPath = fromWorkspace;
        } else {
          resolvedPath = fromSource;
        }
      }
      
      // Normalize path separators
      resolvedPath = resolvedPath.split(path.sep).join('/');
      
      // Remove leading './' if present
      if (resolvedPath.startsWith('./')) {
        resolvedPath = resolvedPath.substring(2);
      }
      
      // Reject paths that go outside the workspace
      if (resolvedPath.startsWith('../') || resolvedPath.includes('/../')) {
        return null;
      }
      
      return resolvedPath;
    } catch (error) {
      // If path resolution fails, return null
      return null;
    }
  }

  /**
   * Build a reference graph from extracted references
   * 
   * @param references - Array of all document references
   * @param documents - Array of all documents
   * @returns Reference graph with nodes and edges
   * 
   * Requirements:
   * - 3.4: Build reference graph showing all relationships
   * - 3.5: Count incoming references for each document
   */
  private buildGraph(
    references: DocumentReference[],
    documents: DocumentMetadata[]
  ): ReferenceGraph {
    const documentMap = new Map<string, DocumentNode>();
    
    // Initialize nodes for all documents
    for (const doc of documents) {
      documentMap.set(doc.path, {
        path: doc.path,
        incomingRefs: 0,
        outgoingRefs: 0,
        referencedBy: [],
        references: [],
      });
    }
    
    // Process all references
    for (const ref of references) {
      const sourceNode = documentMap.get(ref.sourcePath);
      const targetNode = documentMap.get(ref.targetPath);
      
      // Only process references where both source and target exist in our document set
      if (sourceNode && targetNode) {
        // Update outgoing references for source
        if (!sourceNode.references.includes(ref.targetPath)) {
          sourceNode.references.push(ref.targetPath);
          sourceNode.outgoingRefs++;
        }
        
        // Update incoming references for target
        if (!targetNode.referencedBy.includes(ref.sourcePath)) {
          targetNode.referencedBy.push(ref.sourcePath);
          targetNode.incomingRefs++;
        }
      }
    }
    
    return {
      documents: documentMap,
      references,
    };
  }
}
