import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ReferenceLine,
    ResponsiveContainer,
    Legend
} from 'recharts';
import type { TooltipProps } from 'recharts';
import type { AlertnessDataPoint, IntakeRecord } from '../types';
import { timeToDecimalHours } from '../lib/caffeine';

interface AlertnessChartProps {
    data: AlertnessDataPoint[];
    predictedData?: AlertnessDataPoint[];
    intakeRecords: IntakeRecord[];
    showBaseline?: boolean;
    title?: string;
    subtitle?: string;
    height?: number;
}

interface CustomTooltipPayload {
    payload: AlertnessDataPoint;
}

function CustomTooltip({ active, payload }: TooltipProps<number, string>) {
    if (active && payload && payload.length > 0) {
        const data = (payload[0] as unknown as CustomTooltipPayload).payload;
        return (
            <div className="bg-white p-2 sm:p-3 rounded-lg shadow-lg border border-gray-100 text-xs z-50 max-w-[140px] sm:max-w-none">
                <p className="font-bold mb-1 text-[10px] sm:text-xs">{data.time}</p>
                <div className="flex flex-col gap-1 sm:gap-2">
                    <div className="flex justify-between min-w-[100px] sm:min-w-[128px] items-center">
                        <span className="text-gray-500 text-[10px] sm:text-xs">Current:</span>
                        <span className="font-bold text-sm sm:text-lg">{data.total.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between min-w-[100px] sm:min-w-[128px] items-center text-gray-400">
                        <span className="text-[10px] sm:text-xs">Baseline:</span>
                        <span className="text-[10px] sm:text-xs">{data.baseline.toFixed(0)}</span>
                    </div>
                    {data.caffeine > 0 && (
                        <div className="flex justify-between min-w-[100px] sm:min-w-[128px] items-center text-green-600">
                            <span className="text-[10px] sm:text-xs">Boost:</span>
                            <span className="text-[10px] sm:text-xs">+{data.caffeine.toFixed(0)}</span>
                        </div>
                    )}
                    {(data as any).predictedTotal > data.total && (
                        <div className="flex justify-between min-w-[100px] sm:min-w-[128px] items-center text-blue-500">
                            <span className="text-[10px] sm:text-xs">Predicted:</span>
                            <span className="text-[10px] sm:text-xs">{(data as any).predictedTotal.toFixed(0)}</span>
                        </div>
                    )}
                </div>
            </div>
        );
    }
    return null;
}

export default function AlertnessChart({
    data,
    predictedData,
    intakeRecords,
    showBaseline = true,
}: AlertnessChartProps) {
    // Merge predicted data if available
    const chartData = data.map((d, i) => ({
        ...d,
        predictedTotal: predictedData ? predictedData[i]?.total : d.total
    }));

    const now = new Date();
    // Round to nearest 30-min interval for "NOW" line
    const minutes = now.getMinutes();
    let adjustedHour = now.getHours();
    let roundedMinutes: string;

    if (minutes < 15) {
        roundedMinutes = '00';
    } else if (minutes < 45) {
        roundedMinutes = '30';
    } else {
        roundedMinutes = '00';
        adjustedHour = (adjustedHour + 1) % 24;
    }
    const currentTimeStr = `${String(adjustedHour).padStart(2, '0')}:${roundedMinutes}`;

    // Helper to snap arbitrary times to the nearest available data point
    const getNearestDataPointTime = (targetTime: string): string | null => {
        if (!data || data.length === 0) return null;

        const target = timeToDecimalHours(targetTime);
        let minDiff = Infinity;
        let nearestTime: string | null = null;

        // Loop through data to find closest match
        for (const point of data) {
            const pointTime = timeToDecimalHours(point.time);
            let diff = Math.abs(target - pointTime);
            // Handle midnight wrap-around (e.g., 23:50 vs 00:10 -> 20 min diff)
            if (diff > 12) diff = 24 - diff;

            if (diff < minDiff) {
                minDiff = diff;
                nearestTime = point.time;
            }
        }

        return nearestTime;
    };

    return (
        <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--bg-card)', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 20, right: 5, left: -5, bottom: 0 }}>
                    <defs>
                        <linearGradient id="gradientTotal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gradientBaseline" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--text-secondary)" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="var(--text-secondary)" stopOpacity={0} />
                        </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-subtle)" vertical={false} />

                    <XAxis
                        dataKey="time"
                        tick={{ fontSize: 12, fill: 'var(--text-secondary)', fontWeight: 500 }}
                        axisLine={false}
                        tickLine={false}
                        interval={4}
                    />

                    <YAxis
                        tick={{ fontSize: 12, fill: 'var(--text-secondary)', fontWeight: 500 }}
                        axisLine={false}
                        tickLine={false}
                        domain={[0, 100]}
                        width={35}
                    />

                    <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ stroke: 'var(--bg-subtle)' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px', color: 'var(--text-secondary)' }} />

                    {/* Baseline */}
                    {showBaseline && (
                        <Area
                            name="Sleep Baseline"
                            type="monotone"
                            dataKey="baseline"
                            stroke="var(--text-secondary)"
                            strokeWidth={2}
                            strokeDasharray="4 4"
                            fill="url(#gradientBaseline)"
                            animationBegin={0}
                            animationDuration={1500}
                        />
                    )}

                    {/* Predicted Alertness (only if different) */}
                    {predictedData && (
                        <Area
                            name="Predicted Level"
                            type="monotone"
                            dataKey="predictedTotal"
                            stroke="#3B82F6"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            fillOpacity={0}
                            animationBegin={500}
                            animationDuration={1500}
                        />
                    )}

                    {/* Total Alertness */}
                    <Area
                        name="Alertness Level"
                        type="monotone"
                        dataKey="total"
                        stroke="var(--accent-primary)"
                        strokeWidth={3}
                        fill="url(#gradientTotal)"
                        animationBegin={1000}
                        animationDuration={1500}
                    />

                    {/* Intake Markers - Snap to grid to match XAxis */}
                    {intakeRecords.map((record, idx) => {
                        const snappedTime = getNearestDataPointTime(record.time);
                        if (!snappedTime) return null;

                        return (
                            <ReferenceLine
                                key={idx}
                                x={snappedTime}
                                stroke="var(--accent-primary)"
                                strokeDasharray="3 3"
                                label={{
                                    value: '☕',
                                    position: 'insideTop',
                                    dy: 20, // Push down
                                    fontSize: 16,
                                    fill: 'var(--accent-primary)'
                                }}
                            />
                        );
                    })}

                    {/* Date Transition Line (00:00) */}
                    {data.map((point, idx) => {
                        if (point.time === '00:00') {
                            return (
                                <ReferenceLine
                                    key={`date-transition-${idx}`}
                                    x="00:00"
                                    stroke="var(--bg-subtle)"
                                    strokeDasharray="4 4"
                                    label={{
                                        value: 'Next Day',
                                        position: 'insideTopLeft',
                                        fill: 'var(--text-secondary)',
                                        fontSize: 10,
                                        dy: 5,
                                        dx: 5
                                    }}
                                />
                            );
                        }
                        return null;
                    })}

                    {/* Current Time */}
                    <ReferenceLine
                        x={currentTimeStr}
                        stroke="var(--status-critical)"
                        strokeDasharray="2 2"
                        label={{
                            value: 'NOW',
                            position: 'top',
                            fill: 'var(--status-critical)',
                            fontSize: 10,
                            fontWeight: 'bold'
                        }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
