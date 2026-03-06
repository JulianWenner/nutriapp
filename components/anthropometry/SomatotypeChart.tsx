import React from 'react'

interface SomatotypeChartProps {
    endomorphy: number
    mesomorphy: number
    ectomorphy: number
    dominant: string
}

export default function SomatotypeChart({ endomorphy, mesomorphy, ectomorphy, dominant }: SomatotypeChartProps) {
    // Normalizar a porcentaje (asumiendo max razonable ~10 para graficar)
    const normalize = (v: number) => Math.min(Math.max((v / 10) * 100, 0), 100)

    return (
        <div className="bg-white border-2 border-slate-100 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-700">Somatotipo Heath-Carter</h3>
                <span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-bold border border-teal-100">
                    {dominant}
                </span>
            </div>

            <div className="space-y-4">
                <BarRow label="Endomorfia" value={endomorphy} pct={normalize(endomorphy)} color="bg-rose-400" />
                <BarRow label="Mesomorfia" value={mesomorphy} pct={normalize(mesomorphy)} color="bg-amber-400" />
                <BarRow label="Ectomorfia" value={ectomorphy} pct={normalize(ectomorphy)} color="bg-emerald-400" />
            </div>

            <p className="text-xs text-slate-400 mt-4 text-center">
                Calculado con sumatoria de pliegues, diámetros óseos, perímetros musculares e índice ponderal.
            </p>
        </div>
    )
}

function BarRow({ label, value, pct, color }: { label: string, value: number, pct: number, color: string }) {
    return (
        <div>
            <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                <span>{label}</span>
                <span className="text-slate-700">{value}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                    className={`h-full rounded-full ${color} transition-all duration-1000`}
                    style={{ width: `${pct}%` }}
                ></div>
            </div>
        </div>
    )
}
