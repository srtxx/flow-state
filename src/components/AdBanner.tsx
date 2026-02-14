/**
 * Google AdSense バナーコンポーネント
 *
 * 常駐型広告として JournalPage の下部などに配置する。
 * AdSense の審査が完了したら data-ad-client と data-ad-slot を差し替える。
 */
import { useEffect, useRef, useState } from 'react';

interface AdBannerProps {
    /** AdSense 広告ユニットの Slot ID */
    slot: string;
    /** 広告フォーマット */
    format?: 'auto' | 'horizontal' | 'vertical' | 'rectangle';
    /** 追加の className */
    className?: string;
}

// AdSense クライアント ID (審査通過後に差し替え)
const AD_CLIENT = 'ca-pub-3549044204601545';

export default function AdBanner({
    slot,
    format = 'auto',
    className = '',
}: AdBannerProps) {
    const adRef = useRef<HTMLModElement>(null);
    const [isAdBlocked, setIsAdBlocked] = useState(false);

    useEffect(() => {
        // AdSense がブロックされている、または未ロードの場合はフォールバック
        const w = window as unknown as Record<string, unknown>;
        if (!w.adsbygoogle) {
            setIsAdBlocked(true);
            return;
        }
        try {
            ((w.adsbygoogle as unknown[]) || []).push({});
        } catch {
            setIsAdBlocked(true);
        }
    }, []);

    // 広告ブロッカー使用時やAdSense未設定時はフォールバック
    if (isAdBlocked || AD_CLIENT.includes('XXXXXX')) {
        return (
            <div className={`ad-container ${className}`}>
                <span className="block text-[10px] text-secondary/50 uppercase tracking-wider mb-2">
                    Sponsored
                </span>
                <div className="card-soft p-4 bg-subtle/30 border-primary/5 flex items-center justify-center min-h-[60px]">
                    <p className="text-[10px] text-secondary/40 uppercase tracking-wider">
                        Ad Space
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={`ad-container ${className}`}>
            <span className="block text-[10px] text-secondary/50 uppercase tracking-wider mb-2">
                Sponsored
            </span>
            <ins
                ref={adRef}
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client={AD_CLIENT}
                data-ad-slot={slot}
                data-ad-format={format}
                data-full-width-responsive="true"
            />
        </div>
    );
}
