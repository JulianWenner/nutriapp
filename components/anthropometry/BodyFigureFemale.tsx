import React from 'react'
import type { BodyZone } from '@/types'

interface SVGProps {
    activeZone: BodyZone | null
    onZoneClick?: (z: BodyZone) => void
    getZoneColor: (z: BodyZone) => string
}

export default function BodyFigureFemale({ activeZone, onZoneClick, getZoneColor }: SVGProps) {
    const defaultColor = '#E2E8F0'

    const styleFor = (zone: BodyZone) => {
        const isActive = activeZone === zone
        return {
            fill: getZoneColor(zone),
            opacity: isActive ? 1 : 0.6,
            stroke: isActive ? '#0f172a' : 'white',
            strokeWidth: isActive ? 3 : 1,
            cursor: 'pointer',
            transition: 'all 0.3s ease'
        }
    }

    return (
        <svg viewBox="0 0 200 400" className="w-full h-full drop-shadow-md">
            {/* Cabeza (referencia) */}
            <circle cx="100" cy="40" r="23" fill={defaultColor} stroke="white" strokeWidth="1" />
            <path d="M92,62 L108,62 L108,75 L92,75 Z" fill={defaultColor} stroke="white" strokeWidth="1" />

            {/* Pecho / Grasa */}
            <path
                d="M75,80 Q100,70 125,80 L130,135 Q100,150 70,135 Z"
                style={styleFor('chest')}
                onClick={() => onZoneClick?.('chest')}
            />

            {/* Cintura / RCC */}
            <path
                d="M70,135 Q100,150 130,135 L120,185 Q100,195 80,185 Z"
                style={styleFor('waist')}
                onClick={() => onZoneClick?.('waist')}
            />

            {/* Cadera */}
            <path
                d="M80,185 Q100,195 120,185 L135,225 Q100,240 65,225 Z"
                style={styleFor('hips')}
                onClick={() => onZoneClick?.('hips')}
            />

            {/* Brazos / Músculo (más finos que el hombre) */}
            <path
                d="M50,85 L70,85 L60,165 L40,160 Z"
                style={styleFor('arms')}
                onClick={() => onZoneClick?.('arms')}
            />
            <path
                d="M130,85 L150,85 L160,160 L140,165 Z"
                style={styleFor('arms')}
                onClick={() => onZoneClick?.('arms')}
            />
            {/* Antebrazos */}
            <path d="M40,160 L60,165 L45,225 L30,220 Z" fill={defaultColor} stroke="white" strokeWidth="1" />
            <path d="M140,165 L160,160 L170,220 L155,225 Z" fill={defaultColor} stroke="white" strokeWidth="1" />

            {/* Muslos / Piernas */}
            <path
                d="M65,225 L95,230 L85,310 L55,305 Z"
                style={styleFor('thighs')}
                onClick={() => onZoneClick?.('thighs')}
            />
            <path
                d="M105,230 L135,225 L145,305 L115,310 Z"
                style={styleFor('thighs')}
                onClick={() => onZoneClick?.('thighs')}
            />

            {/* Pantorrillas */}
            <path
                d="M55,305 L85,310 L75,380 L50,375 Z"
                style={styleFor('calves')}
                onClick={() => onZoneClick?.('calves')}
            />
            <path
                d="M115,310 L145,305 L150,375 L125,380 Z"
                style={styleFor('calves')}
                onClick={() => onZoneClick?.('calves')}
            />
        </svg>
    )
}
