import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function InicioPacientePage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'paciente') redirect('/dashboard')

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
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-1">
                    Portal paciente
                </h1>
                <p className="text-gray-500 text-sm mb-8">
                    Hola, <span className="font-semibold text-gray-700">{profile?.full_name || user.email}</span>
                </p>

                <div
                    className="rounded-xl border-2 border-dashed px-6 py-8 mb-8"
                    style={{ borderColor: '#0D7C72', backgroundColor: '#f0faf9' }}
                >
                    <p className="text-sm font-medium" style={{ color: '#0D7C72' }}>
                        🚧 Fase 2 en construcción
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        Aquí irá tu portal de nutrición personalizado
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
