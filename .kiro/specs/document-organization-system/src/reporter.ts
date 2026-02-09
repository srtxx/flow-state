/**
 * Report Generator
 * 
 * Generates markdown reports for document organization analysis.
 * 
 * Requirements:
 * - 7.1: Create Organization_Report in markdown format
 * - 7.2: Group documents by Status
 * - 7.3: Include metadata for each document
 * - 7.4: Include importance score and reasoning
 * - 7.5: Save report to file in workspace root
 * - 8.1: Include deletion recommendations for unnecessary documents
 * - 8.2: Provide reasons for deletion recommendations
 * - 8.3: Suggest archive directory for backup
 * - 8.4: Provide command examples for moving/deleting files
 * - 8.5: Include summary count of documents by status
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import {
  OrganizationReport,
  DocumentWithStatus,
  DocumentStatus,
  ReportSummary,
  ErrorInfo,
  OutputConfig,
} from './types.js';

/**
 * Generates organization reports in markdown format
 */
export class ReportGenerator {
  /**
   * Generate a complete organization report
   * 
   * @param documents - Documents with status and analysis results
   * @param errors - Errors encountered during analysis
   * @param workspacePath - Path to the workspace being analyzed
   * @returns Complete organization report
   */
  generate(
    documents: DocumentWithStatus[],
    errors: ErrorInfo[],
    workspacePath: string
  ): OrganizationReport {
    // Group documents by status
    const documentsByStatus = new Map<DocumentStatus, DocumentWithStatus[]>();
    documentsByStatus.set(DocumentStatus.NECESSARY, []);
    documentsByStatus.set(DocumentStatus.UNNECESSARY, []);
    documentsByStatus.set(DocumentStatus.NEEDS_REVIEW, []);

    for (const doc of documents) {
      const statusDocs = documentsByStatus.get(doc.status) || [];
      statusDocs.push(doc);
      documentsByStatus.set(doc.status, statusDocs);
    }

    // Calculate summary statistics
    const summary: ReportSummary = {
      totalDocuments: documents.length,
      necessaryCount: documentsByStatus.get(DocumentStatus.NECESSARY)?.length || 0,
      unnecessaryCount: documentsByStatus.get(DocumentStatus.UNNECESSARY)?.length || 0,
      needsReviewCount: documentsByStatus.get(DocumentStatus.NEEDS_REVIEW)?.length || 0,
      duplicatesFound: documents.filter(d => 
        d.recommendation.includes('duplicate') || d.recommendation.includes('重複')
      ).length,
      totalSizeBytes: documents.reduce((sum, d) => sum + d.metadata.sizeBytes, 0),
    };

    return {
      generatedAt: new Date(),
      workspacePath,
      summary,
      documentsByStatus,
      errors,
    };
  }

  /**
   * Convert report to markdown format
   * 
   * @param report - Organization report to convert
   * @param config - Output configuration
   * @returns Markdown-formatted report
   */
  toMarkdown(report: OrganizationReport, config: OutputConfig): string {
    const sections: string[] = [];

    // Header
    sections.push('# Document Organization Report\n');
    sections.push(`Generated: ${report.generatedAt.toISOString()}\n`);
    sections.push(`Workspace: ${report.workspacePath}\n`);
    sections.push('---\n');

    // Summary section
    sections.push(this.generateSummary(report));

    // Status sections
    sections.push(this.generateStatusSection(
      DocumentStatus.NECESSARY,
      report.documentsByStatus.get(DocumentStatus.NECESSARY) || [],
      config
    ));

    sections.push(this.generateStatusSection(
      DocumentStatus.NEEDS_REVIEW,
      report.documentsByStatus.get(DocumentStatus.NEEDS_REVIEW) || [],
      config
    ));

    sections.push(this.generateStatusSection(
      DocumentStatus.UNNECESSARY,
      report.documentsByStatus.get(DocumentStatus.UNNECESSARY) || [],
      config
    ));

    // Deletion recommendations
    const unnecessaryDocs = report.documentsByStatus.get(DocumentStatus.UNNECESSARY) || [];
    if (unnecessaryDocs.length > 0) {
      sections.push(this.generateDeletionRecommendations(unnecessaryDocs));
    }

    // Error section
    if (report.errors.length > 0) {
      sections.push(this.generateErrorSection(report.errors));
    }

    return sections.join('\n');
  }

