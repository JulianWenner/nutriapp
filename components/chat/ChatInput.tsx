'use client'

import React, { useState, useRef } from 'react'
import { Send, Image as ImageIcon, X, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Props {
    onSend: (message: string, imageUrl?: string) => void
    disabled?: boolean
}

export default function ChatInput({ onSend, disabled }: Props) {
    const [text, setText] = useState('')
    const [uploading, setUploading] = useState(false)
    const [preview, setPreview] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleSend = () => {
        if (!text.trim() && !preview) return
        onSend(text, preview || undefined)
        setText('')
        setPreview(null)
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const filePath = `chat-images/${user.id}/${Date.now()}-${file.name}`
        const { error: uploadError } = await supabase.storage
            .from('chat-images')
            .upload(filePath, file)

        if (uploadError) {
            console.error('Error al subir imagen:', uploadError)
            setUploading(false)
            return
        }

        const { data: { publicUrl } } = supabase.storage
            .from('chat-images')
            .getPublicUrl(filePath)

        setPreview(publicUrl)
        setUploading(false)
    }

    return (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 pb-4">
            <div className="bg-white rounded-3xl p-2 border border-slate-100 shadow-2xl shadow-slate-900/10">

                {preview && (
                    <div className="relative w-20 h-20 mb-2 ml-2 rounded-2xl overflow-hidden group">
                        <img src={preview} alt="Vista previa" className="w-full h-full object-cover" />
                        <button
                            onClick={() => setPreview(null)}
                            className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                )}

                <div className="flex items-end gap-2 px-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={disabled || uploading}
                        className="p-3 bg-slate-50 text-slate-400 hover:text-teal-600 rounded-2xl transition-all disabled:opacity-50"
                    >
                        {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
                    </button>

                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Escribí tu duda aquí..."
                        className="flex-1 py-3 bg-transparent border-none focus:ring-0 text-sm max-h-32 min-h-[44px] resize-none no-scrollbar text-slate-800"
                        rows={1}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                handleSend()
                            }
                        }}
                    />

                    <button
                        onClick={handleSend}
                        disabled={disabled || uploading || (!text.trim() && !preview)}
                        className="p-3 bg-teal-600 text-white rounded-2xl transition-all shadow-lg shadow-teal-600/30 disabled:opacity-50 active:scale-95"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    )
}
