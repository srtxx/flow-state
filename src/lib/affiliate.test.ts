// @vitest-environment node
import { describe, it, expect } from 'vitest';
import {
    selectBestProduct,
    getSelectedProduct,
    getAffiliateLink,
    createAmazonLink,
    AFFILIATE_PRODUCTS,
    type AffiliateProduct,
} from './affiliate';

describe('affiliate', () => {
    // -------------------------------------------------------------------
    // selectBestProduct
    // -------------------------------------------------------------------
    describe('selectBestProduct', () => {
        it('should return the only candidate when there is one', () => {
            const single: AffiliateProduct = {
                id: 'test', name: 'Test', caffeine: 100, asin: 'B000TEST', salesRank: 1,
            };
            expect(selectBestProduct([single])).toBe(single);
        });

        it('should throw on empty array', () => {
            expect(() => selectBestProduct([])).toThrow('candidates must not be empty');
        });

        it('should prefer onSale items over regular items', () => {
            const regular: AffiliateProduct = {
                id: 'regular', name: 'Regular', caffeine: 100, asin: 'B000REG', salesRank: 1,
            };
            const sale: AffiliateProduct = {
                id: 'sale', name: 'Sale', caffeine: 100, asin: 'B000SALE', salesRank: 5, onSale: true,
            };

            // Run multiple times to verify statistical preference
            const results = new Set<string>();
            for (let i = 0; i < 50; i++) {
                results.add(selectBestProduct([regular, sale]).id);
            }

            // sale item should always be selected (it's the only onSale item)
            expect(results.size).toBe(1);
            expect(results.has('sale')).toBe(true);
        });

        it('should select from multiple onSale items when available', () => {
            const sale1: AffiliateProduct = {
                id: 'sale1', name: 'Sale 1', caffeine: 100, asin: 'B000S1', salesRank: 2, onSale: true,
            };
            const sale2: AffiliateProduct = {
                id: 'sale2', name: 'Sale 2', caffeine: 100, asin: 'B000S2', salesRank: 1, onSale: true,
            };
            const regular: AffiliateProduct = {
                id: 'regular', name: 'Regular', caffeine: 100, asin: 'B000REG', salesRank: 1,
            };

            const results = new Set<string>();
            for (let i = 0; i < 100; i++) {
                results.add(selectBestProduct([sale1, sale2, regular]).id);
            }

            // Only sale items should be returned, never the regular one
            expect(results.has('regular')).toBe(false);
            expect(results.has('sale1') || results.has('sale2')).toBe(true);
        });

        it('should statistically favor lower salesRank (higher ranking)', () => {
            const rank1: AffiliateProduct = {
                id: 'rank1', name: 'Rank 1', caffeine: 100, asin: 'B000R1', salesRank: 1,
            };
            const rank10: AffiliateProduct = {
                id: 'rank10', name: 'Rank 10', caffeine: 100, asin: 'B000R10', salesRank: 10,
            };

            let rank1Count = 0;
            const iterations = 1000;
            for (let i = 0; i < iterations; i++) {
                if (selectBestProduct([rank1, rank10]).id === 'rank1') {
                    rank1Count++;
                }
            }

            // rank1 (weight=1.0) should be selected ~91% of the time vs rank10 (weight=0.1)
            // Use a relaxed bound to avoid flaky tests
            expect(rank1Count).toBeGreaterThan(iterations * 0.7);
        });
    });

    // -------------------------------------------------------------------
    // Product Catalog
    // -------------------------------------------------------------------
    describe('AFFILIATE_PRODUCTS catalog', () => {
        const drinkTypes: Array<'COFFEE S' | 'COFFEE L' | 'ENERGY S' | 'ENERGY L'> = [
            'COFFEE S', 'COFFEE L', 'ENERGY S', 'ENERGY L',
        ];

        it.each(drinkTypes)('should have at least 2 candidates for %s', (drinkType) => {
            const candidates = AFFILIATE_PRODUCTS[drinkType];
            expect(candidates).toBeDefined();
            expect(candidates!.length).toBeGreaterThanOrEqual(2);
        });

        it.each(drinkTypes)('all candidates for %s should have valid ASINs', (drinkType) => {
            const candidates = AFFILIATE_PRODUCTS[drinkType]!;
            for (const product of candidates) {
                expect(product.asin).toMatch(/^B[\dA-Z]{9}$/);
            }
        });

        it.each(drinkTypes)('all candidates for %s should have unique IDs', (drinkType) => {
            const candidates = AFFILIATE_PRODUCTS[drinkType]!;
            const ids = candidates.map(p => p.id);
            expect(new Set(ids).size).toBe(ids.length);
        });
    });

    // -------------------------------------------------------------------
    // getSelectedProduct / getAffiliateLink
    // -------------------------------------------------------------------
    describe('getSelectedProduct', () => {
        it('should return a product for known drink types', () => {
            const product = getSelectedProduct('COFFEE S');
            expect(product).not.toBeNull();
            expect(product!.asin).toBeTruthy();
        });

        it('should return null for CUSTOM drink type', () => {
            expect(getSelectedProduct('CUSTOM')).toBeNull();
        });
    });

    describe('getAffiliateLink', () => {
        it('should return a valid Amazon URL for known drink types', () => {
            const link = getAffiliateLink('ENERGY S');
            expect(link).not.toBeNull();
            expect(link).toContain('https://www.amazon.co.jp/dp/');
            expect(link).toContain('?tag=');
        });

        it('should return null for CUSTOM drink type', () => {
            expect(getAffiliateLink('CUSTOM')).toBeNull();
        });
    });

    describe('createAmazonLink', () => {
        it('should create a valid affiliate URL', () => {
            const link = createAmazonLink('B003OAA5IK');
            expect(link).toBe('https://www.amazon.co.jp/dp/B003OAA5IK?tag=strxxxx05-22');
        });
    });
});
