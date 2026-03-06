'use client'

import React from 'react'
import BodyFigureFemale from './BodyFigureFemale'
import BodyFigureMale from './BodyFigureMale'
import type { AnthropometryResults, RangeCategory, BodyZone } from '@/types'

interface BodyFigureProps {
    sex: 'F' | 'M'
    results: AnthropometryResults | undefined
    activeZone: BodyZone | null
    onZoneClick?: (zone: BodyZone) => void
}

export default function BodyFigure({ sex, results, activeZone, onZoneClick }: BodyFigureProps) {
    // Definimos qué color mapea a cada zona según los resultados
    const getZoneCategory = (zone: BodyZone): RangeCategory => {
        if (!results) return 'referencia'

        switch (zone) {
            case 'chest':
                return results.body_fat_pct?.category || 'referencia'
            case 'back':
                return results.body_fat_pct?.category || 'referencia' // Usamos grasa o IMC
            case 'waist':
                return results.whr?.category || 'referencia'
            case 'hips':
                return results.whr?.category || 'referencia'
            case 'arms':
                return results.muscle_mass_kg?.category || 'referencia'
            case 'thighs':
                return results.muscle_mass_kg?.category || 'referencia'
            case 'calves':
                return results.muscle_mass_kg?.category || 'referencia'
            default:
                return 'referencia'
        }
    }

    const getZoneColor = (zone: BodyZone) => {
        const cat = getZoneCategory(zone)
        if (cat === 'normal') return '#10B981' // emerald-500
        if (cat === 'limite') return '#F59E0B' // amber-500
        if (cat === 'riesgo') return '#F43F5E' // rose-500
        return '#CBD5E1' // slate-300 (referencia)
    }

    const Figure = sex === 'F' ? BodyFigureFemale : BodyFigureMale

    return (
        <div className="relative w-full max-w-sm mx-auto aspect-[1/2] flex items-center justify-center">
            <Figure
                activeZone={activeZone}
                onZoneClick={onZoneClick}
                getZoneColor={getZoneColor}
            />
        </div>
    )
}
