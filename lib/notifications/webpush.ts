// Notificaciones locales vía Web Push API (Sencillo, sin servicio externo)

/** Pedir permiso al usuario al iniciar sesión o en momentos clave */
export async function requestNotificationPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) return false

    if (Notification.permission === 'granted') return true

    try {
        const permission = await Notification.requestPermission()
        return permission === 'granted'
    } catch (error) {
        console.error('Error solicitando permisos de notificación:', error)
        return false
    }
}

/** Mostrar notificación local instantánea */
export function showLocalNotification(title: string, body: string, url?: string) {
    if (typeof window === 'undefined' || !('Notification' in window)) return

    if (Notification.permission !== 'granted') {
        // Si no tiene permisos, mostramos aviso por consola para debug
        console.warn('Permisos de notificación no otorgados.')
        return
    }

    const options: any = {
        body,
        icon: '/icons/icon-192x192.png', // Asegurar que existan estos iconos
        badge: '/icons/icon-192x192.png',
        vibrate: [200, 100, 200],
        requireInteraction: true
    }

    try {
        const notification = new Notification(title, options)

        if (url) {
            notification.onclick = (e) => {
                e.preventDefault()
                window.focus()
                window.location.href = url
                notification.close()
            }
        }
    } catch (err) {
        // Fallback para ServiceWorker si la API directa falla en móviles
        if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
            navigator.serviceWorker.ready.then(reg => {
                reg.showNotification(title, options)
            })
        }
    }
}
