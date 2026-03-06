'use client'

import React, { useState, useEffect } from 'react'
import { ChatMessage, AIUsage } from '@/types'
import ChatMessageList from '@/components/chat/ChatMessageList'
import ChatInput from '@/components/chat/ChatInput'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Bot, ChevronLeft, Sparkles, MessageCircle } from 'lucide-react'
import Link from 'next/link'

export default function AsistentePage() {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [isTyping, setIsTyping] = useState(false)
    const [usage, setUsage] = useState<AIUsage | null>(null)
    const [loadingHistory, setLoadingHistory] = useState(true)

    // Cargar historial al inicio
    useEffect(() => {
        const loadHistory = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // 1. Obtener patientId
            const { data: patient } = await supabase
                .from('patients')
                .select('id')
                .eq('profile_id', user.id)
                .single()

            if (!patient) return

            // 2. Cargar mensajes
            const { data } = await supabase
                .from('ai_chat_messages')
                .select('*')
                .eq('patient_id', patient.id)
                .order('created_at', { ascending: true })
                .limit(20)

            if (data) setMessages(data)

            // 3. Cargar limite diario (fallback fetch simple)
            const usageRes = await fetch(`/api/chat/usage`).catch(() => null)
            if (usageRes?.ok) {
                const usageData = await usageRes.json()
                setUsage(usageData)
            }

            setLoadingHistory(false)
        }
        loadHistory()
    }, [])

    const handleSendMessage = async (text: string, imageUrl?: string) => {
        if (!text.trim() && !imageUrl) return

        // Validación de uso previa
        if (usage && usage.remaining <= 0) {
            toast.error('Límite diario alcanzado con la IA. Mañana podrás preguntar más.')
            return
        }

        const userMsg: ChatMessage = {
            id: 'temp-' + Date.now(),
            patient_id: '',
            role: 'user',
            content: text,
            image_url: imageUrl,
            created_at: new Date().toISOString()
        }

        setMessages(prev => [...prev, userMsg])
        setIsTyping(true)

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                body: JSON.stringify({ message: text, image_url: imageUrl })
            })

            if (!response.ok) {
                const errData = await response.json()
                throw new Error(errData.error || 'Ocurrió un error')
            }

            if (!response.body) throw new Error('Cuerpo de respuesta vacío')

            // Lectura de streaming
            const reader = response.body.getReader()
            const decoder = new TextEncoder()
            let assistantContent = ''

            const assistantMsg: ChatMessage = {
                id: 'assistant-' + Date.now(),
                patient_id: '',
                role: 'assistant',
                content: '',
                created_at: new Date().toISOString()
            }
            setMessages(prev => [...prev, assistantMsg])

            while (true) {
                const { value, done } = await reader.read()
                if (done) break
                const chunk = new TextDecoder().decode(value)
                assistantContent += chunk
                setMessages(prev => {
                    const last = prev[prev.length - 1]
                    if (last.role === 'assistant') {
                        return [...prev.slice(0, -1), { ...last, content: assistantContent }]
                    }
                    return prev
                })
            }

            // Actualizar uso remanente
            setUsage(prev => prev ? { ...prev, remaining: prev.remaining - 1 } : null)

        } catch (error: any) {
            toast.error(error.message || 'Error al conectar con la IA')
            setMessages(prev => prev.filter(m => m.id !== userMsg.id))
        } finally {
            setIsTyping(false)
        }
    }

    return (
        <main className="min-h-screen bg-slate-50 flex flex-col pt-safe px-safe">

            {/* Header Flotante */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-4 py-4 flex items-center justify-between">
                <Link href="/inicio" className="w-10 h-10 flex items-center justify-center bg-slate-100 rounded-2xl text-slate-500 hover:bg-slate-200 transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                </Link>

                <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-teal-600" />
                        <span className="font-black text-slate-900 tracking-tight">NutriAI Asistente</span>
                    </div>
                    {usage && (
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            Quedan {usage.remaining} consultas hoy
                        </span>
                    )}
                </div>

                <div className="w-10 h-10 bg-teal-50 rounded-2xl flex items-center justify-center border border-teal-100">
                    <Bot className="w-5 h-5 text-teal-600" />
                </div>
            </div>

            {/* Lista de Mensajes */}
            <ChatMessageList messages={messages} isTyping={isTyping} />

            {/* Input Flotante */}
            <ChatInput onSend={handleSendMessage} disabled={isTyping} />
        </main>
    )
}
