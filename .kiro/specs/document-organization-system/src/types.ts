/**
 * Core type definitions for the Document Organization System
 */

// ============================================================================
// Scanner Types
// ============================================================================

/**
 * Configuration for the document scanner
 */
export interface ScannerConfig {
  /** Paths to include in the scan (relative to workspace root) */
  includePaths: string[];
  /** Paths to exclude from the scan */
  excludePaths: string[];
  /** File extensions to include (e.g., ['.md', '.txt']) */
  fileExtensions: string[];
}

/**
 * A document discovered during scanning
 */
export interface ScannedDocument {
  /** File path relative to workspace root */
  path: string;
  /** Absolute file path */
  absolutePath: string;
}

// ============================================================================
// Metadata Types
// ============================================================================

/**
 * Document category based on file path
 */
export enum DocumentCategory {
  SPEC = 'spec',
  WORKFLOW = 'workflow',
  SKILL = 'skill',
  BACKLOG = 'backlog',
  DOCS = 'docs',
  CONFIG = 'config',
  OTHER = 'other',
}

/**
 * Metadata collected for each document
 */
export interface DocumentMetadata {
  /** File path relative to workspace root */
  path: string;
  /** File creation timestamp */
  createdAt: Date;
  /** Last modification timestamp */
  modifiedAt: Date;
  /** File size in bytes */
  sizeBytes: number;
  /** Number of lines in the file */
  lineCount: number;
  /** Document category */
  category: DocumentCategory;
}

// ============================================================================
// Reference Analysis Types
// ============================================================================

/**
 * Type of reference between documents
 */
export enum ReferenceType {
  MARKDOWN_LINK = 'markdown_link',
  FILE_PATH = 'file_path',
  IMPORT = 'import',
}

/**
 * A reference from one document to another
 */
export interface DocumentReference {
  /** Source document path */
  sourcePath: string;
  /** Target document path */
  targetPath: string;
  /** Type of reference */
  referenceType: ReferenceType;
}

/**
 * Node in the reference graph representing a document
 */
export interface DocumentNode {
  /** File path relative to workspace root */
  path: string;
  /** Number of incoming references */
  incomingRefs: number;
  /** Number of outgoing references */
  outgoingRefs: number;
  /** Paths of documents that reference this document */
  referencedBy: string[];
  /** Paths of documents that this document references */
  references: string[];
}

/**
 * Graph of document references
 */
export interface ReferenceGraph {
  /** Map of document path to document node */
  documents: Map<string, DocumentNode>;
  /** All references between documents */
  references: DocumentReference[];
}

// ============================================================================
// Duplicate Detection Types
// ============================================================================

/**
 * Information about duplicate or similar documents
 */
export interface DuplicateInfo {
  /** File path relative to workspace root */
  path: string;
  /** Path of the document this is a duplicate of (null if not a duplicate) */
  duplicateOf: string | null;
  /** Paths of documents that are similar to this one */
  similarTo: string[];
  /** Content hash for duplicate detection */
  contentHash: string;
  /** Similarity score (0-1) */
  similarity: number;
}

// ============================================================================
// Importance Evaluation Types
// ============================================================================

/**
 * Factors that contribute to importance score
 */
export enum ImportanceFactors {
  REFERENCE_COUNT = 'reference_count',
  RECENCY = 'recency',
  SIZE = 'size',
  CATEGORY = 'category',
  DUPLICATE = 'duplicate',
}

/**
 * A single factor contributing to the importance score
 */
export interface ScoreFactor {
  /** Name of the factor */
  name: string;
  /** Weight of this factor (0-1) */
  weight: number;
  /** Raw value of this factor */
  value: number;
  /** Contribution to total score (weight * value) */
  contribution: number;
}

/**
 * Importance score for a document
 */
export interface ImportanceScore {
  /** File path relative to workspace root */
  path: string;
  /** Total importance score (0-100) */
  score: number;
  /** Factors that contributed to the score */
  factors: ScoreFactor[];
  /** Human-readable reasoning for the score */
  reasoning: string;
}

// ============================================================================
// Status Assignment Types
// ============================================================================

/**
 * Status assigned to a document
 */
export enum DocumentStatus {
  NECESSARY = '必要',
  UNNECESSARY = '不要',
  NEEDS_REVIEW = '要確認',
}

/**
 * A document with all analysis results and assigned status
 */
export interface DocumentWithStatus {
  /** Document metadata */
  metadata: DocumentMetadata;
  /** Importance score and reasoning */
  importance: ImportanceScore;
  /** Assigned status */
  status: DocumentStatus;
  /** Recommendation for action */
  recommendation: string;
}

// ============================================================================
// Report Generation Types
// ============================================================================

/**
 * Summary statistics for the report
 */
export interface ReportSummary {
  /** Total number of documents analyzed */
  totalDocuments: number;
  /** Number of necessary documents */
  necessaryCount: number;
  /** Number of unnecessary documents */
  unnecessaryCount: number;
  /** Number of documents needing review */
  needsReviewCount: number;
  /** Number of duplicate documents found */
  duplicatesFound: number;
  /** Total size of all documents in bytes */
  totalSizeBytes: number;
}

/**
 * Error information
 */
export interface ErrorInfo {
  /** Path where the error occurred */
  path: string;
  /** Error message */
  error: string;
  /** Timestamp when the error occurred */
  timestamp: Date;
  /** Error severity */
  severity: 'warning' | 'error';
}

/**
 * Complete organization report
 */
export interface OrganizationReport {
  /** When the report was generated */
  generatedAt: Date;
  /** Workspace path that was analyzed */
  workspacePath: string;
  /** Summary statistics */
  summary: ReportSummary;
  /** Documents grouped by status */
  documentsByStatus: Map<DocumentStatus, DocumentWithStatus[]>;
  /** Errors encountered during analysis */
  errors: ErrorInfo[];
}

// ============================================================================
// Configuration Types
// ============================================================================

/**
 * Configuration for the importance evaluator
 */
export interface EvaluatorConfig {
  /** Weights for each importance factor */
  weights: {
    referenceCount: number;
    recency: number;
    size: number;
    category: number;
  };
  /** Thresholds for status assignment */
  thresholds: {
    /** Score >= this value is considered necessary */
    necessary: number;
    /** Score <= this value is considered unnecessary */
    unnecessary: number;
  };
}

/**
 * Configuration for report output
 */
export interface OutputConfig {
  /** Path where the report should be saved */
  outputPath: string;
  /** Whether to include detailed metadata in the report */
  includeMetadata: boolean;
  /** Whether to include detailed reasoning in the report */
  includeReasoningDetails: boolean;
}

/**
 * Complete system configuration
 */
export interface SystemConfig {
  /** Scanner configuration */
  scanner: ScannerConfig;
  /** Evaluator configuration */
  evaluator: EvaluatorConfig;
  /** Output configuration */
  output: OutputConfig;
}
