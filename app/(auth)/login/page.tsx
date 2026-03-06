'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault()
        setError(null)
        setLoading(true)

        const { data, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (authError) {
            setError('Email o contraseña incorrectos. Intentá de nuevo.')
            setLoading(false)
            return
        }

        // Leer el rol del perfil
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single()

        if (profileError || !profile) {
            setError('No se encontró tu perfil. Contactá al administrador.')
            setLoading(false)
            return
        }

        if (profile.role === 'nutricionista') {
            router.push('/dashboard')
        } else {
            router.push('/inicio')
        }
    }

    return (
        <main
            className="min-h-screen flex items-center justify-center px-4"
            style={{ backgroundColor: '#EEF4F3' }}
        >
            <div className="w-full max-w-md">
                {/* Logo / Nombre */}
                <div className="text-center mb-8">
                    <div
                        className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 shadow-md"
                        style={{ backgroundColor: '#0D7C72' }}
                    >
                        <svg
                            width="28"
                            height="28"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z" />
                            <path d="M12 8v4l3 3" />
                        </svg>
                    </div>
                    <h1
                        className="text-3xl font-bold tracking-tight"
                        style={{ color: '#0D7C72' }}
                    >
                        NutriApp
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Nutrición profesional personalizada
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-lg px-8 py-10">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6">
                        Iniciar sesión
                    </h2>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700 mb-1.5"
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="tu@email.com"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 text-sm
                           placeholder:text-gray-400 outline-none transition
                           focus:border-[#0D7C72] focus:ring-2 focus:ring-[#0D7C72]/20"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700 mb-1.5"
                            >
                                Contraseña
                            </label>
                            <input
                                id="password"
                                type="password"
                                required
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 text-sm
                           placeholder:text-gray-400 outline-none transition
                           focus:border-[#0D7C72] focus:ring-2 focus:ring-[#0D7C72]/20"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 rounded-xl text-white text-sm font-semibold
                         transition-all duration-200 mt-2
                         disabled:opacity-60 disabled:cursor-not-allowed"
                            style={{ backgroundColor: '#0D7C72' }}
                            onMouseEnter={(e) =>
                                !loading && ((e.target as HTMLButtonElement).style.backgroundColor = '#0A6560')
                            }
                            onMouseLeave={(e) =>
                                ((e.target as HTMLButtonElement).style.backgroundColor = '#0D7C72')
                            }
                        >
                            {loading ? 'Ingresando...' : 'Ingresar'}
                        </button>
                    </form>
                </div>

                <p className="text-center text-xs text-gray-400 mt-6">
                    © {new Date().getFullYear()} NutriApp • Todos los derechos reservados
                </p>
            </div>
        </main>
    )
}
