import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getNextAppointment, getPatientIdFromProfileId } from '@/lib/supabase/appointments'
import { getActivePlanForPatient } from '@/lib/supabase/plans'
import { getSharedEvals } from '@/lib/supabase/anthropometry'
import HomeAppointmentCard from '@/components/patient-portal/HomeAppointmentCard'
import HomePlanCard from '@/components/patient-portal/HomePlanCard'
import HomeEvalCard from '@/components/patient-portal/HomeEvalCard'

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

    const patientId = await getPatientIdFromProfileId(user.id)

    // Ejecución en paralelo de las queries iniciales
    const [nextAppointment, activePlan, sharedEvals] = patientId ? await Promise.all([
        getNextAppointment(patientId),
        getActivePlanForPatient(patientId),
        getSharedEvals(patientId)
    ]) : [null, null, []]

    const lastEval = sharedEvals.length > 0 ? sharedEvals[0] : null

    async function signOut() {
        'use server'
        const supabase = createClient()
        await supabase.auth.signOut()
        redirect('/login')
    }

    return (
        <main className="min-h-screen pb-20" style={{ backgroundColor: '#F8FAFC' }}>
            <div className="max-w-lg mx-auto px-4 py-8 space-y-8">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Bienvenido de nuevo</p>
                        <h1 className="text-3xl font-black text-slate-900 leading-none">
                            Hola, {profile?.full_name?.split(' ')[0] || 'Paciente'}
                        </h1>
                    </div>
                    <form action={signOut}>
                        <button type="submit" className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white border border-slate-100 shadow-sm text-slate-400 hover:text-red-500 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                        </button>
                    </form>
                </div>

                {/* Grid de Cards */}
                <div className="grid grid-cols-1 gap-6">
                    {/* Bloque 1: Turno */}
                    <HomeAppointmentCard appointment={nextAppointment} />

                    {/* Bloque 2: Plan */}
                    <HomePlanCard plan={activePlan} />

                    {/* Bloque 3: Evaluación */}
                    {lastEval && <HomeEvalCard evaluation={lastEval} />}
                </div>

                {/* Acceso rápido Asistente */}
                <Link href="/asistente" className="flex items-center gap-4 p-5 bg-teal-600 rounded-3xl text-white shadow-lg shadow-teal-600/20 hover:scale-[1.02] active:scale-95 transition-all">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 8-9.04 9.06a2.82 2.82 0 1 0 3.98 3.98L16 12" /><circle cx="17" cy="7" r="5" /></svg>
                    </div>
                    <div>
                        <h4 className="font-bold text-lg">Asistente Virtual IA</h4>
                        <p className="text-teal-50 text-xs opacity-80">Consultá sobre tu plan o alimentos</p>
                    </div>
                    <div className="ml-auto">
                        <ChevronRight className="w-6 h-6 text-white/50" />
                    </div>
                </Link>

            </div>
        </main>
    )
}

// Necesitamos importar Link y ChevronRight que no estaban en las props del componente pero sí en el JSX generado arriba
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
