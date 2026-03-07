import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Refrescar la sesión — IMPORTANTE: no agregar lógica entre estas dos líneas
    const {
        data: { user },
    } = await supabase.auth.getUser()

    const pathname = request.nextUrl.pathname

    // Rutas públicas — no requieren sesión
    if (pathname.startsWith('/login')) {
        return supabaseResponse
    }

    // Sin sesión → redirigir a /login
    if (!user) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // Leer el rol del usuario
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    const role = profile?.role

    // Si hay usuario pero no hay perfil (ej. base de datos limpia pero cookies viejas), evitamos el loop infinito
    if (user && !profile) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        // Devolvemos el redirect borrando la cookie de auth
        const response = NextResponse.redirect(url)
        response.cookies.delete('sb-ieqempiczotlfvmdvsnm-auth-token')
        return response
    }

    // Protección de rutas por rol
    if (role === 'paciente' && pathname.startsWith('/dashboard')) {
        const url = request.nextUrl.clone()
        url.pathname = '/inicio'
        return NextResponse.redirect(url)
    }

    if (role === 'nutricionista' && pathname.startsWith('/inicio')) {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}
