import { updateSession } from '@/lib/supabase/middleware'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    return await updateSession(request)
}

export const config = {
    matcher: [
        /*
         * Aplicar en todas las rutas excepto:
         * - _next/static (archivos estáticos)
         * - _next/image (imágenes optimizadas)
         * - favicon.ico
         * - archivos en /public (icons, manifest.json, sw.js, workbox-*)
         */
        '/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js|workbox-.*\\.js).*)',
    ],
}
