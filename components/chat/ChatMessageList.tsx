'use client'

import React, { useRef, useEffect } from 'react'
import { ChatMessage } from '@/types'
import { Bot, User, ImageIcon } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface Props {
    messages: ChatMessage[]
    isTyping: boolean
}

export default function ChatMessageList({ messages, isTyping }: Props) {
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isTyping])

    return (
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 no-scrollbar pb-32">
            {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 px-8 mt-12">
                    <div className="w-16 h-16 bg-teal-50 rounded-3xl flex items-center justify-center text-teal-600">
                        <Bot className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-slate-900 font-black text-xl leading-tight">¡Hola! Soy tu asistente</h3>
                        <p className="text-slate-500 text-sm mt-2">Podés consultarme dudas de tu plan, valor nutricional de alimentos o enviarme fotos de etiquetas.</p>
                    </div>
                </div>
            )}

            {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border ${msg.role === 'user'
                                ? 'bg-slate-900 text-white border-slate-900'
                                : 'bg-teal-600 text-white border-teal-600'
                            }`}>
                            {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                        </div>

                        <div className="space-y-2">
                            <div className={`p-4 rounded-3xl text-sm leading-relaxed ${msg.role === 'user'
                                    ? 'bg-slate-900 text-white rounded-tr-none'
                                    : 'bg-white text-slate-800 border border-slate-100 shadow-sm rounded-tl-none ProseMirror'
                                }`}>
                                {msg.image_url && (
                                    <div className="mb-3 rounded-xl overflow-hidden border border-white/20">
                                        <img src={msg.image_url} alt="Consulta" className="max-h-48 w-full object-cover" />
                                    </div>
                                )}
                                <ReactMarkdown className="prose prose-sm prose-slate dark:prose-invert">
                                    {msg.content}
                                </ReactMarkdown>
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium px-2 block">
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                </div>
            ))}

            {isTyping && (
                <div className="flex justify-start">
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center border border-teal-600">
                            <Bot className="w-4 h-4" />
                        </div>
                        <div className="bg-white border border-slate-100 p-4 rounded-3xl rounded-tl-none flex gap-1">
                            <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
                        </div>
                    </div>
                </div>
            )}
            <div ref={bottomRef} h-1 />
        </div>
    )
}
