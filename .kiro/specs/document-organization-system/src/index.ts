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

// Note: Implementation modules will be exported here as they are created
// export { ReferenceAnalyzer } from './analyzer';
// export { ImportanceEvaluator, DuplicateChecker, StatusAssigner } from './evaluator';
// export { ReportGenerator } from './reporter';
