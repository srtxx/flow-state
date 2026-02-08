import type { DrinkType } from '../types';
import { DRINK_OPTIONS, getCurrentTimeString } from '../lib/caffeine';

interface QuickAddProps {
    onAdd: (drink: DrinkType, amount: number, time: string) => void;
    onCustom: () => void;
}

export default function QuickAdd({ onAdd, onCustom }: QuickAddProps) {
    const handleQuickAdd = (drink: DrinkType, amount: number) => {
        onAdd(drink, amount, getCurrentTimeString());
    };

    return (
        <div className="quick-add-panel">
            <p className="section-label">QUICK ADD</p>
            <div className="quick-add-grid">
                {DRINK_OPTIONS.slice(0, 3).map((drink) => (
                    <button
                        key={drink.name}
                        className="drink-button"
                        onClick={() => handleQuickAdd(drink.name, drink.defaultMg)}
                    >
                        <p className="drink-name">{drink.name}</p>
                        <p className="drink-amount">{drink.defaultMg}</p>
                        <p className="drink-unit">mg</p>
                    </button>
                ))}
            </div>
            <button className="custom-button" onClick={onCustom}>
                カスタム入力
            </button>
        </div>
    );
}
