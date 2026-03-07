import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
    console.warn('OPENAI_API_KEY no está configurada')
}

export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy_key_for_vercel_build',
})
