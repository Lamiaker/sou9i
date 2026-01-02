'use client';

import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    Area,
    AreaChart,
} from 'recharts';

// Couleurs cohérentes avec le design
export const CHART_COLORS = {
    primary: '#06b6d4',      // cyan-500
    secondary: '#10b981',    // emerald-500
    accent: '#8b5cf6',       // violet-500
    warning: '#f59e0b',      // amber-500
    danger: '#ef4444',       // red-500
    muted: '#6b7280',        // gray-500

    // Palette pour les graphiques multiples
    palette: [
        '#06b6d4', // cyan
        '#10b981', // emerald
        '#8b5cf6', // violet
        '#f59e0b', // amber
        '#ec4899', // pink
        '#3b82f6', // blue
        '#14b8a6', // teal
        '#f97316', // orange
    ],

    // Statuts utilisateurs
    verified: '#10b981',
    trusted: '#3b82f6',
    pending: '#f59e0b',
    banned: '#ef4444',
    rejected: '#f97316',

    // Statuts annonces
    approved: '#10b981',
    active: '#10b981',
    sold: '#3b82f6',
    archived: '#6b7280',
};

// Tooltip personnalisé
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-gray-900/95 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 shadow-xl">
                <p className="text-white/60 text-xs mb-1">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} className="text-white font-semibold text-sm" style={{ color: entry.color }}>
                        {entry.name}: {entry.value.toLocaleString('fr-FR')}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

// ============================================
// LINE CHART - Évolution temporelle
// ============================================
interface TimelineChartProps {
    data: { date: string; label: string; count: number }[];
    dataKey?: string;
    color?: string;
    height?: number;
    showArea?: boolean;
    title?: string;
}

