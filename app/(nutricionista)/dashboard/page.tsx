import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'nutricionista') redirect('/inicio')

    async function signOut() {
        'use server'
        const supabase = createClient()
        await supabase.auth.signOut()
        redirect('/login')
    }

    return (
        <main
            className="min-h-screen flex flex-col items-center justify-center px-4"
            style={{ backgroundColor: '#EEF4F3' }}
        >
            <div className="bg-white rounded-2xl shadow-lg px-8 py-10 w-full max-w-md text-center">
                <div
                    className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
                    style={{ backgroundColor: '#0D7C72' }}
                >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
                        <path d="M16 3v4M8 3v4M12 12v.01" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-1">
                    Panel nutricionista
                </h1>
                <p className="text-gray-500 text-sm mb-8">
                    Bienvenida, <span className="font-semibold text-gray-700">{profile?.full_name || user.email}</span>
                </p>

                <div
                    className="rounded-xl border-2 border-dashed px-6 py-8 mb-8"
                    style={{ borderColor: '#0D7C72', backgroundColor: '#f0faf9' }}
                >
                    <p className="text-sm font-medium" style={{ color: '#0D7C72' }}>
                        🚧 Fase 2 en construcción
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        Aquí irá el panel completo de la nutricionista
                    </p>
                </div>

                <form action={signOut}>
                    <button
                        type="submit"
                        className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold border-2 transition-colors duration-200"
                        style={{ borderColor: '#0D7C72', color: '#0D7C72' }}
                    >
                        Cerrar sesión
                    </button>
                </form>
            </div>
        </main>
    )
}
