import { Moon } from 'lucide-react';
import BottomNav from './BottomNav';
import type { TabType } from '../types';

interface LayoutProps {
    children: React.ReactNode;
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
    actualSleepHours: number;
    onSleepClick: () => void;
}

export default function Layout({
    children,
    activeTab,
    onTabChange,
    actualSleepHours,
    onSleepClick
}: LayoutProps) {
    return (
        <div className="app-container">
            {/* Header */}
            <header className="header">
                <div className="logo">
                    <span className="logo-flow">FLOW</span>
                    <span className="logo-state">STATE</span>
                </div>
                <button onClick={onSleepClick} className="sleep-button">
                    <Moon size={16} />
                    <span>{actualSleepHours.toFixed(1)}時間</span>
                </button>
            </header>

            {/* Main Content */}
            <main className="main-content">
                {children}
            </main>

            {/* Bottom Navigation */}
            <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
        </div>
    );
}
