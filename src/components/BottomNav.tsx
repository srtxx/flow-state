import { Waves, ScrollText, User } from 'lucide-react';
import type { TabType } from '../types';

interface BottomNavProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
}

const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'FLOW', icon: Waves },
    { id: 'journal', label: 'JOURNAL', icon: ScrollText },
    { id: 'profile', label: 'PROFILE', icon: User },
];

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
    return (
        <nav className="bottom-nav">
            {tabs.map(({ id, label, icon: Icon }) => (
                <button
                    key={id}
                    onClick={() => onTabChange(id)}
                    className={`nav-button ${activeTab === id ? 'active' : ''}`}
                >
                    <Icon size={24} strokeWidth={activeTab === id ? 2.5 : 1.5} />
                    <span className="nav-label">{label}</span>
                </button>
            ))}
        </nav>
    );
}
