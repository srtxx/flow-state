/**
 * Document Organization System
 * Main entry point
 * 
 * This module provides the main orchestrator function that integrates all components
 * to analyze and organize documents in a workspace.
 * 
 * Requirements: All requirements (1-12)
 */

import * as path from 'path';
import { ConfigManager } from './config.js';
import { Scanner } from './scanner.js';
import { MetadataCollector } from './metadata.js';
import { ReferenceAnalyzer } from './analyzer.js';
import { ImportanceEvaluator, DuplicateChecker, StatusAssigner } from './evaluator.js';
import { ReportGenerator } from './reporter.js';
import {
  SystemConfig,
  OrganizationReport,
  DocumentWithStatus,
  ErrorInfo,
  DocumentMetadata,
  DocumentStatus,
} from './types.js';

// Export all types
export * from './types.js';

// Export all implemented modules
export { ConfigManager } from './config.js';
export { Scanner } from './scanner.js';
export { MetadataCollector } from './metadata.js';
export { ReferenceAnalyzer } from './analyzer.js';
export { ImportanceEvaluator, DuplicateChecker, StatusAssigner } from './evaluator.js';
export { ReportGenerator } from './reporter.js';

/**
 * Progress callback function type
 * Called during execution to report progress
 */
export type ProgressCallback = (message: string, current: number, total: number) => void;

/**
 * Result of running the document organization system
 */
export interface OrganizationResult {
  /** The generated report */
  report: OrganizationReport;
  /** Path where the report was saved */
  reportPath: string;
  /** Whether the operation completed successfully */
  success: boolean;
  /** Error message if operation failed */
  errorMessage?: string;
}

/**
 * Main orchestrator function for the Document Organization System
 * 
 * This function integrates all components and executes the complete workflow:
 * 1. Load configuration
 * 2. Scan workspace for documents
 * 3. Collect metadata for each document
 * 4. Analyze reference relationships
 * 5. Check for duplicates
 * 6. Evaluate importance
 * 7. Assign status
 * 8. Generate report
 * 9. Write report to file
 * 
 * @param workspacePath - Absolute path to the workspace to analyze
 * @param configPath - Optional path to configuration file
 * @param progressCallback - Optional callback for progress updates
 * @returns Promise resolving to organization result
 * 
 * Requirements:
 * - All requirements (1-12) are validated through component integration
 * - 10.1, 10.2, 10.5: Errors are collected from all components and included in report
 * - 10.4: Output write failures are caught and returned as error
 */
