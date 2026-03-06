import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import EmptyState from '@/components/ui/EmptyState'
import { Users } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AntropometriaIndex() {
    const supabase = createClient()

    // Solo nutricionista
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'nutricionista') redirect('/inicio')

    // Listar todos los pacientes para elegir a quién evaluar
    const { data: patients } = await supabase
        .from('patients')
        .select(`
            id,
            profiles(full_name, email)
        `)
        .order('created_at', { ascending: false })

    return (
        <main className="max-w-4xl mx-auto p-4 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Antropometría</h1>
                    <p className="text-slate-500 mt-1">Seleccioná un paciente para ver su historial o registrar una nueva evaluación.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <ul className="divide-y divide-slate-100">
                    {patients?.map((p: { id: string, profiles: { full_name: string; email: string } | { full_name: string; email: string }[] | null }) => (
                        <li key={p.id} className="group hover:bg-slate-50 transition-colors">
                            <Link href={`/antropometria/${p.id}`} className="flex items-center justify-between p-4 md:p-6 cursor-pointer">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800 group-hover:text-teal-700 transition-colors">
                                        {Array.isArray(p.profiles) ? p.profiles[0]?.full_name : (p.profiles as { full_name: string, email: string } | null)?.full_name}
                                    </h2>
                                    <p className="text-sm text-slate-500">{Array.isArray(p.profiles) ? p.profiles[0]?.email : (p.profiles as { full_name: string, email: string } | null)?.email}</p>
                                </div>

                                <span className="text-teal-600 bg-teal-50 px-4 py-2 rounded-xl text-sm font-bold border border-teal-100 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                                    Ver historial ➔
                                </span>
                            </Link>
                        </li>
                    ))}
                    {!patients?.length && (
                        <div className="p-8">
                            <EmptyState
                                icon={Users}
                                title="Sin pacientes aún"
                                description="Todavía no hay pacientes registrados en el sistema de nutrición."
                            />
                        </div>
                    )}
                </ul>
            </div>
        </main>
    )
}
