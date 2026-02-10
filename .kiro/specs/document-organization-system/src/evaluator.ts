/**
 * Evaluator Module
 * 
 * Contains classes for:
 * - Duplicate detection (DuplicateChecker)
 * - Importance evaluation (ImportanceEvaluator)
 * - Status assignment (StatusAssigner)
 * 
 * Validates: Requirements 4.1-4.5, 5.1-5.5, 6.1-6.5, 10.1
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import {
  DocumentMetadata,
  DuplicateInfo,
  DocumentNode,
  ImportanceScore,
  ScoreFactor,
  DocumentCategory,
  DocumentStatus,
  ErrorInfo,
} from './types.js';

/**
 * DuplicateChecker class
 * 
 * Responsible for detecting duplicate and similar documents
 * 
 * Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 10.1
 */
export class DuplicateChecker {
  private errors: ErrorInfo[];

  constructor() {
    this.errors = [];
  }

  /**
   * Get errors encountered during duplicate checking
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
   * Check for duplicates and similar documents
   * 
   * @param documents - Array of documents with metadata
   * @param workspacePath - Absolute path to the workspace root
   * @returns Promise resolving to a map of document path to duplicate info
   * 
   * Requirements:
   * - 10.1: Handle file read errors gracefully
   */
  async checkDuplicates(
    documents: DocumentMetadata[],
    workspacePath: string
  ): Promise<Map<string, DuplicateInfo>> {
    const duplicateMap = new Map<string, DuplicateInfo>();
    const hashToPath = new Map<string, string>();
    
    // Clear previous errors
    this.errors = [];
    
    // First pass: Calculate hashes and detect exact duplicates
    for (const doc of documents) {
      try {
        const absolutePath = path.join(workspacePath, doc.path);
        const hash = await this.calculateHash(absolutePath);
        
        // Check if we've seen this hash before (exact duplicate)
        const existingPath = hashToPath.get(hash);
        const duplicateOf = existingPath || null;
        
        // Initialize duplicate info
        const info: DuplicateInfo = {
          path: doc.path,
          duplicateOf,
          similarTo: [],
          contentHash: hash,
          similarity: duplicateOf ? 1.0 : 0.0,
        };
        
        duplicateMap.set(doc.path, info);
        
        // Store the first occurrence of this hash
        if (!existingPath) {
          hashToPath.set(hash, doc.path);
        }
      } catch (error) {
        // If we can't read the file, create a default entry and log error (Requirement 10.1)
        this.logError(
          doc.path,
          `Cannot calculate hash: ${error instanceof Error ? error.message : String(error)}`,
          'warning'
        );
        
        duplicateMap.set(doc.path, {
          path: doc.path,
          duplicateOf: null,
          similarTo: [],
          contentHash: '',
          similarity: 0.0,
        });
      }
    }
    
    // Second pass: Calculate similarity for non-duplicate documents
    for (let i = 0; i < documents.length; i++) {
      const doc1 = documents[i];
      const info1 = duplicateMap.get(doc1.path);
      
      // Skip if this is already an exact duplicate
      if (!info1 || info1.duplicateOf) {
        continue;
      }
      
      for (let j = i + 1; j < documents.length; j++) {
        const doc2 = documents[j];
        const info2 = duplicateMap.get(doc2.path);
        
        // Skip if either is already an exact duplicate
        if (!info2 || info2.duplicateOf) {
          continue;
        }
        
        // Calculate similarity
        const similarity = this.calculateSimilarity(doc1, doc2);
        
        // If similarity is high enough (>= 0.8), mark as similar
        if (similarity >= 0.8) {
          info1.similarTo.push(doc2.path);
          info2.similarTo.push(doc1.path);
          
          // Update similarity score to the highest found
          info1.similarity = Math.max(info1.similarity, similarity);
          info2.similarity = Math.max(info2.similarity, similarity);
        }
      }
    }
    
    return duplicateMap;
  }

  /**
   * Log an error encountered during duplicate checking
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
      console.error(`[DuplicateChecker Error] ${filePath}: ${message}`);
    } else {
      console.warn(`[DuplicateChecker Warning] ${filePath}: ${message}`);
    }
  }

  /**
   * Calculate content hash for a document
   * 
   * Uses SHA-256 hash of the file content for duplicate detection
   * 
   * @param filePath - Path to the file (can be relative or absolute)
   * @returns Promise resolving to the content hash
   * @throws Error if file cannot be read (Requirement 10.1)
   */
  private async calculateHash(filePath: string): Promise<string> {
    const content = await fs.readFile(filePath, 'utf-8');
    const hash = crypto.createHash('sha256');
    hash.update(content);
    return hash.digest('hex');
  }

