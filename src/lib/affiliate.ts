/**
 * Amazon アソシエイト統合
 *
 * 各ドリンク種別に複数の商品候補を持ち、
 * 売れ筋ランク・セール状況に基づいて最適な1商品を自動選択する。
 */

import type { DrinkType } from '../types';

// ---------------------------------------------------------------------------
// Associate Tag
// ---------------------------------------------------------------------------
const AMAZON_ASSOCIATE_TAG = 'strxxxx05-22';

// ---------------------------------------------------------------------------
// Product Catalog
// ---------------------------------------------------------------------------
export interface AffiliateProduct {
    id: string;
    /** 商品名 (表示用) */
    name: string;
    /** カフェイン含有量 (mg) */
    caffeine: number;
    /** Amazon ASIN */
    asin: string;
    /** 売れ筋ランク (小さいほど上位, 1 = 最も売れている) */
    salesRank: number;
    /** セール中フラグ (true = 優先的に表示) */
    onSale?: boolean;
}

/**
 * ドリンク種別 → Amazon 商品候補マッピング
 *
 * 各種別に複数の箱売り・ケース売り商品を登録。
 * salesRank: 1 が最も売れ筋。定期的に手動更新する。
 */
export const AFFILIATE_PRODUCTS: Partial<Record<DrinkType, AffiliateProduct[]>> = {
    'COFFEE S': [
        {
            id: 'boss-black',
            name: 'サントリー ボス 無糖ブラック 185g×30本',
            caffeine: 100,
            asin: 'B003OAA5IK',
            salesRank: 1,
        },
        {
            id: 'georgia-emerald',
            name: 'ジョージア エメラルドマウンテン 185g×30本',
            caffeine: 90,
            asin: 'B009HP3N2G',
            salesRank: 2,
        },
        {
            id: 'ucc-black',
            name: 'UCC ブラック無糖 185g×30本',
            caffeine: 95,
            asin: 'B00AMRZQWI',
            salesRank: 3,
        },
        {
            id: 'wonda-morning',
            name: 'アサヒ ワンダ モーニングショット 185g×30本',
            caffeine: 90,
            asin: 'B00CF2AWAU',
            salesRank: 4,
        },
    ],
    'COFFEE L': [
        {
            id: 'starbucks-black',
            name: 'スターバックス ブラック無糖 185g×30本',
            caffeine: 200,
            asin: 'B0DJ44CGB7',
            salesRank: 1,
        },
        {
            id: 'boss-craft-black',
            name: 'ボス クラフトボス ブラック 500ml×24本',
            caffeine: 180,
            asin: 'B0CW1NT9BH',
            salesRank: 2,
        },
        {
            id: 'georgia-craft-black',
            name: 'ジョージア ジャパンクラフトマン 500ml×24本',
            caffeine: 170,
            asin: 'B07QKX3WNN',
            salesRank: 3,
        },
    ],
    'ENERGY S': [
        {
            id: 'redbull-250',
            name: 'レッドブル エナジードリンク 250ml×24本',
            caffeine: 80,
            asin: 'B0C64XBSTX',
            salesRank: 1,
        },
        {
            id: 'redbull-sf-250',
            name: 'レッドブル シュガーフリー 250ml×24本',
            caffeine: 80,
            asin: 'B0C64Y6Z7Z',
            salesRank: 2,
        },
        {
            id: 'zoneenergy-500',
            name: 'ZONe エナジードリンク 500ml×24本',
            caffeine: 75,
            asin: 'B08CDD3J95',
            salesRank: 3,
        },
    ],
    'ENERGY L': [
        {
            id: 'monster-355',
            name: 'モンスターエナジー 355ml×24本',
            caffeine: 142,
            asin: 'B007V6MQJY',
            salesRank: 1,
        },
        {
            id: 'monster-ultra',
            name: 'モンスター ウルトラ 355ml×24本',
            caffeine: 142,
            asin: 'B08FD3WRJJ',
            salesRank: 2,
        },
        {
            id: 'redbull-355',
            name: 'レッドブル エナジードリンク 355ml×24本',
            caffeine: 114,
            asin: 'B0C64YQNY4',
            salesRank: 3,
        },
        {
            id: 'monster-pipeline',
            name: 'モンスター パイプラインパンチ 355ml×24本',
            caffeine: 142,
            asin: 'B08BNPF95M',
            salesRank: 4,
        },
    ],
};

// ---------------------------------------------------------------------------
// Product Selection
// ---------------------------------------------------------------------------
/**
 * 候補リストから最適な1商品を選択する。
 *
 * 選択ロジック:
 * 1. onSale === true の商品があればそこからフィルタ
 * 2. salesRank 昇順でソート
 * 3. 上位候補に重み付きランダムを適用 (上位ほど選ばれやすい)
 */
export function selectBestProduct(candidates: AffiliateProduct[]): AffiliateProduct {
    if (candidates.length === 0) {
        throw new Error('candidates must not be empty');
    }
    if (candidates.length === 1) return candidates[0];

    // Step 1: セール品があればフィルタ
    const onSaleItems = candidates.filter(p => p.onSale);
    const pool = onSaleItems.length > 0 ? onSaleItems : candidates;

    // Step 2: salesRank 昇順ソート
    const sorted = [...pool].sort((a, b) => a.salesRank - b.salesRank);

    // Step 3: 重み付きランダム選択
    // weight = 1 / rank → rank 1 は weight 1.0, rank 4 は weight 0.25
    const weights = sorted.map(p => 1 / p.salesRank);
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);

    const rand = Math.random() * totalWeight;
    let cumulative = 0;
    for (let i = 0; i < sorted.length; i++) {
        cumulative += weights[i];
        if (rand <= cumulative) {
            return sorted[i];
        }
    }

    // フォールバック (通常到達しない)
    return sorted[0];
}

/**
 * ドリンク種別に対して最適な商品1つを取得する。
 */
export function getSelectedProduct(drinkName: DrinkType): AffiliateProduct | null {
    const candidates = AFFILIATE_PRODUCTS[drinkName];
    if (!candidates || candidates.length === 0) return null;
    return selectBestProduct(candidates);
}

// ---------------------------------------------------------------------------
// Link Generation
// ---------------------------------------------------------------------------
/**
 * ドリンク種別から Amazon アフィリエイトリンクを生成する。
 * 複数候補から最適な商品を自動選択する。
 */
export function getAffiliateLink(drinkName: DrinkType): string | null {
    const product = getSelectedProduct(drinkName);
    if (!product) return null;
    return `https://www.amazon.co.jp/dp/${product.asin}?tag=${AMAZON_ASSOCIATE_TAG}`;
}

/**
 * 直接 ASIN からリンクを生成する。
 */
export function createAmazonLink(asin: string): string {
    return `https://www.amazon.co.jp/dp/${asin}?tag=${AMAZON_ASSOCIATE_TAG}`;
}

// ---------------------------------------------------------------------------
// Click Tracking
// ---------------------------------------------------------------------------
/**
 * 広告クリックをトラッキングする (Google Analytics 4 連携)。
 */
export function trackAdClick(placement: string, productId: string) {
    // gtag が存在する場合のみ送信
    if (
        typeof window !== 'undefined' &&
        'gtag' in window &&
        typeof (window as Record<string, unknown>).gtag === 'function'
    ) {
        (window as unknown as { gtag: (...args: unknown[]) => void }).gtag(
            'event',
            'ad_click',
            {
                event_category: 'affiliate',
                event_label: productId,
                placement,
                timestamp: new Date().toISOString(),
            },
        );
    }
}
