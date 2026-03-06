import { format, startOfWeek, getDay } from 'date-fns'
import { es } from 'date-fns/locale'

// Obtener el lunes de la semana actual
export function getCurrentWeekStart(): string {
    const now = new Date()
    const monday = startOfWeek(now, { weekStartsOn: 1 })
    return format(monday, 'yyyy-MM-dd')
}

// Obtener día de la semana actual (1=Lunes, 7=Domingo)
export function getCurrentDayOfWeek(): number {
    const now = new Date()
    // getDay retorna 0 para domingo, 1 para lunes...
    const day = getDay(now)
    return day === 0 ? 7 : day
}

// Formatear fecha en español: "Jueves 13 de marzo"
export function formatDateSpanish(dateStr: string): string {
    const date = new Date(dateStr)
    // Ajustar zona horaria local
    const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000)
    const formatted = format(localDate, "eeee d 'de' MMMM", { locale: es })
    return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

// Obtener nombre del día: "Lunes", "Martes", etc.
export function getDayName(dayOfWeek: number): string {
    const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
    return dayNames[dayOfWeek - 1] || ''
}
