import React from 'react'
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import { NutritionPlan, Profile, MEAL_SLOT_LABELS } from '@/types'

// Estilos premium para el PDF
const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Helvetica',
        backgroundColor: '#FFFFFF',
        color: '#1A2E2C'
    },
    header: {
        marginBottom: 20,
        borderBottomWidth: 2,
        borderBottomColor: '#0D7C72',
        borderBottomStyle: 'solid',
        paddingBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end'
    },
    titleContainer: {
        flex: 1
    },
    title: {
        fontSize: 22,
        color: '#0D7C72',
        fontWeight: 'bold'
    },
    subtitle: {
        fontSize: 10,
        color: '#5A7070',
        marginTop: 4,
        textTransform: 'uppercase',
        letterSpacing: 1
    },
    summaryGrid: {
        flexDirection: 'row',
        backgroundColor: '#F8FAFC',
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
        gap: 15
    },
    summaryItem: {
        flex: 1
    },
    summaryLabel: {
        fontSize: 8,
        color: '#94A3B8',
        fontWeight: 'bold',
        textTransform: 'uppercase'
    },
    summaryValue: {
        fontSize: 12,
        color: '#1E293B',
        fontWeight: 'bold',
        marginTop: 2
    },
    daySection: {
        marginBottom: 15
    },
    dayTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#0D7C72',
        marginTop: 10,
        marginBottom: 8,
        backgroundColor: '#E8F5F3',
        padding: 6,
        borderRadius: 4,
        textTransform: 'uppercase',
        letterSpacing: 1
    },
    slotContainer: {
        marginBottom: 8,
        paddingLeft: 10,
        borderLeftWidth: 1,
        borderLeftColor: '#E2E8F0',
        borderLeftStyle: 'solid'
    },
    slotTitle: {
        fontSize: 10,
        color: '#0D7C72',
        fontWeight: 'bold',
        marginBottom: 4
    },
    dishRow: {
        fontSize: 9,
        color: '#1A2E2C',
        marginBottom: 2,
        fontWeight: 'bold'
    },
    macroText: {
        fontSize: 8,
        color: '#64748B',
        marginBottom: 4
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        borderTopWidth: 1,
        borderTopColor: '#D4E8E5',
        borderTopStyle: 'solid',
        paddingTop: 10
    },
    footerText: {
        fontSize: 8,
        color: '#8A9E9C',
        textAlign: 'center',
        fontStyle: 'italic'
    },
})

interface Props {
    plan: NutritionPlan
    patient: Profile
}

export function PlanPDF({ plan, patient }: Props) {
    const days = [1, 2, 3, 4, 5, 6, 7]
    const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

    return (
        <Document title={`Plan de ${patient.full_name}`}>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>NutriApp — Plan Nutricional</Text>
                        <Text style={styles.subtitle}>{patient.full_name}</Text>
                    </View>
                    <Text style={{ fontSize: 9, color: '#94A3B8' }}>
                        Generado: {new Date().toLocaleDateString('es-AR')}
                    </Text>
                </View>

                {/* Resumen del Plan */}
                <View style={styles.summaryGrid}>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Plan</Text>
                        <Text style={styles.summaryValue}>{plan.name}</Text>
                    </View>
                    {plan.target_calories && (
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Calorías Objetivo</Text>
                            <Text style={styles.summaryValue}>{plan.target_calories} kcal/día</Text>
                        </View>
                    )}
                    {plan.target_protein && (
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Proteína</Text>
                            <Text style={styles.summaryValue}>{plan.target_protein}g</Text>
                        </View>
                    )}
                </View>

                {/* Días y Comidas */}
                {days.map((day, i) => {
                    const meals = plan.meals?.filter(m => m.day_of_week === day) ?? []
                    if (meals.length === 0) return null

                    return (
                        <View key={day} style={styles.daySection} wrap={false}>
                            <Text style={styles.dayTitle}>{dayNames[i]}</Text>
                            {meals.sort((a, b) => getSlotOrder(a.meal_slot) - getSlotOrder(b.meal_slot)).map(meal => (
                                <View key={meal.id} style={styles.slotContainer}>
                                    <Text style={styles.slotTitle}>{MEAL_SLOT_LABELS[meal.meal_slot]}</Text>
                                    {meal.dishes?.map(dish => (
                                        <View key={dish.id} style={{ marginBottom: 4 }}>
                                            <Text style={styles.dishRow}>• {dish.name}</Text>
                                            <Text style={styles.macroText}>
                                                {dish.total_calories} kcal · P: {dish.total_protein}g · C: {dish.total_carbs}g · G: {dish.total_fat}g
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            ))}
                        </View>
                    )
                })}

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        ⚕️ Este plan fue elaborado por un profesional de la nutrición para {patient.full_name}. Consulte ante cualquier duda.
                    </Text>
                </View>
            </Page>
        </Document>
    )
}

function getSlotOrder(slot: string): number {
    const order = ['desayuno', 'colacion_manana', 'almuerzo', 'merienda', 'colacion_tarde', 'cena', 'colacion_noche']
    return order.indexOf(slot)
}
