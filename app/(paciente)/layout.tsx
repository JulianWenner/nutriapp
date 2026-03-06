import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PatientNav from '@/components/layout/PatientNav'
import NotificationListener from '@/components/layout/NotificationListener'
import { Toaster as SonnerToaster } from 'sonner'
import { getPatientIdFromProfileId } from '@/lib/supabase/appointments'

export default async function PatientLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'paciente') redirect('/dashboard')

    const patientId = await getPatientIdFromProfileId(user.id)

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Main Content Area */}
            <main className="pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="max-w-lg mx-auto min-h-screen relative">
                    {children}
                </div>
            </main>

            {/* Navigation (Bottom Bar) */}
            <PatientNav />

            {/* Listeners */}
            <NotificationListener role="paciente" patientId={patientId || undefined} />

            {/* Global Feedback */}
            <SonnerToaster richColors position="top-center" />
        </div>
    )
}
