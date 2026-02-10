/**
 * Workflow Logger
 * Logs all workflow actions with timestamps for audit purposes
 * 
 * Requirements: 12.5 - Log all workflow actions for audit purposes
 */

import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Log level for workflow actions
 */
export enum LogLevel {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG',
}

/**
 * A single log entry
 */
export interface LogEntry {
  /** Timestamp when the action occurred */
  timestamp: Date;
  /** Log level */
  level: LogLevel;
  /** Action or step name */
  action: string;
  /** Detailed message */
  message: string;
  /** Optional additional data */
  data?: Record<string, unknown>;
}

/**
 * Workflow Logger
 * 
 * Provides logging functionality for workflow execution with:
 * - Timestamped log entries
 * - Multiple log levels
 * - File-based audit trail
 * - Console output (optional)
 * 
 * Requirements: 12.5
 */
export class WorkflowLogger {
  private entries: LogEntry[] = [];
  private logFilePath: string | null = null;
  private consoleOutput: boolean;
  private workflowStartTime: Date;

  /**
   * Create a new workflow logger
   * 
   * @param consoleOutput - Whether to output logs to console (default: true)
   */
  constructor(consoleOutput: boolean = true) {
    this.consoleOutput = consoleOutput;
    this.workflowStartTime = new Date();
  }

  /**
   * Initialize the logger with a log file path
   * Creates the log directory if it doesn't exist
   * 
   * @param workspacePath - Workspace root path
   * @returns Promise resolving to the log file path
   */
  async initialize(workspacePath: string): Promise<string> {
    // Create log directory
    const logDir = path.join(workspacePath, '.kiro', 'logs');
    await fs.mkdir(logDir, { recursive: true });

    // Generate log file name with timestamp
    const timestamp = this.formatTimestampForFilename(this.workflowStartTime);
    const logFileName = `document-organization-${timestamp}.log`;
    this.logFilePath = path.join(logDir, logFileName);

    // Write initial log entry
    await this.log(
      LogLevel.INFO,
      'Workflow Start',
      'Document organization workflow started'
    );

    return this.logFilePath;
  }

  /**
   * Log an info-level action
   * 
   * @param action - Action name
   * @param message - Log message
   * @param data - Optional additional data
   */
  async info(action: string, message: string, data?: Record<string, unknown>): Promise<void> {
    await this.log(LogLevel.INFO, action, message, data);
  }

  /**
   * Log a warning-level action
   * 
   * @param action - Action name
   * @param message - Log message
   * @param data - Optional additional data
   */
  async warning(action: string, message: string, data?: Record<string, unknown>): Promise<void> {
    await this.log(LogLevel.WARNING, action, message, data);
  }

  /**
   * Log an error-level action
   * 
   * @param action - Action name
   * @param message - Log message
   * @param data - Optional additional data
   */
  async error(action: string, message: string, data?: Record<string, unknown>): Promise<void> {
    await this.log(LogLevel.ERROR, action, message, data);
  }

  /**
   * Log a debug-level action
   * 
   * @param action - Action name
   * @param message - Log message
   * @param data - Optional additional data
   */
  async debug(action: string, message: string, data?: Record<string, unknown>): Promise<void> {
    await this.log(LogLevel.DEBUG, action, message, data);
  }

  /**
   * Log a workflow action with timestamp
   * 
   * @param level - Log level
   * @param action - Action name
   * @param message - Log message
   * @param data - Optional additional data
   */
  async log(
    level: LogLevel,
    action: string,
    message: string,
    data?: Record<string, unknown>
  ): Promise<void> {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      action,
      message,
      data,
    };

    // Add to in-memory entries
    this.entries.push(entry);

    // Format log line
    const logLine = this.formatLogEntry(entry);

    // Output to console if enabled
    if (this.consoleOutput) {
      this.outputToConsole(level, logLine);
    }

