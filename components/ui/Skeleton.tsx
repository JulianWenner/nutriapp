import React from 'react'

interface Props {
    className?: string
}

export function Skeleton({ className = '' }: Props) {
    return (
        <div
            className={`animate-pulse bg-slate-200 rounded-lg ${className}`}
            aria-hidden="true"
        />
    )
}
