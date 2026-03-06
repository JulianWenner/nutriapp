interface BadgeProps {
    label: string
    bg: string
    color: string
    className?: string
}

export default function Badge({ label, bg, color, className = '' }: BadgeProps) {
    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${className}`}
            style={{ backgroundColor: bg, color }}
        >
            {label}
        </span>
    )
}