export async function runDocumentOrganization(
  workspacePath: string,
  configPath?: string,
  progressCallback?: ProgressCallback
): Promise<OrganizationResult> {
  const allErrors: ErrorInfo[] = [];
  
  try {
    // Normalize workspace path
    const normalizedWorkspace = path.resolve(workspacePath);
    
    // Step 1: Load configuration
    reportProgress(progressCallback, 'Loading configuration...', 0, 9);
    const config: SystemConfig = ConfigManager.load(configPath);
    
    // Step 2: Scan workspace for documents
    reportProgress(progressCallback, 'Scanning workspace for documents...', 1, 9);
    const scanner = new Scanner(config.scanner);
    const scannedDocuments = await scanner.scan(normalizedWorkspace);
    allErrors.push(...scanner.getErrors());
    
    console.log(`Found ${scannedDocuments.length} documents`);
    
    if (scannedDocuments.length === 0) {
      console.warn('No documents found in workspace');
      // Generate empty report
      const emptyReport = createEmptyReport(normalizedWorkspace, allErrors);
      const reportPath = await writeReport(emptyReport, config, normalizedWorkspace);
      
      return {
        report: emptyReport,
        reportPath,
        success: true,
      };
    }
    
    // Step 3: Collect metadata for each document
    reportProgress(progressCallback, 'Collecting metadata...', 2, 9);
    const metadataCollector = new MetadataCollector();
    const documentsWithMetadata: DocumentMetadata[] = [];
    
    for (let i = 0; i < scannedDocuments.length; i++) {
      const doc = scannedDocuments[i];
      const metadata = await metadataCollector.collect(doc);
      documentsWithMetadata.push(metadata);
      
      // Report sub-progress for metadata collection
      if (i % 10 === 0 || i === scannedDocuments.length - 1) {
        reportProgress(
          progressCallback,
          `Collecting metadata... (${i + 1}/${scannedDocuments.length})`,
          2,
          9
        );
      }
    }
    allErrors.push(...metadataCollector.getErrors());
    
    console.log(`Collected metadata for ${documentsWithMetadata.length} documents`);
    
    // Step 4: Analyze reference relationships
    reportProgress(progressCallback, 'Analyzing reference relationships...', 3, 9);
    const referenceAnalyzer = new ReferenceAnalyzer();
    const referenceGraph = await referenceAnalyzer.analyze(
      documentsWithMetadata,
      normalizedWorkspace
    );
    allErrors.push(...referenceAnalyzer.getErrors());
    
    console.log(`Found ${referenceGraph.references.length} references between documents`);
    
    // Step 5: Check for duplicates
    reportProgress(progressCallback, 'Checking for duplicates...', 4, 9);
    const duplicateChecker = new DuplicateChecker();
    const duplicateMap = await duplicateChecker.checkDuplicates(
      documentsWithMetadata,
      normalizedWorkspace
    );
    allErrors.push(...duplicateChecker.getErrors());
    
    const duplicateCount = Array.from(duplicateMap.values()).filter(
      d => d.duplicateOf !== null
    ).length;
    console.log(`Found ${duplicateCount} duplicate documents`);
    
    // Step 6: Evaluate importance and assign status
    reportProgress(progressCallback, 'Evaluating importance...', 5, 9);
    const importanceEvaluator = new ImportanceEvaluator(config.evaluator);
    const statusAssigner = new StatusAssigner(config.evaluator);
    
    const documentsWithStatus: DocumentWithStatus[] = [];
    
    for (const metadata of documentsWithMetadata) {
      // Get reference node (or create empty one if not found)
      const refNode = referenceGraph.documents.get(metadata.path) || {
        path: metadata.path,
        incomingRefs: 0,
        outgoingRefs: 0,
        referencedBy: [],
        references: [],
      };
      
      // Get duplicate info (or create empty one if not found)
      const duplicateInfo = duplicateMap.get(metadata.path) || {
        path: metadata.path,
        duplicateOf: null,
        similarTo: [],
        contentHash: '',
        similarity: 0.0,
      };
      
      // Evaluate importance
      const importance = importanceEvaluator.evaluate(metadata, refNode, duplicateInfo);
      
      // Assign status
      const status = statusAssigner.assignStatus(importance, duplicateInfo, refNode);
      
      // Generate recommendation
      const recommendation = statusAssigner.generateRecommendation(
        status,
        importance,
        duplicateInfo
      );
      
      documentsWithStatus.push({
        metadata,
        importance,
        status,
        recommendation,
      });
    }
    
    console.log('Completed importance evaluation and status assignment');
    
    // Step 7: Generate report
    reportProgress(progressCallback, 'Generating report...', 6, 9);
    const reportGenerator = new ReportGenerator();
    const report = reportGenerator.generate(
      documentsWithStatus,
      allErrors,
      normalizedWorkspace
    );
    
    console.log('Report generated successfully');
    
    // Step 8: Write report to file
    reportProgress(progressCallback, 'Writing report to file...', 7, 9);
    const reportPath = await writeReport(report, config, normalizedWorkspace);
    
    // Step 9: Complete
    reportProgress(progressCallback, 'Complete!', 9, 9);
    
    // Print summary
    console.log('\n=== Document Organization Complete ===');
    console.log(`Total documents: ${report.summary.totalDocuments}`);
    console.log(`Necessary: ${report.summary.necessaryCount}`);
    console.log(`Needs review: ${report.summary.needsReviewCount}`);
    console.log(`Unnecessary: ${report.summary.unnecessaryCount}`);
    console.log(`Duplicates: ${report.summary.duplicatesFound}`);
    console.log(`Errors: ${report.errors.length}`);
    console.log(`Report saved to: ${reportPath}`);
    console.log('=====================================\n');
    
    return {
      report,
      reportPath,
      success: true,
    };
    
  } catch (error) {
    // Handle any unexpected errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Document organization failed:', errorMessage);
    
    // Log error
    allErrors.push({
      path: workspacePath,
      error: `System error: ${errorMessage}`,
      timestamp: new Date(),
      severity: 'error',
    });
    
    // Try to generate an error report
    try {
      const errorReport = createEmptyReport(workspacePath, allErrors);
      const config = ConfigManager.getDefaults();
      const reportPath = await writeReport(errorReport, config, workspacePath);
      
      return {
        report: errorReport,
        reportPath,
        success: false,
        errorMessage,
      };
    } catch (reportError) {
      // If we can't even write the error report, return failure
      return {
        report: createEmptyReport(workspacePath, allErrors),
        reportPath: '',
        success: false,
        errorMessage: `${errorMessage}. Additionally, failed to write error report: ${reportError}`,
      };
    }
  }
}

/**
 * Helper function to report progress
 */
function reportProgress(
  callback: ProgressCallback | undefined,
  message: string,
  current: number,
  total: number
): void {
  if (callback) {
    callback(message, current, total);
  }
}

/**
 * Helper function to write report to file
 * 
 * @param report - Organization report
 * @param config - System configuration
 * @param workspacePath - Workspace path
 * @returns Path where report was written
 * @throws Error if write fails (Requirement 10.4)
 */
async function writeReport(
  report: OrganizationReport,
  config: SystemConfig,
  workspacePath: string
): Promise<string> {
  const reportGenerator = new ReportGenerator();
  await reportGenerator.writeToFile(report, config.output, workspacePath);
  return path.join(workspacePath, config.output.outputPath);
}

/**
 * Create an empty report (used when no documents found or on error)
 * 
 * @param workspacePath - Workspace path
 * @param errors - Errors to include
 * @returns Empty organization report
 */
function createEmptyReport(workspacePath: string, errors: ErrorInfo[]): OrganizationReport {
  return {
    generatedAt: new Date(),
    workspacePath,
    summary: {
      totalDocuments: 0,
      necessaryCount: 0,
      unnecessaryCount: 0,
      needsReviewCount: 0,
      duplicatesFound: 0,
      totalSizeBytes: 0,
    },
    documentsByStatus: new Map([
      [DocumentStatus.NECESSARY, []],
      [DocumentStatus.UNNECESSARY, []],
      [DocumentStatus.NEEDS_REVIEW, []],
    ]),
    errors,
  };
}