  /**
   * Write report to file
   * 
   * @param report - Organization report
   * @param config - Output configuration
   * @param workspacePath - Workspace root path
   */
  async writeToFile(
    report: OrganizationReport,
    config: OutputConfig,
    workspacePath: string
  ): Promise<void> {
    const markdown = this.toMarkdown(report, config);
    const outputPath = path.join(workspacePath, config.outputPath);
    
    try {
      await fs.writeFile(outputPath, markdown, 'utf-8');
    } catch (error) {
      throw new Error(
        `Failed to write report to ${outputPath}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Generate summary section
   * 
   * @param report - Organization report
   * @returns Markdown summary section
   */
  private generateSummary(report: OrganizationReport): string {
    const { summary } = report;
    const sections: string[] = [];

    sections.push('## Summary\n');
    sections.push(`- **Total Documents**: ${summary.totalDocuments}`);
    sections.push(`- **Necessary (必要)**: ${summary.necessaryCount}`);
    sections.push(`- **Needs Review (要確認)**: ${summary.needsReviewCount}`);
    sections.push(`- **Unnecessary (不要)**: ${summary.unnecessaryCount}`);
    sections.push(`- **Duplicates Found**: ${summary.duplicatesFound}`);
    sections.push(`- **Total Size**: ${this.formatBytes(summary.totalSizeBytes)}\n`);

    return sections.join('\n');
  }

  /**
   * Generate status section for a specific status
   * 
   * @param status - Document status
   * @param documents - Documents with this status
   * @param config - Output configuration
   * @returns Markdown status section
   */
  private generateStatusSection(
    status: DocumentStatus,
    documents: DocumentWithStatus[],
    config: OutputConfig
  ): string {
    if (documents.length === 0) {
      return '';
    }

    const sections: string[] = [];
    sections.push(`## ${status} Documents (${documents.length})\n`);

    // Sort by importance score (descending)
    const sortedDocs = [...documents].sort((a, b) => b.importance.score - a.importance.score);

    for (const doc of sortedDocs) {
      sections.push(`### ${doc.metadata.path}\n`);
      sections.push(`**Status**: ${doc.status}`);
      sections.push(`**Importance Score**: ${doc.importance.score.toFixed(1)}/100\n`);

      if (config.includeMetadata) {
        sections.push('**Metadata**:');
        sections.push(`- Category: ${doc.metadata.category}`);
        sections.push(`- Size: ${this.formatBytes(doc.metadata.sizeBytes)}`);
        sections.push(`- Lines: ${doc.metadata.lineCount}`);
        sections.push(`- Modified: ${doc.metadata.modifiedAt.toISOString()}`);
        sections.push(`- Created: ${doc.metadata.createdAt.toISOString()}\n`);
      }

      if (config.includeReasoningDetails) {
        sections.push('**Reasoning**:');
        sections.push(doc.importance.reasoning + '\n');

        sections.push('**Score Factors**:');
        for (const factor of doc.importance.factors) {
          sections.push(
            `- ${factor.name}: ${factor.value.toFixed(2)} (weight: ${factor.weight.toFixed(2)}, contribution: ${factor.contribution.toFixed(2)})`
          );
        }
        sections.push('');
      }

      sections.push(`**Recommendation**: ${doc.recommendation}\n`);
      sections.push('---\n');
    }

    return sections.join('\n');
  }

  /**
   * Generate deletion recommendations section
   * 
   * @param unnecessaryDocs - Documents marked as unnecessary
   * @returns Markdown deletion recommendations section
   */
  private generateDeletionRecommendations(unnecessaryDocs: DocumentWithStatus[]): string {
    const sections: string[] = [];

    sections.push('## Deletion Recommendations\n');
    sections.push(`Found ${unnecessaryDocs.length} documents that can be safely removed.\n`);

    sections.push('### Archive Strategy\n');
    sections.push('Before deleting, consider creating an archive for backup:\n');
    sections.push('```bash');
    sections.push('# Create archive directory');
    sections.push('mkdir -p .archive/documents-$(date +%Y%m%d)');
    sections.push('```\n');

    sections.push('### Files to Remove\n');
    for (const doc of unnecessaryDocs) {
      sections.push(`#### ${doc.metadata.path}\n`);
      sections.push(`**Reason**: ${doc.recommendation}\n`);
      sections.push('**Commands**:');
      sections.push('```bash');
      sections.push(`# Archive the file`);
      sections.push(`mv "${doc.metadata.path}" .archive/documents-$(date +%Y%m%d)/`);
      sections.push('');
      sections.push('# Or delete directly (use with caution)');
      sections.push(`rm "${doc.metadata.path}"`);
      sections.push('```\n');
    }

    sections.push('### Batch Operations\n');
    sections.push('To archive all unnecessary documents at once:\n');
    sections.push('```bash');
    sections.push('# Create archive directory');
    sections.push('mkdir -p .archive/documents-$(date +%Y%m%d)\n');
    sections.push('# Archive files (review the list first!)');
    for (const doc of unnecessaryDocs) {
      sections.push(`mv "${doc.metadata.path}" .archive/documents-$(date +%Y%m%d)/`);
    }
    sections.push('```\n');

    sections.push('**⚠️ Warning**: Always review files before deletion. This tool provides recommendations but cannot guarantee that files are truly unnecessary for your specific use case.\n');

    return sections.join('\n');
  }

  /**
   * Generate error section
   * 
   * @param errors - Errors encountered during analysis
   * @returns Markdown error section
   */
  private generateErrorSection(errors: ErrorInfo[]): string {
    const sections: string[] = [];

    sections.push('## Errors and Warnings\n');
    sections.push(`Encountered ${errors.length} issues during analysis:\n`);

    // Group by severity
    const errorsByType = errors.reduce((acc, err) => {
      if (!acc[err.severity]) {
        acc[err.severity] = [];
      }
      acc[err.severity].push(err);
      return acc;
    }, {} as Record<string, ErrorInfo[]>);

    if (errorsByType.error) {
      sections.push('### Errors\n');
      for (const err of errorsByType.error) {
        sections.push(`- **${err.path}**: ${err.error}`);
        sections.push(`  - Time: ${err.timestamp.toISOString()}\n`);
      }
    }

    if (errorsByType.warning) {
      sections.push('### Warnings\n');
      for (const err of errorsByType.warning) {
        sections.push(`- **${err.path}**: ${err.error}`);
        sections.push(`  - Time: ${err.timestamp.toISOString()}\n`);
      }
    }

    return sections.join('\n');
  }

  /**
   * Format bytes to human-readable string
   * 
   * @param bytes - Number of bytes
   * @returns Formatted string (e.g., "1.5 KB")
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }
}
