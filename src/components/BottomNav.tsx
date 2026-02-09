import { Waves, ScrollText, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TabType } from '../types';

interface BottomNavProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
}

const tabs: { id: TabType; labelKey: string; icon: React.ElementType }[] = [
    { id: 'dashboard', labelKey: 'nav.flow', icon: Waves },
    { id: 'journal', labelKey: 'nav.journal', icon: ScrollText },
    { id: 'profile', labelKey: 'nav.profile', icon: User },
];

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
    const { t } = useTranslation();
    return (
        <nav className="bottom-nav">
            {tabs.map(({ id, labelKey, icon: Icon }) => (
                <button
                    key={id}
                    onClick={() => onTabChange(id)}
                    className={`nav-button ${activeTab === id ? 'active' : ''}`}
                >
                    <Icon size={24} strokeWidth={activeTab === id ? 2.5 : 1.5} />
                    <span className="nav-label">{t(labelKey)}</span>
                </button>
            ))}
        </nav>
    );
}
