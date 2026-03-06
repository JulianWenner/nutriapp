import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import NutritionistNav from '@/components/layout/NutritionistNav'
import NotificationListener from '@/components/layout/NotificationListener'
import { Toaster as SonnerToaster } from 'sonner'

export default async function NutritionistLayout({
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

    if (profile?.role !== 'nutricionista') redirect('/inicio')

    async function handleSignOut() {
        'use server'
        const supabase = createClient()
        await supabase.auth.signOut()
        redirect('/login')
    }

    return (
        <div className="min-h-screen bg-slate-50/50 flex">
            {/* Navigation (Sticky/Fixed) */}
            <NutritionistNav onSignOut={handleSignOut} />

            {/* Listeners */}
            <NotificationListener role="nutricionista" />

            {/* Main Content Area */}
            <main className="flex-1 md:pl-64 pb-24 md:pb-8 animate-in fade-in duration-700">
                <div className="max-w-7xl mx-auto min-h-screen relative">
                    {children}
                </div>
            </main>

            {/* Global Feedback */}
            <SonnerToaster richColors position="bottom-right" />
        </div>
    )
}
