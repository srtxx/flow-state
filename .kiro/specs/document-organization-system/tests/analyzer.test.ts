/**
 * Unit tests for ReferenceAnalyzer
 * 
 * Tests:
 * - Markdown link extraction
 * - File path reference extraction
 * - Reference graph construction
 * - Incoming reference counting
 * - Edge cases (broken links, circular references, relative paths)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { ReferenceAnalyzer } from '../src/analyzer.js';
import { DocumentMetadata, DocumentCategory, ReferenceType } from '../src/types.js';

describe('ReferenceAnalyzer', () => {
  let analyzer: ReferenceAnalyzer;
  let tempDir: string;

  beforeEach(async () => {
    analyzer = new ReferenceAnalyzer();
    // Create a temporary directory for test files
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'analyzer-test-'));
  });

  afterEach(async () => {
    // Clean up temporary directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('Markdown Link Extraction', () => {
    it('should extract markdown links from content', async () => {
      // Create test files
      const doc1Path = 'doc1.md';
      const doc2Path = 'doc2.md';
      
      await fs.writeFile(
        path.join(tempDir, doc1Path),
        'This is a [link to doc2](./doc2.md) in the same directory.'
      );
      await fs.writeFile(path.join(tempDir, doc2Path), 'Content of doc2');

      const documents: DocumentMetadata[] = [
        {
          path: doc1Path,
          createdAt: new Date(),
          modifiedAt: new Date(),
          sizeBytes: 100,
          lineCount: 1,
          category: DocumentCategory.OTHER,
        },
        {
          path: doc2Path,
          createdAt: new Date(),
          modifiedAt: new Date(),
          sizeBytes: 50,
          lineCount: 1,
          category: DocumentCategory.OTHER,
        },
      ];

      const graph = await analyzer.analyze(documents, tempDir);

      expect(graph.references).toHaveLength(1);
      expect(graph.references[0]).toMatchObject({
        sourcePath: doc1Path,
        targetPath: doc2Path,
        referenceType: ReferenceType.MARKDOWN_LINK,
      });
    });

    it('should skip external URLs in markdown links', async () => {
      const docPath = 'doc.md';
      
      await fs.writeFile(
        path.join(tempDir, docPath),
        'External link: [Google](https://google.com) and [HTTP](http://example.com)'
      );

      const documents: DocumentMetadata[] = [
        {
          path: docPath,
          createdAt: new Date(),
          modifiedAt: new Date(),
          sizeBytes: 100,
          lineCount: 1,
          category: DocumentCategory.OTHER,
        },
      ];

      const graph = await analyzer.analyze(documents, tempDir);

      expect(graph.references).toHaveLength(0);
    });

    it('should handle markdown links with anchors', async () => {
      const doc1Path = 'doc1.md';
      const doc2Path = 'doc2.md';
      
      await fs.writeFile(
        path.join(tempDir, doc1Path),
        'Link with anchor: [Section](./doc2.md#section-name)'
      );
      await fs.writeFile(path.join(tempDir, doc2Path), 'Content');

      const documents: DocumentMetadata[] = [
        {
          path: doc1Path,
          createdAt: new Date(),
          modifiedAt: new Date(),
          sizeBytes: 100,
          lineCount: 1,
          category: DocumentCategory.OTHER,
        },
        {
          path: doc2Path,
          createdAt: new Date(),
          modifiedAt: new Date(),
          sizeBytes: 50,
          lineCount: 1,
          category: DocumentCategory.OTHER,
        },
      ];

      const graph = await analyzer.analyze(documents, tempDir);

      expect(graph.references).toHaveLength(1);
      expect(graph.references[0].targetPath).toBe(doc2Path);
    });
  });

  describe('File Path Reference Extraction', () => {
    it('should extract file path references from content', async () => {
      const doc1Path = 'doc1.md';
      const doc2Path = 'subdir/doc2.md';
      
      // Create subdirectory
      await fs.mkdir(path.join(tempDir, 'subdir'), { recursive: true });
      
      await fs.writeFile(
        path.join(tempDir, doc1Path),
        'See the file at subdir/doc2.md for more details.'
      );
      await fs.writeFile(path.join(tempDir, doc2Path), 'Details here');

      const documents: DocumentMetadata[] = [
        {
          path: doc1Path,
          createdAt: new Date(),
          modifiedAt: new Date(),
          sizeBytes: 100,
          lineCount: 1,
          category: DocumentCategory.OTHER,
        },
        {
          path: 'subdir/doc2.md',
          createdAt: new Date(),
          modifiedAt: new Date(),
          sizeBytes: 50,
          lineCount: 1,
          category: DocumentCategory.OTHER,
        },
      ];

      const graph = await analyzer.analyze(documents, tempDir);

      // Should find at least the file path reference
      const filePathRefs = graph.references.filter(
        ref => ref.referenceType === ReferenceType.FILE_PATH
      );
      expect(filePathRefs.length).toBeGreaterThan(0);
    });

    it('should handle relative path references', async () => {
      const doc1Path = 'subdir/doc1.md';
      const doc2Path = 'doc2.md';
      
      await fs.mkdir(path.join(tempDir, 'subdir'), { recursive: true });
      
      await fs.writeFile(
        path.join(tempDir, doc1Path),
        'Parent directory file: ../doc2.md'
      );
      await fs.writeFile(path.join(tempDir, doc2Path), 'Content');

      const documents: DocumentMetadata[] = [
        {
          path: 'subdir/doc1.md',
          createdAt: new Date(),
          modifiedAt: new Date(),
          sizeBytes: 100,
          lineCount: 1,
          category: DocumentCategory.OTHER,
        },
        {
          path: doc2Path,
          createdAt: new Date(),
          modifiedAt: new Date(),
          sizeBytes: 50,
          lineCount: 1,
          category: DocumentCategory.OTHER,
        },
      ];

      const graph = await analyzer.analyze(documents, tempDir);

      // Should resolve the relative path correctly
      const refs = graph.references.filter(ref => ref.targetPath === doc2Path);
      expect(refs.length).toBeGreaterThan(0);
    });
  });

  describe('Reference Graph Construction', () => {
    it('should build a complete reference graph', async () => {
      // Create a simple graph: doc1 -> doc2, doc1 -> doc3, doc2 -> doc3
      const doc1Path = 'doc1.md';
      const doc2Path = 'doc2.md';
      const doc3Path = 'doc3.md';
      
      await fs.writeFile(
        path.join(tempDir, doc1Path),
        '[Link to doc2](./doc2.md) and [link to doc3](./doc3.md)'
      );
      await fs.writeFile(
        path.join(tempDir, doc2Path),
        '[Link to doc3](./doc3.md)'
      );
      await fs.writeFile(path.join(tempDir, doc3Path), 'Final document');

      const documents: DocumentMetadata[] = [
        {
          path: doc1Path,
          createdAt: new Date(),
          modifiedAt: new Date(),
          sizeBytes: 100,
          lineCount: 1,
          category: DocumentCategory.OTHER,
        },
        {
          path: doc2Path,
          createdAt: new Date(),
          modifiedAt: new Date(),
          sizeBytes: 50,
          lineCount: 1,
          category: DocumentCategory.OTHER,
        },
        {
          path: doc3Path,
          createdAt: new Date(),
          modifiedAt: new Date(),
          sizeBytes: 30,
          lineCount: 1,
          category: DocumentCategory.OTHER,
        },
      ];

      const graph = await analyzer.analyze(documents, tempDir);

      // Check that all documents are in the graph
      expect(graph.documents.size).toBe(3);
      expect(graph.documents.has(doc1Path)).toBe(true);
      expect(graph.documents.has(doc2Path)).toBe(true);
      expect(graph.documents.has(doc3Path)).toBe(true);

      // Check reference counts
      const node1 = graph.documents.get(doc1Path)!;
      const node2 = graph.documents.get(doc2Path)!;
      const node3 = graph.documents.get(doc3Path)!;

      expect(node1.outgoingRefs).toBe(2); // doc1 references doc2 and doc3
      expect(node1.incomingRefs).toBe(0); // doc1 is not referenced

      expect(node2.outgoingRefs).toBe(1); // doc2 references doc3
      expect(node2.incomingRefs).toBe(1); // doc2 is referenced by doc1

      expect(node3.outgoingRefs).toBe(0); // doc3 references nothing
      expect(node3.incomingRefs).toBe(2); // doc3 is referenced by doc1 and doc2
    });

    it('should handle circular references', async () => {
      // Create circular reference: doc1 -> doc2 -> doc1
      const doc1Path = 'doc1.md';
      const doc2Path = 'doc2.md';
      
      await fs.writeFile(
        path.join(tempDir, doc1Path),
        '[Link to doc2](./doc2.md)'
      );
      await fs.writeFile(
        path.join(tempDir, doc2Path),
        '[Link back to doc1](./doc1.md)'
      );

      const documents: DocumentMetadata[] = [
        {
          path: doc1Path,
          createdAt: new Date(),
          modifiedAt: new Date(),
          sizeBytes: 100,
          lineCount: 1,
          category: DocumentCategory.OTHER,
        },
        {
          path: doc2Path,
          createdAt: new Date(),
          modifiedAt: new Date(),
          sizeBytes: 50,
          lineCount: 1,
          category: DocumentCategory.OTHER,
        },
      ];

      const graph = await analyzer.analyze(documents, tempDir);

      // Both documents should have 1 incoming and 1 outgoing reference
      const node1 = graph.documents.get(doc1Path)!;
      const node2 = graph.documents.get(doc2Path)!;

      expect(node1.incomingRefs).toBe(1);
      expect(node1.outgoingRefs).toBe(1);
      expect(node2.incomingRefs).toBe(1);
      expect(node2.outgoingRefs).toBe(1);
    });

    it('should handle documents with no references', async () => {
      const doc1Path = 'doc1.md';
      const doc2Path = 'doc2.md';
      
      await fs.writeFile(path.join(tempDir, doc1Path), 'Standalone document 1');
      await fs.writeFile(path.join(tempDir, doc2Path), 'Standalone document 2');

      const documents: DocumentMetadata[] = [
        {
          path: doc1Path,
          createdAt: new Date(),
          modifiedAt: new Date(),
          sizeBytes: 100,
          lineCount: 1,
          category: DocumentCategory.OTHER,
        },
        {
          path: doc2Path,
          createdAt: new Date(),
          modifiedAt: new Date(),
          sizeBytes: 50,
          lineCount: 1,
          category: DocumentCategory.OTHER,
        },
      ];

      const graph = await analyzer.analyze(documents, tempDir);

      // Both documents should have 0 references
      const node1 = graph.documents.get(doc1Path)!;
      const node2 = graph.documents.get(doc2Path)!;

      expect(node1.incomingRefs).toBe(0);
      expect(node1.outgoingRefs).toBe(0);
      expect(node2.incomingRefs).toBe(0);
      expect(node2.outgoingRefs).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle broken links gracefully', async () => {
      const docPath = 'doc.md';
      
      await fs.writeFile(
        path.join(tempDir, docPath),
        '[Broken link](./nonexistent.md)'
      );

      const documents: DocumentMetadata[] = [
        {
          path: docPath,
          createdAt: new Date(),
          modifiedAt: new Date(),
          sizeBytes: 100,
          lineCount: 1,
          category: DocumentCategory.OTHER,
        },
      ];

      const graph = await analyzer.analyze(documents, tempDir);

      // The reference should be extracted but not counted in the graph
      // since the target doesn't exist in the document set
      const node = graph.documents.get(docPath)!;
      expect(node.outgoingRefs).toBe(0);
    });

    it('should handle empty documents', async () => {
      const docPath = 'empty.md';
      
      await fs.writeFile(path.join(tempDir, docPath), '');

      const documents: DocumentMetadata[] = [
        {
          path: docPath,
          createdAt: new Date(),
          modifiedAt: new Date(),
          sizeBytes: 0,
          lineCount: 0,
          category: DocumentCategory.OTHER,
        },
      ];

      const graph = await analyzer.analyze(documents, tempDir);

      const node = graph.documents.get(docPath)!;
      expect(node.incomingRefs).toBe(0);
      expect(node.outgoingRefs).toBe(0);
    });

    it('should not count duplicate references', async () => {
      const doc1Path = 'doc1.md';
      const doc2Path = 'doc2.md';
      
      await fs.writeFile(
        path.join(tempDir, doc1Path),
        '[First link](./doc2.md) and [second link](./doc2.md) to the same document'
      );
      await fs.writeFile(path.join(tempDir, doc2Path), 'Content');

      const documents: DocumentMetadata[] = [
        {
          path: doc1Path,
          createdAt: new Date(),
          modifiedAt: new Date(),
          sizeBytes: 100,
          lineCount: 1,
          category: DocumentCategory.OTHER,
        },
        {
          path: doc2Path,
          createdAt: new Date(),
          modifiedAt: new Date(),
          sizeBytes: 50,
          lineCount: 1,
          category: DocumentCategory.OTHER,
        },
      ];

      const graph = await analyzer.analyze(documents, tempDir);

      // Should only count as 1 reference, not 2
      const node1 = graph.documents.get(doc1Path)!;
      const node2 = graph.documents.get(doc2Path)!;

      expect(node1.outgoingRefs).toBe(1);
      expect(node2.incomingRefs).toBe(1);
    });
  });

  describe('Incoming Reference Counting', () => {
    it('should correctly count incoming references', async () => {
      // Create a hub document referenced by multiple others
      const hubPath = 'hub.md';
      const doc1Path = 'doc1.md';
      const doc2Path = 'doc2.md';
      const doc3Path = 'doc3.md';
      
      await fs.writeFile(path.join(tempDir, hubPath), 'Hub document');
      await fs.writeFile(
        path.join(tempDir, doc1Path),
        '[Link to hub](./hub.md)'
      );
      await fs.writeFile(
        path.join(tempDir, doc2Path),
        '[Link to hub](./hub.md)'
      );
      await fs.writeFile(
        path.join(tempDir, doc3Path),
        '[Link to hub](./hub.md)'
      );

      const documents: DocumentMetadata[] = [
        {
          path: hubPath,
          createdAt: new Date(),
          modifiedAt: new Date(),
          sizeBytes: 50,
          lineCount: 1,
          category: DocumentCategory.OTHER,
        },
        {
          path: doc1Path,
          createdAt: new Date(),
          modifiedAt: new Date(),
          sizeBytes: 100,
          lineCount: 1,
          category: DocumentCategory.OTHER,
        },
        {
          path: doc2Path,
          createdAt: new Date(),
          modifiedAt: new Date(),
          sizeBytes: 100,
          lineCount: 1,
          category: DocumentCategory.OTHER,
        },
        {
          path: doc3Path,
          createdAt: new Date(),
          modifiedAt: new Date(),
          sizeBytes: 100,
          lineCount: 1,
          category: DocumentCategory.OTHER,
        },
      ];

      const graph = await analyzer.analyze(documents, tempDir);

      const hubNode = graph.documents.get(hubPath)!;
      expect(hubNode.incomingRefs).toBe(3);
      expect(hubNode.referencedBy).toHaveLength(3);
      expect(hubNode.referencedBy).toContain(doc1Path);
      expect(hubNode.referencedBy).toContain(doc2Path);
      expect(hubNode.referencedBy).toContain(doc3Path);
    });
  });
});