  /**
   * Calculate similarity between two documents
   * 
   * Similarity is based on:
   * - File size similarity (50% weight)
   * - Line count similarity (50% weight)
   * 
   * Returns a value between 0 (completely different) and 1 (identical)
   * 
   * @param doc1 - First document metadata
   * @param doc2 - Second document metadata
   * @returns Similarity score (0-1)
   */
  private calculateSimilarity(doc1: DocumentMetadata, doc2: DocumentMetadata): number {
    // Calculate size similarity
    const maxSize = Math.max(doc1.sizeBytes, doc2.sizeBytes);
    const minSize = Math.min(doc1.sizeBytes, doc2.sizeBytes);
    const sizeSimilarity = maxSize === 0 ? 1.0 : minSize / maxSize;
    
    // Calculate line count similarity
    const maxLines = Math.max(doc1.lineCount, doc2.lineCount);
    const minLines = Math.min(doc1.lineCount, doc2.lineCount);
    const lineSimilarity = maxLines === 0 ? 1.0 : minLines / maxLines;
    
    // Weighted average (50% size, 50% line count)
    const similarity = (sizeSimilarity * 0.5) + (lineSimilarity * 0.5);
    
    return similarity;
  }
}

/**
 * ImportanceEvaluator class
 * 
 * Responsible for evaluating the importance of documents based on multiple factors
 * 
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5
 */
export class ImportanceEvaluator {
  private config: {
    weights: {
      referenceCount: number;
      recency: number;
      size: number;
      category: number;
    };
  };

  /**
   * Create a new ImportanceEvaluator
   * 
   * @param config - Configuration for weights (optional, uses defaults if not provided)
   */
  constructor(config?: {
    weights: {
      referenceCount: number;
      recency: number;
      size: number;
      category: number;
    };
  }) {
    // Default weights if not provided
    this.config = config || {
      weights: {
        referenceCount: 0.4,
        recency: 0.3,
        size: 0.1,
        category: 0.2,
      },
    };
  }

  /**
   * Evaluate the importance of a document
   * 
   * @param metadata - Document metadata
   * @param refNode - Reference graph node for this document
   * @param duplicateInfo - Duplicate detection information
   * @returns Importance score with factors and reasoning
   */
  evaluate(
    metadata: DocumentMetadata,
    refNode: DocumentNode,
    duplicateInfo: DuplicateInfo
  ): ImportanceScore {
    const factors: ScoreFactor[] = [];

    // Calculate reference count score
    const refScore = this.calculateReferenceScore(refNode.incomingRefs);
    factors.push({
      name: 'reference_count',
      weight: this.config.weights.referenceCount,
      value: refScore,
      contribution: refScore * this.config.weights.referenceCount,
    });

    // Calculate recency score
    const recencyScore = this.calculateRecencyScore(metadata.modifiedAt);
    factors.push({
      name: 'recency',
      weight: this.config.weights.recency,
      value: recencyScore,
      contribution: recencyScore * this.config.weights.recency,
    });

    // Calculate category score
    const categoryScore = this.calculateCategoryScore(metadata.category);
    factors.push({
      name: 'category',
      weight: this.config.weights.category,
      value: categoryScore,
      contribution: categoryScore * this.config.weights.category,
    });

    // Calculate duplicate penalty
    const duplicatePenalty = this.calculateDuplicatePenalty(duplicateInfo);
    factors.push({
      name: 'duplicate',
      weight: 1.0, // Penalty is applied directly
      value: duplicatePenalty,
      contribution: duplicatePenalty,
    });

    // Calculate total score
    const totalScore = this.calculateTotalScore(factors);

    // Generate reasoning
    const reasoning = this.generateReasoning(factors, metadata, refNode, duplicateInfo);

    return {
      path: metadata.path,
      score: totalScore,
      factors,
      reasoning,
    };
  }

  /**
   * Calculate score based on number of incoming references
   * 
   * More references = higher importance
   * Uses logarithmic scaling to prevent extreme values
   * 
   * @param incomingRefs - Number of incoming references
   * @returns Score from 0-100
   */
  private calculateReferenceScore(incomingRefs: number): number {
    if (incomingRefs === 0) {
      return 0;
    }
    
    // Logarithmic scaling: log2(refs + 1) * 20
    // 0 refs = 0, 1 ref = 20, 3 refs = 40, 7 refs = 60, 15 refs = 80, 31+ refs = 100
    const score = Math.log2(incomingRefs + 1) * 20;
    return Math.min(100, score);
  }

