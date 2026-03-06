import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { AnthropometryEval, Profile, ISAKLevel } from '@/types'

const styles = StyleSheet.create({
    page: { padding: 40, fontFamily: 'Helvetica', backgroundColor: '#FFFFFF' },
    header: { marginBottom: 20, borderBottom: '2px solid #0D7C72', paddingBottom: 12 },
    title: { fontSize: 20, color: '#0D7C72', fontWeight: 'bold' },
    subtitle: { fontSize: 10, color: '#5A7070', marginTop: 4 },
    sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#1A2E2C', marginTop: 15, marginBottom: 10, backgroundColor: '#F1F5F9', padding: 5 },
    resultRow: { flexDirection: 'row', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingVertical: 4, paddingHorizontal: 5 },
    resultLabel: { fontSize: 9, color: '#475569' },
    resultValueGroup: { flexDirection: 'row', gap: 10 },
    resultValue: { fontSize: 10, fontWeight: 'bold', minWidth: 50, textAlign: 'right' },
    resultCategory: { fontSize: 8, color: '#64748B', fontStyle: 'italic', minWidth: 80 },
    measureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 5 },
    measureItem: { width: '45%', marginBottom: 5 },
    measureLabel: { fontSize: 8, color: '#64748B' },
    measureValue: { fontSize: 9, color: '#1E293B', fontWeight: 'bold' },
    footer: { position: 'absolute', bottom: 30, left: 40, right: 40, borderTop: '1px solid #D4E8E5', paddingTop: 8 },
    footerText: { fontSize: 8, color: '#8A9E9C', textAlign: 'center' },
})

interface Props {
    evaluation: AnthropometryEval
    patient: Profile
}

export function EvalPDF({ evaluation, patient }: Props) {
    const { results, measures } = evaluation

    return (
        <Document title={`Evaluación Antropométrica - ${patient.full_name}`}>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>NutriApp — Informe Antropométrico</Text>
                    <Text style={styles.subtitle}>{patient.full_name} · Nivel ISAK {evaluation.isak_level}</Text>
                    <Text style={styles.subtitle}>Fecha: {new Date(evaluation.eval_date).toLocaleDateString('es-AR')}</Text>
                </View>

                {/* Resultados Principales */}
                <View>
                    <Text style={styles.sectionTitle}>RESULTADOS Y COMPOSICIÓN</Text>

                    <ResultRow label="Índice de Masa Corporal (IMC)" value={results?.bmi.value.toFixed(1)} unit="kg/m²" category={results?.bmi.label} />
                    <ResultRow label="Porcentaje de Grasa Corporal" value={results?.body_fat_pct.value.toFixed(1)} unit="%" category={results?.body_fat_pct.label} />
                    <ResultRow label="Masa Muscular Estimada" value={results?.muscle_mass_kg.value.toFixed(1)} unit="kg" category={results?.muscle_mass_kg.label} />
                    <ResultRow label="Masa Ósea" value={results?.bone_mass_kg.value.toFixed(2)} unit="kg" category={results?.bone_mass_kg.label} />
                    <ResultRow label="Masa Residual" value={results?.residual_mass_kg.value.toFixed(2)} unit="kg" category={results?.residual_mass_kg.label} />
                    <ResultRow label="Relación Cintura-Cadera (RCC)" value={results?.whr.value.toFixed(2)} unit="" category={results?.whr.label} />

                    {results?.somatotype && (
                        <View style={{ marginTop: 10 }}>
                            <Text style={styles.sectionTitle}>SOMATOTIPO</Text>
                            <View style={styles.resultRow}>
                                <Text style={styles.resultLabel}>
                                    Endomorfia: {results.somatotype.endomorphy.toFixed(1)} |
                                    Mesomorfia: {results.somatotype.mesomorphy.toFixed(1)} |
                                    Ectomorfia: {results.somatotype.ectomorphy.toFixed(1)}
                                </Text>
                                <Text style={styles.resultValue}>Dominante: {results.somatotype.dominant}</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Medidas Registradas */}
                <View>
                    <Text style={styles.sectionTitle}>MEDIDAS REGISTRADAS</Text>
                    <View style={styles.measureGrid}>
                        <MeasureItem label="Peso" value={measures.weight_kg} unit="kg" />
                        <MeasureItem label="Estatura" value={measures.height_cm} unit="cm" />

                        {measures.skinfold_triceps && <MeasureItem label="Pliegue Tríceps" value={measures.skinfold_triceps} unit="mm" />}
                        {measures.skinfold_subscapular && <MeasureItem label="Pliegue Subescapular" value={measures.skinfold_subscapular} unit="mm" />}
                        {measures.skinfold_suprailiac && <MeasureItem label="Pliegue Suprailiaco" value={measures.skinfold_suprailiac} unit="mm" />}
                        {measures.skinfold_calf_medial && <MeasureItem label="Pliegue Pantorrilla" value={measures.skinfold_calf_medial} unit="mm" />}

                        {measures.circ_waist && <MeasureItem label="Cincunf. Cintura" value={measures.circ_waist} unit="cm" />}
                        {measures.circ_hip && <MeasureItem label="Circunf. Cadera" value={measures.circ_hip} unit="cm" />}
                        {measures.circ_arm_relaxed && <MeasureItem label="Circunf. Brazo" value={measures.circ_arm_relaxed} unit="cm" />}
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        ⚕️ Los resultados de este informe deben ser interpretados por un profesional. Este documento es propiedad del paciente.
                    </Text>
                </View>
            </Page>
        </Document>
    )
}

function ResultRow({ label, value, unit, category }: { label: string, value?: string, unit: string, category?: string }) {
    if (!value) return null
    return (
        <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>{label}</Text>
            <View style={styles.resultValueGroup}>
                <Text style={styles.resultValue}>{value} {unit}</Text>
                <Text style={styles.resultCategory}>{category}</Text>
            </View>
        </View>
    )
}

function MeasureItem({ label, value, unit }: { label: string, value: number, unit: string }) {
    return (
        <View style={styles.measureItem}>
            <Text style={styles.measureLabel}>{label}</Text>
            <Text style={styles.measureValue}>{value} {unit}</Text>
        </View>
    )
}