export function TimelineChart({
    data,
    dataKey = 'count',
    color = CHART_COLORS.primary,
    height = 300,
    showArea = true,
    title,
}: TimelineChartProps) {
    return (
        <div className="w-full">
            {title && (
                <h3 className="text-white/80 text-sm font-medium mb-4">{title}</h3>
            )}
            <ResponsiveContainer width="100%" height={height}>
                {showArea ? (
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis
                            dataKey="label"
                            stroke="rgba(255,255,255,0.4)"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="rgba(255,255,255,0.4)"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            allowDecimals={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey={dataKey}
                            stroke={color}
                            strokeWidth={2}
                            fill={`url(#gradient-${color.replace('#', '')})`}
                            name="Valeur"
                        />
                    </AreaChart>
                ) : (
                    <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis
                            dataKey="label"
                            stroke="rgba(255,255,255,0.4)"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="rgba(255,255,255,0.4)"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            allowDecimals={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                            type="monotone"
                            dataKey={dataKey}
                            stroke={color}
                            strokeWidth={2}
                            dot={{ fill: color, strokeWidth: 0, r: 3 }}
                            activeDot={{ fill: color, strokeWidth: 0, r: 5 }}
                            name="Valeur"
                        />
                    </LineChart>
                )}
            </ResponsiveContainer>
        </div>
    );
}

// ============================================
// MULTI-LINE CHART - Plusieurs séries
// ============================================
interface MultiLineChartProps {
    data: any[];
    lines: { dataKey: string; name: string; color: string }[];
    height?: number;
}

export function MultiLineChart({ data, lines, height = 300 }: MultiLineChartProps) {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                    {lines.map((line) => (
                        <linearGradient key={line.dataKey} id={`gradient-${line.dataKey}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={line.color} stopOpacity={0.2} />
                            <stop offset="95%" stopColor={line.color} stopOpacity={0} />
                        </linearGradient>
                    ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis
                    dataKey="label"
                    stroke="rgba(255,255,255,0.4)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="rgba(255,255,255,0.4)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                    wrapperStyle={{ paddingTop: '10px' }}
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => <span className="text-white/60 text-xs">{value}</span>}
                />
                {lines.map((line) => (
                    <Area
                        key={line.dataKey}
                        type="monotone"
                        dataKey={line.dataKey}
                        name={line.name}
                        stroke={line.color}
                        strokeWidth={2}
                        fill={`url(#gradient-${line.dataKey})`}
                    />
                ))}
            </AreaChart>
        </ResponsiveContainer>
    );
}

// ============================================
// BAR CHART - Comparaisons
// ============================================
interface BarChartProps {
    data: { name: string; value: number; color?: string }[];
    height?: number;
    layout?: 'horizontal' | 'vertical';
    showValues?: boolean;
    color?: string;
}

export function SimpleBarChart({
    data,
    height = 300,
    layout = 'vertical',
    showValues = true,
    color = CHART_COLORS.primary,
}: BarChartProps) {
    const isHorizontal = layout === 'horizontal';

    return (
        <ResponsiveContainer width="100%" height={height}>
            <BarChart
                data={data}
                layout={isHorizontal ? 'vertical' : 'horizontal'}
                margin={{ top: 10, right: showValues ? 40 : 10, left: isHorizontal ? 80 : 0, bottom: 0 }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                {isHorizontal ? (
                    <>
                        <XAxis type="number" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis
                            dataKey="name"
                            type="category"
                            stroke="rgba(255,255,255,0.4)"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            width={75}
                        />
                    </>
                ) : (
                    <>
                        <XAxis
                            dataKey="name"
                            stroke="rgba(255,255,255,0.4)"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            interval={0}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                        />
                        <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} />
                    </>
                )}
                <Tooltip content={<CustomTooltip />} />
                <Bar
                    dataKey="value"
                    name="Nombre"
                    radius={[4, 4, 0, 0]}
                    label={showValues ? {
                        position: isHorizontal ? 'right' : 'top',
                        fill: 'rgba(255,255,255,0.6)',
                        fontSize: 11,
                    } : false}
                >
                    {data.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={entry.color || CHART_COLORS.palette[index % CHART_COLORS.palette.length]}
                        />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}

// ============================================
// DONUT CHART - Répartitions
// ============================================
interface DonutChartProps {
    data: { name: string; value: number; color: string }[];
    height?: number;
    innerRadius?: number;
    outerRadius?: number;
    showLabels?: boolean;
    showLegend?: boolean;
    centerLabel?: string;
    centerValue?: string | number;
}

export function DonutChart({
    data,
    height = 250,
    innerRadius = 60,
    outerRadius = 90,
    showLabels = false,
    showLegend = true,
    centerLabel,
    centerValue,
}: DonutChartProps) {
    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="relative">
            <ResponsiveContainer width="100%" height={height}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={innerRadius}
                        outerRadius={outerRadius}
                        paddingAngle={2}
                        dataKey="value"
                        label={showLabels ? ({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)` : false}
                        labelLine={showLabels}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                </PieChart>
            </ResponsiveContainer>

            {/* Centre du donut */}
            {(centerLabel || centerValue) && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                        {centerValue && (
                            <p className="text-2xl font-bold text-white">
                                {typeof centerValue === 'number' ? centerValue.toLocaleString('fr-FR') : centerValue}
                            </p>
                        )}
                        {centerLabel && (
                            <p className="text-xs text-white/50">{centerLabel}</p>
                        )}
                    </div>
                </div>
            )}

            {/* Légende */}
            {showLegend && (
                <div className="flex flex-wrap justify-center gap-3 mt-2">
                    {data.filter(d => d.value > 0).map((entry, index) => (
                        <div key={index} className="flex items-center gap-1.5">
                            <div
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-xs text-white/60">{entry.name}</span>
                            <span className="text-xs text-white font-medium">
                                ({total > 0 ? Math.round((entry.value / total) * 100) : 0}%)
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ============================================
// STAT CARD avec mini sparkline
// ============================================
interface SparklineCardProps {
    title: string;
    value: number | string;
    data: { value: number }[];
    trend?: number;
    color?: string;
}

export function SparklineCard({ title, value, data, trend, color = CHART_COLORS.primary }: SparklineCardProps) {
    return (
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-white/60 text-xs mb-1">{title}</p>
            <div className="flex items-end justify-between">
                <div>
                    <p className="text-2xl font-bold text-white">
                        {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
                    </p>
                    {trend !== undefined && (
                        <span className={`text-xs ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {trend >= 0 ? '+' : ''}{trend}%
                        </span>
                    )}
                </div>
                <div className="w-20 h-8">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke={color}
                                strokeWidth={1.5}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