  /**
   * Calculate score based on how recently the document was modified
   * 
   * More recent = higher importance
   * 
   * @param modifiedAt - Last modification date
   * @returns Score from 0-100
   */
  private calculateRecencyScore(modifiedAt: Date): number {
    const now = new Date();
    const ageInDays = (now.getTime() - modifiedAt.getTime()) / (1000 * 60 * 60 * 24);
    
    // Scoring:
    // 0-7 days: 100
    // 7-30 days: 80
    // 30-90 days: 60
    // 90-180 days: 40
    // 180-365 days: 20
    // 365+ days: 0
    
    if (ageInDays <= 7) {
      return 100;
    } else if (ageInDays <= 30) {
      return 80;
    } else if (ageInDays <= 90) {
      return 60;
    } else if (ageInDays <= 180) {
      return 40;
    } else if (ageInDays <= 365) {
      return 20;
    } else {
      return 0;
    }
  }

  /**
   * Calculate score based on document category
   * 
   * Different categories have different importance levels
   * 
   * @param category - Document category
   * @returns Score from 0-100
   */
  private calculateCategoryScore(category: DocumentCategory): number {
    // Category importance ranking
    const categoryScores: Record<DocumentCategory, number> = {
      [DocumentCategory.SPEC]: 100,      // Specs are most important
      [DocumentCategory.WORKFLOW]: 90,   // Workflows are very important
      [DocumentCategory.SKILL]: 90,      // Skills are very important
      [DocumentCategory.CONFIG]: 80,     // Config files are important
      [DocumentCategory.DOCS]: 70,       // Documentation is moderately important
      [DocumentCategory.BACKLOG]: 50,    // Backlog items are less important
      [DocumentCategory.OTHER]: 30,      // Other files are least important
    };
    
    return categoryScores[category] || 30;
  }

  /**
   * Calculate penalty for duplicate documents
   * 
   * Duplicates should have lower importance
   * 
   * @param duplicateInfo - Duplicate detection information
   * @returns Penalty value (negative number to subtract from score)
   */
  private calculateDuplicatePenalty(duplicateInfo: DuplicateInfo): number {
    // If this is an exact duplicate of another document, apply heavy penalty
    if (duplicateInfo.duplicateOf) {
      return -50; // Reduce score by 50 points
    }
    
    // If this is similar to other documents, apply moderate penalty
    if (duplicateInfo.similarTo.length > 0) {
      // Penalty based on similarity score and number of similar documents
      const similarityPenalty = duplicateInfo.similarity * 20;
      const countPenalty = Math.min(duplicateInfo.similarTo.length * 5, 20);
      return -(similarityPenalty + countPenalty);
    }
    
    return 0; // No penalty
  }

  /**
   * Calculate total importance score from all factors
   * 
   * @param factors - Array of score factors
   * @returns Total score (0-100)
   */
  private calculateTotalScore(factors: ScoreFactor[]): number {
    // Sum all contributions
    let total = 0;
    for (const factor of factors) {
      total += factor.contribution;
    }
    
    // Ensure score is within bounds [0, 100]
    return Math.max(0, Math.min(100, total));
  }

  /**
   * Generate human-readable reasoning for the importance score
   * 
   * @param factors - Score factors
   * @param metadata - Document metadata
   * @param refNode - Reference graph node
   * @param duplicateInfo - Duplicate information
   * @returns Reasoning string
   */
  private generateReasoning(
    _factors: ScoreFactor[],
    metadata: DocumentMetadata,
    refNode: DocumentNode,
    duplicateInfo: DuplicateInfo
  ): string {
    const reasons: string[] = [];
    
    // Reference count reasoning
    if (refNode.incomingRefs > 0) {
      reasons.push(`${refNode.incomingRefs}個のドキュメントから参照されています`);
    } else {
      reasons.push('他のドキュメントから参照されていません');
    }
    
    // Recency reasoning
    const now = new Date();
    const ageInDays = Math.floor((now.getTime() - metadata.modifiedAt.getTime()) / (1000 * 60 * 60 * 24));
    if (ageInDays <= 7) {
      reasons.push('最近更新されました（7日以内）');
    } else if (ageInDays <= 30) {
      reasons.push('比較的最近更新されました（30日以内）');
    } else if (ageInDays <= 90) {
      reasons.push('しばらく更新されていません（90日以内）');
    } else if (ageInDays <= 365) {
      reasons.push('長期間更新されていません（1年以内）');
    } else {
      reasons.push(`非常に古いドキュメントです（${Math.floor(ageInDays / 365)}年以上前）`);
    }
    
    // Category reasoning
    const categoryNames: Record<DocumentCategory, string> = {
      [DocumentCategory.SPEC]: '仕様書',
      [DocumentCategory.WORKFLOW]: 'ワークフロー',
      [DocumentCategory.SKILL]: 'スキル',
      [DocumentCategory.CONFIG]: '設定ファイル',
      [DocumentCategory.DOCS]: 'ドキュメント',
      [DocumentCategory.BACKLOG]: 'バックログ',
      [DocumentCategory.OTHER]: 'その他',
    };
    reasons.push(`カテゴリ: ${categoryNames[metadata.category]}`);
    
    // Duplicate reasoning
    if (duplicateInfo.duplicateOf) {
      reasons.push(`重複ドキュメント（${duplicateInfo.duplicateOf}と同一）`);
    } else if (duplicateInfo.similarTo.length > 0) {
      reasons.push(`類似ドキュメントが${duplicateInfo.similarTo.length}個あります`);
    }
    
    return reasons.join('。') + '。';
  }
}

