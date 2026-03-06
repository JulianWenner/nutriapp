'use client'

import React from 'react'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts'

interface ChartDataPoint {
    date: string
    value: number
}

interface EvolutionLineChartProps {
    data: ChartDataPoint[]
    color?: string
    unit?: string
}

export default function EvolutionLineChart({ data, color = '#0D7C72', unit = '' }: EvolutionLineChartProps) {
    if (!data || data.length === 0) {
        return <div className="h-48 flex items-center justify-center text-sm text-slate-400">Sin datos suficientes</div>
    }

    const formatYAxis = (tickItem: string | number) => {
        return Number(tickItem).toFixed(1)
    }

    // Only one point? Add a duplicate slightly offset to make it render a line/dot
    const chartData = data.length === 1
        ? [{ date: 'Inicio', value: data[0].value }, { ...data[0] }]
        : [...data].reverse() // Assuming we get newest first, we want oldest left -> newest right on X axis

    return (
        <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10, fill: '#94A3B8' }}
                        axisLine={false}
                        tickLine={false}
                        dy={10}
                    />
                    <YAxis
                        tickFormatter={formatYAxis}
                        tick={{ fontSize: 10, fill: '#94A3B8' }}
                        axisLine={false}
                        tickLine={false}
                        domain={['dataMin - 1', 'dataMax + 1']}
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: string | number | undefined) => value ? `${value} ${unit}` : ''}
                        labelStyle={{ color: '#64748B', fontSize: '12px', marginBottom: '4px' }}
                    />
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke={color}
                        strokeWidth={3}
                        dot={{ r: 4, fill: color, strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6, fill: color, strokeWidth: 0 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}