    // Write to file if initialized
    if (this.logFilePath) {
      try {
        await fs.appendFile(this.logFilePath, logLine + '\n', 'utf-8');
      } catch (error) {
        // If we can't write to log file, at least output to console
        console.error(`Failed to write to log file: ${error}`);
      }
    }
  }

  /**
   * Log the start of a workflow step
   * 
   * @param stepNumber - Step number
   * @param stepName - Step name
   * @param description - Step description
   */
  async stepStart(stepNumber: number, stepName: string, description: string): Promise<void> {
    await this.info(
      `Step ${stepNumber}: ${stepName}`,
      `Started - ${description}`
    );
  }

  /**
   * Log the completion of a workflow step
   * 
   * @param stepNumber - Step number
   * @param stepName - Step name
   * @param result - Result description
   * @param data - Optional result data
   */
  async stepComplete(
    stepNumber: number,
    stepName: string,
    result: string,
    data?: Record<string, unknown>
  ): Promise<void> {
    await this.info(
      `Step ${stepNumber}: ${stepName}`,
      `Completed - ${result}`,
      data
    );
  }

  /**
   * Log the failure of a workflow step
   * 
   * @param stepNumber - Step number
   * @param stepName - Step name
   * @param errorMessage - Error message
   * @param data - Optional error data
   */
  async stepError(
    stepNumber: number,
    stepName: string,
    errorMessage: string,
    data?: Record<string, unknown>
  ): Promise<void> {
    await this.error(
      `Step ${stepNumber}: ${stepName}`,
      `Failed - ${errorMessage}`,
      data
    );
  }

  /**
   * Log workflow completion
   * 
   * @param success - Whether workflow completed successfully
   * @param summary - Summary of results
   */
  async complete(success: boolean, summary: string): Promise<void> {
    const duration = Date.now() - this.workflowStartTime.getTime();
    const durationStr = this.formatDuration(duration);

    await this.log(
      success ? LogLevel.INFO : LogLevel.ERROR,
      'Workflow Complete',
      `${success ? 'Successfully completed' : 'Failed'} - ${summary}`,
      {
        success,
        duration: durationStr,
        totalEntries: this.entries.length,
      }
    );
  }

  /**
   * Get all log entries
   * 
   * @returns Array of log entries
   */
  getEntries(): LogEntry[] {
    return [...this.entries];
  }

  /**
   * Get the log file path
   * 
   * @returns Log file path or null if not initialized
   */
  getLogFilePath(): string | null {
    return this.logFilePath;
  }

  /**
   * Export logs as JSON
   * 
   * @returns JSON string of all log entries
   */
  exportAsJSON(): string {
    return JSON.stringify(
      {
        workflowStartTime: this.workflowStartTime,
        entries: this.entries,
      },
      null,
      2
    );
  }

  /**
   * Export logs as plain text
   * 
   * @returns Plain text representation of all log entries
   */
  exportAsText(): string {
    return this.entries.map(entry => this.formatLogEntry(entry)).join('\n');
  }

  /**
   * Format a log entry as a string
   * 
   * @param entry - Log entry
   * @returns Formatted log string
   */
  private formatLogEntry(entry: LogEntry): string {
    const timestamp = this.formatTimestamp(entry.timestamp);
    const level = entry.level.padEnd(7);
    const action = entry.action.padEnd(30);
    let line = `[${timestamp}] ${level} ${action} ${entry.message}`;

    // Add data if present
    if (entry.data && Object.keys(entry.data).length > 0) {
      line += ` | ${JSON.stringify(entry.data)}`;
    }

    return line;
  }

  /**
   * Format timestamp for display
   * 
   * @param date - Date to format
   * @returns Formatted timestamp string (YYYY-MM-DD HH:MM:SS)
   */
  private formatTimestamp(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  /**
   * Format timestamp for filename
   * 
   * @param date - Date to format
   * @returns Formatted timestamp string (YYYYMMDD-HHMMSS)
   */
  private formatTimestampForFilename(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}${month}${day}-${hours}${minutes}${seconds}`;
  }

  /**
   * Format duration in milliseconds to human-readable string
   * 
   * @param ms - Duration in milliseconds
   * @returns Formatted duration string
   */
  private formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Output log to console with appropriate formatting
   * 
   * @param level - Log level
   * @param message - Log message
   */
  private outputToConsole(level: LogLevel, message: string): void {
    switch (level) {
      case LogLevel.ERROR:
        console.error(message);
        break;
      case LogLevel.WARNING:
        console.warn(message);
        break;
      case LogLevel.DEBUG:
        // Only output debug in verbose mode (check NODE_ENV or similar)
        if (process.env.DEBUG || process.env.VERBOSE) {
          console.debug(message);
        }
        break;
      case LogLevel.INFO:
      default:
        console.log(message);
        break;
    }
  }
}
