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
import { WorkflowLogger } from './workflow-logger.js';
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
export { WorkflowLogger } from './workflow-logger.js';

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
  /** Path to the workflow log file */
  logFilePath: string;
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
  
  // Initialize workflow logger
  const logger = new WorkflowLogger(true);
  
  try {
    // Normalize workspace path
    const normalizedWorkspace = path.resolve(workspacePath);
    
    // Initialize logger with workspace path
    const logFilePath = await logger.initialize(normalizedWorkspace);
    await logger.info('Initialization', `Workspace: ${normalizedWorkspace}`);
    await logger.info('Initialization', `Log file: ${logFilePath}`);
    
    // Step 1: Load configuration
    reportProgress(progressCallback, 'Loading configuration...', 0, 9);
    await logger.stepStart(1, 'Configuration', 'Loading system configuration');
    const config: SystemConfig = ConfigManager.load(configPath);
    await logger.stepComplete(1, 'Configuration', 'Configuration loaded successfully', {
      configPath: configPath || 'default',
      includePaths: config.scanner.includePaths,
      excludePaths: config.scanner.excludePaths,
    });
    
    // Step 2: Scan workspace for documents
    reportProgress(progressCallback, 'Scanning workspace for documents...', 1, 9);
    await logger.stepStart(2, 'Document Scan', 'Scanning workspace for documents');
    const scanner = new Scanner(config.scanner);
    const scannedDocuments = await scanner.scan(normalizedWorkspace);
    allErrors.push(...scanner.getErrors());
    
    console.log(`Found ${scannedDocuments.length} documents`);
    await logger.stepComplete(2, 'Document Scan', `Found ${scannedDocuments.length} documents`, {
      documentCount: scannedDocuments.length,
      errorCount: scanner.getErrors().length,
    });
    
    if (scannedDocuments.length === 0) {
      console.warn('No documents found in workspace');
      await logger.warning('Document Scan', 'No documents found in workspace');
      
      // Generate empty report
      const emptyReport = createEmptyReport(normalizedWorkspace, allErrors);
      const reportPath = await writeReport(emptyReport, config, normalizedWorkspace, logger);
      
      await logger.complete(true, 'No documents to organize');
      
      return {
        report: emptyReport,
        reportPath,
        logFilePath,
        success: true,
      };
    }
    
    // Step 3: Collect metadata for each document
    reportProgress(progressCallback, 'Collecting metadata...', 2, 9);
    await logger.stepStart(3, 'Metadata Collection', 'Collecting metadata for all documents');
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
    await logger.stepComplete(3, 'Metadata Collection', `Collected metadata for ${documentsWithMetadata.length} documents`, {
      documentCount: documentsWithMetadata.length,
      errorCount: metadataCollector.getErrors().length,
    });
    
    // Step 4: Analyze reference relationships
    reportProgress(progressCallback, 'Analyzing reference relationships...', 3, 9);
    await logger.stepStart(4, 'Reference Analysis', 'Analyzing document reference relationships');
    const referenceAnalyzer = new ReferenceAnalyzer();
    const referenceGraph = await referenceAnalyzer.analyze(
      documentsWithMetadata,
      normalizedWorkspace
    );
    allErrors.push(...referenceAnalyzer.getErrors());
    
    console.log(`Found ${referenceGraph.references.length} references between documents`);
    await logger.stepComplete(4, 'Reference Analysis', `Found ${referenceGraph.references.length} references`, {
      referenceCount: referenceGraph.references.length,
      documentNodeCount: referenceGraph.documents.size,
      errorCount: referenceAnalyzer.getErrors().length,
    });
    
    // Step 5: Check for duplicates
    reportProgress(progressCallback, 'Checking for duplicates...', 4, 9);
    await logger.stepStart(5, 'Duplicate Check', 'Checking for duplicate documents');
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
    await logger.stepComplete(5, 'Duplicate Check', `Found ${duplicateCount} duplicate documents`, {
      duplicateCount,
      errorCount: duplicateChecker.getErrors().length,
    });
    
    // Step 6: Evaluate importance and assign status
    reportProgress(progressCallback, 'Evaluating importance...', 5, 9);
    await logger.stepStart(6, 'Importance Evaluation', 'Evaluating document importance and assigning status');
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
    
    // Count documents by status
    const statusCounts = {
      necessary: documentsWithStatus.filter(d => d.status === DocumentStatus.NECESSARY).length,
      unnecessary: documentsWithStatus.filter(d => d.status === DocumentStatus.UNNECESSARY).length,
      needsReview: documentsWithStatus.filter(d => d.status === DocumentStatus.NEEDS_REVIEW).length,
    };
    
    await logger.stepComplete(6, 'Importance Evaluation', 'Completed evaluation and status assignment', {
      necessary: statusCounts.necessary,
      unnecessary: statusCounts.unnecessary,
      needsReview: statusCounts.needsReview,
    });
    
    // Step 7: Generate report
    reportProgress(progressCallback, 'Generating report...', 6, 9);
    await logger.stepStart(7, 'Report Generation', 'Generating organization report');
    const reportGenerator = new ReportGenerator();
    const report = reportGenerator.generate(
      documentsWithStatus,
      allErrors,
      normalizedWorkspace
    );
    
    console.log('Report generated successfully');
    await logger.stepComplete(7, 'Report Generation', 'Report generated successfully', {
      totalDocuments: report.summary.totalDocuments,
      totalErrors: report.errors.length,
    });
    
    // Step 8: Write report to file
    reportProgress(progressCallback, 'Writing report to file...', 7, 9);
    await logger.stepStart(8, 'Report Output', 'Writing report to file');
    const reportPath = await writeReport(report, config, normalizedWorkspace, logger);
    await logger.stepComplete(8, 'Report Output', `Report written to ${reportPath}`, {
      reportPath,
    });
    
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
    console.log(`Log saved to: ${logFilePath}`);
    console.log('=====================================\n');
    
    // Complete workflow logging
    await logger.complete(true, `Organized ${report.summary.totalDocuments} documents`);
    
    return {
      report,
      reportPath,
      logFilePath,
      success: true,
    };
    
  } catch (error) {
    // Handle any unexpected errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Document organization failed:', errorMessage);
    
    // Log error
    await logger.error('Workflow Error', `Unexpected error: ${errorMessage}`, {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
    
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
      const reportPath = await writeReport(errorReport, config, workspacePath, logger);
      
      await logger.complete(false, `Failed: ${errorMessage}`);
      
      return {
        report: errorReport,
        reportPath,
        logFilePath: logger.getLogFilePath() || '',
        success: false,
        errorMessage,
      };
    } catch (reportError) {
      // If we can't even write the error report, return failure
      await logger.complete(false, `Critical failure: ${errorMessage}`);
      
      return {
        report: createEmptyReport(workspacePath, allErrors),
        reportPath: '',
        logFilePath: logger.getLogFilePath() || '',
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
 * @param logger - Workflow logger
 * @returns Path where report was written
 * @throws Error if write fails (Requirement 10.4)
 */
async function writeReport(
  report: OrganizationReport,
  config: SystemConfig,
  workspacePath: string,
  logger: WorkflowLogger
): Promise<string> {
  const reportGenerator = new ReportGenerator();
  try {
    await reportGenerator.writeToFile(report, config.output, workspacePath);
    const reportPath = path.join(workspacePath, config.output.outputPath);
    return reportPath;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    await logger.error('Report Output', `Failed to write report: ${errorMessage}`);
    throw error;
  }
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
