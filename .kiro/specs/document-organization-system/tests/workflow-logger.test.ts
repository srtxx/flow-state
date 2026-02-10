/**
 * Unit tests for WorkflowLogger
 * 
 * Tests workflow logging functionality including:
 * - Log entry creation with timestamps
 * - Different log levels
 * - File-based audit trail
 * - Step logging
 * - Workflow completion logging
 * 
 * Requirements: 12.5
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import { WorkflowLogger, LogLevel } from '../src/workflow-logger.js';

describe('WorkflowLogger', () => {
  let testDir: string;
  let logger: WorkflowLogger;

  beforeEach(async () => {
    // Create a temporary test directory
    testDir = path.join(process.cwd(), 'test-temp', `test-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });
    
    // Create logger without console output for tests
    logger = new WorkflowLogger(false);
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('Initialization', () => {
    it('should initialize with a log file path', async () => {
      const logFilePath = await logger.initialize(testDir);
      
      expect(logFilePath).toBeDefined();
      expect(logFilePath).toContain('.kiro/logs');
      expect(logFilePath).toContain('document-organization-');
      expect(logFilePath).toContain('.log');
      
      // Verify log file was created
      const fileExists = await fs.access(logFilePath).then(() => true).catch(() => false);
      expect(fileExists).toBe(true);
    });

    it('should create log directory if it does not exist', async () => {
      const logFilePath = await logger.initialize(testDir);
      const logDir = path.dirname(logFilePath);
      
      // Verify directory exists
      const dirExists = await fs.access(logDir).then(() => true).catch(() => false);
      expect(dirExists).toBe(true);
    });

    it('should write initial log entry on initialization', async () => {
      await logger.initialize(testDir);
      const entries = logger.getEntries();
      
      expect(entries.length).toBeGreaterThan(0);
      expect(entries[0].action).toBe('Workflow Start');
      expect(entries[0].level).toBe(LogLevel.INFO);
    });
  });

  describe('Log Levels', () => {
    beforeEach(async () => {
      await logger.initialize(testDir);
    });

    it('should log info-level messages', async () => {
      await logger.info('Test Action', 'Test info message');
      
      const entries = logger.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      expect(lastEntry.level).toBe(LogLevel.INFO);
      expect(lastEntry.action).toBe('Test Action');
      expect(lastEntry.message).toBe('Test info message');
    });

    it('should log warning-level messages', async () => {
      await logger.warning('Test Action', 'Test warning message');
      
      const entries = logger.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      expect(lastEntry.level).toBe(LogLevel.WARNING);
      expect(lastEntry.action).toBe('Test Action');
      expect(lastEntry.message).toBe('Test warning message');
    });

    it('should log error-level messages', async () => {
      await logger.error('Test Action', 'Test error message');
      
      const entries = logger.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      expect(lastEntry.level).toBe(LogLevel.ERROR);
      expect(lastEntry.action).toBe('Test Action');
      expect(lastEntry.message).toBe('Test error message');
    });

    it('should log debug-level messages', async () => {
      await logger.debug('Test Action', 'Test debug message');
      
      const entries = logger.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      expect(lastEntry.level).toBe(LogLevel.DEBUG);
      expect(lastEntry.action).toBe('Test Action');
      expect(lastEntry.message).toBe('Test debug message');
    });
  });

  describe('Log Entry Data', () => {
    beforeEach(async () => {
      await logger.initialize(testDir);
    });

    it('should include timestamp in log entries', async () => {
      const beforeTime = new Date();
      await logger.info('Test Action', 'Test message');
      const afterTime = new Date();
      
      const entries = logger.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      expect(lastEntry.timestamp).toBeInstanceOf(Date);
      expect(lastEntry.timestamp.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(lastEntry.timestamp.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });

    it('should include optional data in log entries', async () => {
      const testData = { count: 42, name: 'test' };
      await logger.info('Test Action', 'Test message', testData);
      
      const entries = logger.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      expect(lastEntry.data).toEqual(testData);
    });

    it('should handle log entries without data', async () => {
      await logger.info('Test Action', 'Test message');
      
      const entries = logger.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      expect(lastEntry.data).toBeUndefined();
    });
  });

  describe('Step Logging', () => {
    beforeEach(async () => {
      await logger.initialize(testDir);
    });

    it('should log step start', async () => {
      await logger.stepStart(1, 'Test Step', 'Testing step start');
      
      const entries = logger.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      expect(lastEntry.level).toBe(LogLevel.INFO);
      expect(lastEntry.action).toBe('Step 1: Test Step');
      expect(lastEntry.message).toContain('Started');
      expect(lastEntry.message).toContain('Testing step start');
    });

    it('should log step completion', async () => {
      const resultData = { itemsProcessed: 10 };
      await logger.stepComplete(2, 'Test Step', 'Processed 10 items', resultData);
      
      const entries = logger.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      expect(lastEntry.level).toBe(LogLevel.INFO);
      expect(lastEntry.action).toBe('Step 2: Test Step');
      expect(lastEntry.message).toContain('Completed');
      expect(lastEntry.message).toContain('Processed 10 items');
      expect(lastEntry.data).toEqual(resultData);
    });

    it('should log step errors', async () => {
      const errorData = { errorCode: 'ERR001' };
      await logger.stepError(3, 'Test Step', 'Something went wrong', errorData);
      
      const entries = logger.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      expect(lastEntry.level).toBe(LogLevel.ERROR);
      expect(lastEntry.action).toBe('Step 3: Test Step');
      expect(lastEntry.message).toContain('Failed');
      expect(lastEntry.message).toContain('Something went wrong');
      expect(lastEntry.data).toEqual(errorData);
    });
  });

  describe('Workflow Completion', () => {
    beforeEach(async () => {
      await logger.initialize(testDir);
    });

    it('should log successful workflow completion', async () => {
      await logger.complete(true, 'All tasks completed');
      
      const entries = logger.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      expect(lastEntry.level).toBe(LogLevel.INFO);
      expect(lastEntry.action).toBe('Workflow Complete');
      expect(lastEntry.message).toContain('Successfully completed');
      expect(lastEntry.message).toContain('All tasks completed');
      expect(lastEntry.data?.success).toBe(true);
    });

    it('should log failed workflow completion', async () => {
      await logger.complete(false, 'Task failed');
      
      const entries = logger.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      expect(lastEntry.level).toBe(LogLevel.ERROR);
      expect(lastEntry.action).toBe('Workflow Complete');
      expect(lastEntry.message).toContain('Failed');
      expect(lastEntry.message).toContain('Task failed');
      expect(lastEntry.data?.success).toBe(false);
    });

    it('should include duration in completion log', async () => {
      // Wait a bit to ensure duration is measurable
      await new Promise(resolve => setTimeout(resolve, 10));
      await logger.complete(true, 'Done');
      
      const entries = logger.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      expect(lastEntry.data?.duration).toBeDefined();
      expect(typeof lastEntry.data?.duration).toBe('string');
    });
  });

  describe('File Writing', () => {
    beforeEach(async () => {
      await logger.initialize(testDir);
    });

    it('should write log entries to file', async () => {
      await logger.info('Action 1', 'Message 1');
      await logger.info('Action 2', 'Message 2');
      
      const logFilePath = logger.getLogFilePath();
      expect(logFilePath).not.toBeNull();
      
      if (logFilePath) {
        const content = await fs.readFile(logFilePath, 'utf-8');
        expect(content).toContain('Action 1');
        expect(content).toContain('Message 1');
        expect(content).toContain('Action 2');
        expect(content).toContain('Message 2');
      }
    });

    it('should format log entries with timestamps', async () => {
      await logger.info('Test Action', 'Test message');
      
      const logFilePath = logger.getLogFilePath();
      if (logFilePath) {
        const content = await fs.readFile(logFilePath, 'utf-8');
        
        // Check for timestamp format [YYYY-MM-DD HH:MM:SS]
        expect(content).toMatch(/\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\]/);
      }
    });

    it('should include log level in file output', async () => {
      await logger.info('Test Action', 'Info message');
      await logger.warning('Test Action', 'Warning message');
      await logger.error('Test Action', 'Error message');
      
      const logFilePath = logger.getLogFilePath();
      if (logFilePath) {
        const content = await fs.readFile(logFilePath, 'utf-8');
        
        expect(content).toContain('INFO');
        expect(content).toContain('WARNING');
        expect(content).toContain('ERROR');
      }
    });
  });

  describe('Export Functions', () => {
    beforeEach(async () => {
      await logger.initialize(testDir);
      await logger.info('Action 1', 'Message 1', { data: 'value1' });
      await logger.warning('Action 2', 'Message 2', { data: 'value2' });
    });

    it('should export logs as JSON', () => {
      const json = logger.exportAsJSON();
      const parsed = JSON.parse(json);
      
      expect(parsed.workflowStartTime).toBeDefined();
      expect(parsed.entries).toBeInstanceOf(Array);
      expect(parsed.entries.length).toBeGreaterThan(0);
      
      const firstEntry = parsed.entries[0];
      expect(firstEntry.timestamp).toBeDefined();
      expect(firstEntry.level).toBeDefined();
      expect(firstEntry.action).toBeDefined();
      expect(firstEntry.message).toBeDefined();
    });

    it('should export logs as text', () => {
      const text = logger.exportAsText();
      
      expect(text).toContain('Action 1');
      expect(text).toContain('Message 1');
      expect(text).toContain('Action 2');
      expect(text).toContain('Message 2');
      expect(text).toContain('INFO');
      expect(text).toContain('WARNING');
    });
  });

  describe('Entry Retrieval', () => {
    beforeEach(async () => {
      await logger.initialize(testDir);
    });

    it('should return all log entries', async () => {
      await logger.info('Action 1', 'Message 1');
      await logger.info('Action 2', 'Message 2');
      await logger.info('Action 3', 'Message 3');
      
      const entries = logger.getEntries();
      
      // Should have at least 4 entries (1 initialization + 3 manual)
      expect(entries.length).toBeGreaterThanOrEqual(4);
    });

    it('should return a copy of entries array', async () => {
      await logger.info('Action 1', 'Message 1');
      
      const entries1 = logger.getEntries();
      const entries2 = logger.getEntries();
      
      // Should be different array instances
      expect(entries1).not.toBe(entries2);
      // But with same content
      expect(entries1).toEqual(entries2);
    });
  });

  describe('Audit Trail', () => {
    it('should create a complete audit trail for a workflow', async () => {
      await logger.initialize(testDir);
      
      // Simulate a workflow
      await logger.stepStart(1, 'Configuration', 'Loading config');
      await logger.stepComplete(1, 'Configuration', 'Config loaded', { configFile: 'default' });
      
      await logger.stepStart(2, 'Scan', 'Scanning documents');
      await logger.stepComplete(2, 'Scan', 'Found 10 documents', { count: 10 });
      
      await logger.stepStart(3, 'Analysis', 'Analyzing documents');
      await logger.warning('Analysis', 'Skipped 1 unreadable file');
      await logger.stepComplete(3, 'Analysis', 'Analysis complete', { analyzed: 9 });
      
      await logger.complete(true, 'Workflow completed successfully');
      
      const entries = logger.getEntries();
      
      // Verify we have all expected entries
      expect(entries.length).toBeGreaterThanOrEqual(8);
      
      // Verify entries are in chronological order
      for (let i = 1; i < entries.length; i++) {
        expect(entries[i].timestamp.getTime()).toBeGreaterThanOrEqual(
          entries[i - 1].timestamp.getTime()
        );
      }
      
      // Verify log file contains all entries
      const logFilePath = logger.getLogFilePath();
      if (logFilePath) {
        const content = await fs.readFile(logFilePath, 'utf-8');
        
        expect(content).toContain('Configuration');
        expect(content).toContain('Scan');
        expect(content).toContain('Analysis');
        expect(content).toContain('Workflow Complete');
        expect(content).toContain('Successfully completed');
      }
    });
  });
});
