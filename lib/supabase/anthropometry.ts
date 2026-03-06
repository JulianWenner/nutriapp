import { createClient } from '@/lib/supabase/server'
import type { AnthropometryEval } from '@/types'

/** Obtener todo el historial de evaluaciones de un paciente */
export async function getEvalsByPatient(patientId: string): Promise<AnthropometryEval[]> {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('anthropometry_evals')
        .select('*')
        .eq('patient_id', patientId)
        .order('eval_date', { ascending: false })
        .order('created_at', { ascending: false })

    if (error) {
        console.error('getEvalsByPatient:', error)
        return []
    }

    return mapDBToEval(data)
}

/** Obtener solo las evaluaciones COMPARTIDAS de un paciente (vista paciente) */
export async function getSharedEvals(patientId: string): Promise<AnthropometryEval[]> {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('anthropometry_evals')
        .select('*')
        .eq('patient_id', patientId)
        .eq('shared_with_patient', true)
        .order('eval_date', { ascending: false })
        .order('created_at', { ascending: false })

    if (error) {
        console.error('getSharedEvals:', error)
        return []
    }

    return mapDBToEval(data)
}

/** Obtener solo la ÚLTIMA evaluación del paciente (útil para referencias) */
export async function getLastEval(patientId: string): Promise<AnthropometryEval | null> {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('anthropometry_evals')
        .select('*')
        .eq('patient_id', patientId)
        .order('eval_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

    if (error || !data) return null

    return mapDBToEval([data])[0]
}

/** Obtener detalle de una sola evaluación por ID */
export async function getEvalById(evalId: string): Promise<AnthropometryEval | null> {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('anthropometry_evals')
        .select('*')
        .eq('id', evalId)
        .single()

    if (error || !data) return null

    return mapDBToEval([data])[0]
}

/** Guardar evaluación (Insertar) */
export async function saveEval(payload: Omit<AnthropometryEval, 'id' | 'created_at'>): Promise<AnthropometryEval | null> {
    const supabase = createClient()

    // Flatten measurements and results into flat DB columns
    const dbPayload = {
        patient_id: payload.patient_id,
        eval_date: payload.eval_date,
        isak_level: payload.isak_level,
        shared_with_patient: payload.shared_with_patient,
        ...payload.measures,
        ...flatResultsRow(payload.results)
    }

    const { data, error } = await supabase
        .from('anthropometry_evals')
        .insert(dbPayload)
        .select()
        .single()

    if (error) {
        console.error('saveEval error:', error)
        return null
    }

    return mapDBToEval([data])[0]
}

/** Compatir / Descompartir evaluación (Toggle) */
export async function toggleShareEval(evalId: string, shared: boolean): Promise<boolean> {
    const supabase = createClient()
    const { error } = await supabase
        .from('anthropometry_evals')
        .update({ shared_with_patient: shared })
        .eq('id', evalId)

    if (error) {
        console.error('toggleShareEval error:', error)
        return false
    }

    return true
}

// === Helpers locales para Mapeo entre Estructura de BD plana y el Type anidado ===

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDBToEval(rows: any[]): AnthropometryEval[] {
    return rows.map(row => {
        const measures = {
            weight_kg: row.weight_kg,
            height_cm: row.height_cm,
            skinfold_triceps: row.skinfold_triceps,
            skinfold_subscapular: row.skinfold_subscapular,
            skinfold_suprailiac: row.skinfold_suprailiac,
            skinfold_calf_medial: row.skinfold_calf_medial,
            skinfold_biceps: row.skinfold_biceps,
            skinfold_iliac_crest: row.skinfold_iliac_crest,
            skinfold_abdominal: row.skinfold_abdominal,
            skinfold_front_thigh: row.skinfold_front_thigh,
            circ_waist: row.circ_waist,
            circ_hip: row.circ_hip,
            circ_arm_relaxed: row.circ_arm_relaxed,
            circ_calf: row.circ_calf,
            circ_head: row.circ_head,
            circ_neck: row.circ_neck,
            circ_arm_flexed: row.circ_arm_flexed,
            circ_mid_thigh: row.circ_mid_thigh,
            diam_humerus: row.diam_humerus,
            diam_femur: row.diam_femur,
            height_sitting: row.height_sitting,
            wingspan: row.wingspan
        }

        const results = row.result_bmi ? {
            bmi: {
                value: row.result_bmi,
                category: row.result_bmi_category,
                label: 'IMC',
                reference: '18.5 – 24.9'
            },
            body_fat_pct: {
                value: row.result_body_fat_pct,
                category: row.result_body_fat_category,
                label: '% Grasa',
                reference: ''
            },
            muscle_mass_kg: {
                value: row.result_muscle_mass_kg,
                category: row.result_muscle_mass_category,
                label: 'M. Muscular',
                reference: ''
            },
            bone_mass_kg: {
                value: row.result_bone_mass_kg,
                category: row.result_bone_mass_category,
                label: 'M. Ósea',
                reference: ''
            },
            residual_mass_kg: {
                value: row.result_residual_mass_kg,
                category: 'referencia',
                label: 'M. Residual',
                reference: ''
            },
            whr: {
                value: row.result_whr,
                category: row.result_whr_category,
                label: 'RCC',
                reference: ''
            },
            somatotype: row.result_somatotype_dominant ? {
                endomorphy: row.result_somatotype_endomorphy,
                mesomorphy: row.result_somatotype_mesomorphy,
                ectomorphy: row.result_somatotype_ectomorphy,
                dominant: row.result_somatotype_dominant
            } : undefined
        } : undefined

        return {
            id: row.id,
            patient_id: row.patient_id,
            eval_date: row.eval_date,
            isak_level: row.isak_level,
            shared_with_patient: row.shared_with_patient,
            created_at: row.created_at,
            measures,
            results: results as AnthropometryEval['results']
        }
    })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function flatResultsRow(r: any) {
    if (!r) return {}
    return {
        result_bmi: r.bmi?.value,
        result_bmi_category: r.bmi?.category,
        result_body_fat_pct: r.body_fat_pct?.value,
        result_body_fat_category: r.body_fat_pct?.category,
        result_muscle_mass_kg: r.muscle_mass_kg?.value,
        result_muscle_mass_category: r.muscle_mass_kg?.category,
        result_bone_mass_kg: r.bone_mass_kg?.value,
        result_bone_mass_category: r.bone_mass_kg?.category,
        result_residual_mass_kg: r.residual_mass_kg?.value,
        result_whr: r.whr?.value,
        result_whr_category: r.whr?.category,
        result_somatotype_endomorphy: r.somatotype?.endomorphy,
        result_somatotype_mesomorphy: r.somatotype?.mesomorphy,
        result_somatotype_ectomorphy: r.somatotype?.ectomorphy,
        result_somatotype_dominant: r.somatotype?.dominant
    }
}
