/**
 * Document Organization System
 * Main entry point
 */

// Export all types
export * from './types';

// Export implemented modules
export { ConfigManager } from './config';
export { Scanner } from './scanner';
export { MetadataCollector } from './metadata';
export { ReferenceAnalyzer } from './analyzer';

// Note: Implementation modules will be exported here as they are created
// export { ImportanceEvaluator, DuplicateChecker, StatusAssigner } from './evaluator';
// export { ReportGenerator } from './reporter';
