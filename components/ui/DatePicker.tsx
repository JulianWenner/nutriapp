'use client'

interface DatePickerProps {
    value: string
    onChange: (value: string) => void
    label?: string
    min?: string
    required?: boolean
}

export default function DatePicker({
    value,
    onChange,
    label,
    min,
    required,
}: DatePickerProps) {
    return (
        <div>
            {label && (
                <label className="block text-sm font-medium text-dark mb-1.5">
                    {label}
                </label>
            )}
            <input
                type="date"
                value={value}
                min={min ?? new Date().toISOString().split('T')[0]}
                required={required}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border text-dark text-sm
                   outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20"
            />
        </div>
    )
}