/**
 * StatusAssigner class
 * 
 * Responsible for assigning status to documents based on importance scores
 * and duplicate information
 * 
 * Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5
 */
export class StatusAssigner {
  private config: {
    thresholds: {
      necessary: number;
      unnecessary: number;
    };
  };

  /**
   * Create a new StatusAssigner
   * 
   * @param config - Configuration for thresholds (optional, uses defaults if not provided)
   */
  constructor(config?: {
    thresholds: {
      necessary: number;
      unnecessary: number;
    };
  }) {
    // Default thresholds if not provided
    this.config = config || {
      thresholds: {
        necessary: 60,
        unnecessary: 30,
      },
    };
  }

  /**
   * Assign status to a document based on its importance score and duplicate info
   * 
   * Status assignment rules:
   * - If document is an exact duplicate: UNNECESSARY
   * - If score >= necessary threshold: NECESSARY
   * - If score <= unnecessary threshold AND no incoming references: UNNECESSARY
   * - Otherwise: NEEDS_REVIEW
   * 
   * Validates: Requirements 6.1, 6.2, 6.3, 6.4
   * 
   * @param importance - Importance score for the document
   * @param duplicateInfo - Duplicate detection information
   * @param refNode - Reference graph node (for checking incoming references)
   * @returns Document status
   */
  assignStatus(
    importance: ImportanceScore,
    duplicateInfo: DuplicateInfo,
    refNode: DocumentNode
  ): DocumentStatus {
    // Rule 1: Exact duplicates are always unnecessary (Requirement 6.3)
    if (duplicateInfo.duplicateOf) {
      return DocumentStatus.UNNECESSARY;
    }

    // Rule 2: High importance score = necessary (Requirement 6.1)
    if (importance.score >= this.config.thresholds.necessary) {
      return DocumentStatus.NECESSARY;
    }

    // Rule 3: Low importance score AND no references = unnecessary (Requirement 6.2)
    if (
      importance.score <= this.config.thresholds.unnecessary &&
      refNode.incomingRefs === 0
    ) {
      return DocumentStatus.UNNECESSARY;
    }

    // Rule 4: Everything else needs review (Requirement 6.4)
    return DocumentStatus.NEEDS_REVIEW;
  }

  /**
   * Generate recommendation for action based on status and importance
   * 
   * @param status - Assigned document status
   * @param importance - Importance score
   * @param duplicateInfo - Duplicate detection information
   * @returns Recommendation string
   */
  generateRecommendation(
    status: DocumentStatus,
    _importance: ImportanceScore,
    duplicateInfo: DuplicateInfo
  ): string {
    switch (status) {
      case DocumentStatus.NECESSARY:
        return 'このドキュメントは保持することを推奨します。';

      case DocumentStatus.UNNECESSARY:
        if (duplicateInfo.duplicateOf) {
          return `このドキュメントは「${duplicateInfo.duplicateOf}」と重複しているため、削除またはアーカイブを推奨します。`;
        } else if (duplicateInfo.similarTo.length > 0) {
          return `このドキュメントは類似ドキュメントがあり、重要度が低いため、削除またはアーカイブを推奨します。`;
        } else {
          return 'このドキュメントは参照されておらず、重要度が低いため、削除またはアーカイブを推奨します。';
        }

      case DocumentStatus.NEEDS_REVIEW:
        if (duplicateInfo.similarTo.length > 0) {
          return `このドキュメントは類似ドキュメントがあります。内容を確認して、統合または削除を検討してください。`;
        } else {
          return 'このドキュメントの必要性を確認してください。内容を見直して、保持または削除を判断してください。';
        }

      default:
        return 'ステータスを確認してください。';
    }
  }
}
