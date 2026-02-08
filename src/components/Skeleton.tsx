import './Skeleton.css';

interface SkeletonProps {
    width?: string;
    height?: string;
    borderRadius?: string;
    className?: string;
}

export default function Skeleton({
    width = '100%',
    height = '1rem',
    borderRadius = 'var(--radius-md)',
    className = ''
}: SkeletonProps) {
    return (
        <div
            className={`skeleton ${className}`}
            style={{ width, height, borderRadius }}
        />
    );
}

// Pre-built skeleton layouts for common use cases
export function DashboardSkeleton() {
    return (
        <div className="dashboard-skeleton">
            {/* Score display skeleton */}
            <div className="score-display-large">
                <Skeleton width="120px" height="96px" borderRadius="8px" />
                <Skeleton width="150px" height="14px" className="mt-2" />
                <Skeleton width="100px" height="32px" borderRadius="var(--radius-full)" className="mt-4" />
            </div>

            {/* Chart skeleton */}
            <div className="main-chart-container">
                <Skeleton height="280px" borderRadius="var(--radius-md)" />
            </div>
        </div>
    );
}

export function JournalSkeleton() {
    return (
        <div className="journal-skeleton pb-20">
            {/* Header skeleton */}
            <Skeleton height="80px" borderRadius="var(--radius-lg)" className="mb-8" />

            {/* List items skeleton */}
            <Skeleton width="80px" height="12px" className="mb-4" />
            {[1, 2, 3].map(i => (
                <Skeleton key={i} height="64px" borderRadius="var(--radius-md)" className="mb-3" />
            ))}
        </div>
    );
}

export function ProfileSkeleton() {
    return (
        <div className="profile-skeleton pb-24 pt-8">
            {/* Header */}
            <div className="px-6 mb-8 flex justify-between">
                <div>
                    <Skeleton width="150px" height="28px" className="mb-2" />
                    <Skeleton width="180px" height="14px" />
                </div>
                <Skeleton width="40px" height="40px" borderRadius="50%" />
            </div>

            {/* Main card */}
            <Skeleton height="160px" borderRadius="var(--radius-lg)" className="mx-4 mb-6" />

            {/* Sleep section */}
            <Skeleton width="120px" height="12px" className="mx-4 mb-4" />
            <Skeleton height="200px" borderRadius="var(--radius-md)" className="mx-4 mb-6" />

            {/* Stats grid */}
            <Skeleton width="120px" height="12px" className="mx-4 mb-4" />
            <div className="grid-2 mx-4">
                <Skeleton height="100px" borderRadius="var(--radius-md)" />
                <Skeleton height="100px" borderRadius="var(--radius-md)" />
            </div>
        </div>
    );
}
