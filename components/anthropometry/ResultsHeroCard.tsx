import React from 'react'

interface ResultsHeroCardProps {
    date: string
    isakLevel: 1 | 2
    patientName?: string
    weight: number
    bmi: number
    bfPct: number
    muscle: number
    deltas?: {
        weight?: number
        bmi?: number
        bfPct?: number
        muscle?: number
    }
}

export default function ResultsHeroCard({
    date, isakLevel, patientName,
    weight, bmi, bfPct, muscle, deltas = {}
}: ResultsHeroCardProps) {

    // Format valid Date
    const d = new Date(date)
    // Avoid timezone offset bugs by just rendering the exact string if parsing failed
    const formattedDate = isNaN(d.getTime()) ? date : d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })

    return (
        <div className="bg-teal-600 rounded-3xl p-6 text-white shadow-lg shadow-teal-600/20 relative overflow-hidden">
            {/* Background pattern */}
            <svg className="absolute top-0 right-0 w-64 h-64 text-teal-500 opacity-30 transform translate-x-1/3 -translate-y-1/3" fill="currentColor" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" />
            </svg>

            <div className="relative z-10">
                <div className="flex items-center space-x-2 mb-6 opacity-90">
                    <span className="bg-white/20 px-2.5 py-1 rounded-md text-xs font-bold backdrop-blur-sm">
                        ISAK Nivel {isakLevel}
                    </span>
                    <span className="text-sm font-medium">{formattedDate}</span>
                    {patientName && (
                        <>
                            <span className="text-teal-300">•</span>
                            <span className="text-sm font-medium truncate">{patientName}</span>
                        </>
                    )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    <HeroMetric label="Peso (kg)" value={weight} delta={deltas.weight} inverse={false} />
                    <HeroMetric label="IMC" value={bmi} delta={deltas.bmi} inverse={true} />
                    <HeroMetric label="% Grasa" value={bfPct} delta={deltas.bfPct} inverse={true} />
                    <HeroMetric label="M. Muscular (kg)" value={muscle} delta={deltas.muscle} inverse={false} />
                </div>
            </div>
        </div>
    )
}

function HeroMetric({ label, value, delta, inverse }: { label: string, value: number, delta?: number, inverse: boolean }) {
    let deltaIcon = ''
    let deltaColor = 'text-white/70'

    if (delta !== undefined && delta !== 0) {
        const isUp = delta > 0
        const isBetter = inverse ? !isUp : isUp

        deltaIcon = isUp ? '▲' : '▼'
        deltaColor = isBetter ? 'text-teal-200' : 'text-rose-300'
    }

    return (
        <div>
            <p className="text-teal-100 text-xs font-semibold uppercase tracking-wider mb-1">{label}</p>
            <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-black">{value}</span>
                {delta !== undefined && delta !== 0 && (
                    <span className={`text-sm font-bold flex items-center ${deltaColor}`}>
                        <span className="text-[10px] mr-0.5">{deltaIcon}</span>
                        {Math.abs(delta).toFixed(1)}
                    </span>
                )}
            </div>
        </div>
    )
}
