import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  DocumentCategory,
  DocumentStatus,
  ReferenceType,
  ImportanceFactors,
} from '../src/types';

describe('Project Setup', () => {
  it('should have vitest configured correctly', () => {
    expect(true).toBe(true);
  });

  it('should have fast-check configured correctly', () => {
    fc.assert(
      fc.property(fc.integer(), (n) => {
        return n === n;
      })
    );
  });

  it('should be able to import types', () => {
    expect(DocumentCategory.SPEC).toBe('spec');
    expect(DocumentStatus.NECESSARY).toBe('必要');
    expect(ReferenceType.MARKDOWN_LINK).toBe('markdown_link');
    expect(ImportanceFactors.REFERENCE_COUNT).toBe('reference_count');
  });
});
