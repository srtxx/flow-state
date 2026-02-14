/**
 * Amazon アフィリエイトリンクコンポーネント
 *
 * IntakeModal 内でドリンク選択後に「Amazon で見る」を表示するクリック型広告。
 * 複数の商品候補から売れ筋・セール品を優先して1つ自動選択する。
 * UXを損なわないよう控えめなデザインにしつつ、視認性を確保する。
 */
import { useMemo } from 'react';
import { ExternalLink, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { DrinkType } from '../types';
import { AFFILIATE_PRODUCTS, selectBestProduct, createAmazonLink, trackAdClick } from '../lib/affiliate';

interface AffiliateLinkProps {
    drinkName: DrinkType;
    className?: string;
}

export default function AffiliateLink({ drinkName, className = '' }: AffiliateLinkProps) {
    const { t } = useTranslation();

    // useMemo で drinkName が変わるまで同じ商品を表示し続ける (チラつき防止)
    const product = useMemo(() => {
        const candidates = AFFILIATE_PRODUCTS[drinkName];
        if (!candidates || candidates.length === 0) return null;
        return selectBestProduct(candidates);
    }, [drinkName]);

    const link = product ? createAmazonLink(product.asin) : null;

    if (!link || !product) return null;

    return (
        <a
            href={link}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className={`
        group flex items-center justify-between gap-3
        p-3 rounded-xl
        bg-amber-500/5 border border-amber-500/10
        hover:bg-amber-500/10 hover:border-amber-500/20
        transition-all duration-200
        ${className}
      `}
            onClick={() => trackAdClick('intake_modal', product.id)}
        >
            <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <span className="text-base">🛒</span>
                </div>
                <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <p className="text-[10px] text-secondary/60 uppercase tracking-wider">
                            {t('ad.amazonPartner')}
                        </p>
                        {product.onSale && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 animate-pulse">
                                <Tag size={8} className="text-red-400" />
                                <span className="text-[9px] font-bold text-red-400 tracking-wide">
                                    {t('ad.saleBadge')}
                                </span>
                            </span>
                        )}
                    </div>
                    <p className="text-xs font-medium text-primary truncate">
                        {product.name}
                    </p>
                </div>
            </div>
            <ExternalLink
                size={14}
                className="flex-shrink-0 text-secondary/40 group-hover:text-amber-400 transition-colors"
            />
        </a>
    );
}
