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
            <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100 text-xs z-50">
                <p className="font-bold mb-1">{data.time}</p>
                <div className="flex flex-col gap-1">
                    <p className="flex justify-between w-32">
                        <span>Current:</span>
                        <span className="font-bold">{data.total.toFixed(0)}</span>
                    </p>
                    <p className="flex justify-between w-32 text-gray-400">
                        <span>Baseline:</span>
                        <span>{data.baseline.toFixed(0)}</span>
                    </p>
                    {data.caffeine > 0 && (
                        <p className="flex justify-between w-32 text-green-600">
                            <span>Boost:</span>
                            <span>+{data.caffeine.toFixed(0)}</span>
                        </p>
                    )}
                    {(data as any).predictedTotal > data.total && (
                        <p className="flex justify-between w-32 text-blue-500">
                            <span>Predicted:</span>
                            <span>{(data as any).predictedTotal.toFixed(0)}</span>
                        </p>
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

    // Helper to snap arbitrary times to chart grid (00 or 30)
    const snapToGrid = (timeStr: string): string => {
        const [h, m] = timeStr.split(':').map(Number);
        let hour = h;
        let minStr = '00';

        if (m < 15) {
            minStr = '00';
        } else if (m < 45) {
            minStr = '30';
        } else {
            minStr = '00';
            hour = (hour + 1) % 24;
        }
        return `${String(hour).padStart(2, '0')}:${minStr}`;
    };

    return (
        <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--bg-card)', borderRadius: '24px', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="gradientTotal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#171717" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#171717" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gradientBaseline" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#A3A3A3" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#A3A3A3" stopOpacity={0} />
                        </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" vertical={false} />

                    <XAxis
                        dataKey="time"
                        tick={{ fontSize: 12, fill: '#737373', fontWeight: 500 }}
                        axisLine={false}
                        tickLine={false}
                        interval={4}
                    />

                    <YAxis
                        tick={{ fontSize: 12, fill: '#737373', fontWeight: 500 }}
                        axisLine={false}
                        tickLine={false}
                        domain={[0, 100]}
                        width={35}
                    />

                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#E5E5E5' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />

                    {/* Baseline */}
                    {showBaseline && (
                        <Area
                            name="Sleep Baseline"
                            type="monotone"
                            dataKey="baseline"
                            stroke="#A3A3A3"
                            strokeWidth={2}
                            strokeDasharray="4 4"
                            fill="url(#gradientBaseline)"
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
                        />
                    )}

                    {/* Total Alertness */}
                    <Area
                        name="Alertness Level"
                        type="monotone"
                        dataKey="total"
                        stroke="#171717"
                        strokeWidth={3}
                        fill="url(#gradientTotal)"
                        animationDuration={500}
                    />

                    {/* Intake Markers - Snap to grid to match XAxis */}
                    {intakeRecords.map((record, idx) => (
                        <ReferenceLine
                            key={idx}
                            x={snapToGrid(record.time)}
                            stroke="#171717"
                            strokeDasharray="3 3"
                            label={{
                                value: '☕',
                                position: 'insideTop',
                                dy: 20, // Push down to avoid overlapping with NOW label or specific time
                                fontSize: 16,
                                fill: '#171717'
                            }}
                        />
                    ))}

                    {/* Date Transition Line (00:00) */}
                    {data.map((point, idx) => {
                        if (point.time === '00:00') {
                            return (
                                <ReferenceLine
                                    key={`date-transition-${idx}`}
                                    x="00:00"
                                    stroke="#E5E5E5"
                                    strokeDasharray="4 4"
                                    label={{
                                        value: 'Next Day',
                                        position: 'insideTopLeft',
                                        fill: '#A3A3A3',
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
                        stroke="#EF4444"
                        strokeDasharray="2 2"
                        label={{
                            value: 'NOW',
                            position: 'top',
                            fill: '#EF4444',
                            fontSize: 10,
                            fontWeight: 'bold'
                        }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
