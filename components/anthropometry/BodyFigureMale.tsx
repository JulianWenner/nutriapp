import React from 'react'
import type { BodyZone } from '@/types'

interface SVGProps {
    activeZone: BodyZone | null
    onZoneClick?: (z: BodyZone) => void
    getZoneColor: (z: BodyZone) => string
}

export default function BodyFigureMale({ activeZone, onZoneClick, getZoneColor }: SVGProps) {
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
            <circle cx="100" cy="40" r="25" fill={defaultColor} stroke="white" strokeWidth="1" />
            <path d="M90,65 L110,65 L110,75 L90,75 Z" fill={defaultColor} stroke="white" strokeWidth="1" />

            {/* Pecho / Grasa */}
            <path
                d="M70,80 Q100,70 130,80 L135,140 Q100,150 65,140 Z"
                style={styleFor('chest')}
                onClick={() => onZoneClick?.('chest')}
            />

            {/* Cintura / RCC */}
            <path
                d="M65,140 Q100,150 135,140 L130,190 Q100,200 70,190 Z"
                style={styleFor('waist')}
                onClick={() => onZoneClick?.('waist')}
            />

            {/* Cadera */}
            <path
                d="M70,190 Q100,200 130,190 L135,220 Q100,240 65,220 Z"
                style={styleFor('hips')}
                onClick={() => onZoneClick?.('hips')}
            />

            {/* Brazos / Músculo */}
            <path
                d="M45,85 L65,85 L55,170 L35,165 Z"
                style={styleFor('arms')}
                onClick={() => onZoneClick?.('arms')}
            />
            <path
                d="M135,85 L155,85 L165,165 L145,170 Z"
                style={styleFor('arms')}
                onClick={() => onZoneClick?.('arms')}
            />
            {/* Antebrazos */}
            <path d="M35,165 L55,170 L40,230 L25,225 Z" fill={defaultColor} stroke="white" strokeWidth="1" />
            <path d="M145,170 L165,165 L175,225 L160,230 Z" fill={defaultColor} stroke="white" strokeWidth="1" />

            {/* Muslos / Piernas */}
            <path
                d="M65,220 L95,225 L85,310 L55,305 Z"
                style={styleFor('thighs')}
                onClick={() => onZoneClick?.('thighs')}
            />
            <path
                d="M105,225 L135,220 L145,305 L115,310 Z"
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
