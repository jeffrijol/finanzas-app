import { Document, Page, View, Text, StyleSheet, Font, pdf, Image } from '@react-pdf/renderer';

// Registrar fuentes
try {
    Font.register({
        family: 'Inter',
        fonts: [
            {
                src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyeMZhrib2Bg-4.ttf',
                fontWeight: 'normal'
            },
            {
                src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYMZhrib2Bg-4.ttf',
                fontWeight: 'bold'
            }
        ]
    });
} catch (e) {
    console.warn('No se pudieron registrar las fuentes personalizadas para el PDF', e);
}

// Estilos del PDF
const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Inter',
        backgroundColor: '#ffffff'
    },
    header: {
        marginBottom: 30,
        paddingBottom: 20,
        borderBottomWidth: 2,
        borderBottomColor: '#3b82f6',
        borderBottomStyle: 'solid'
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 8
    },
    subtitle: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 4
    },
    section: {
        marginBottom: 24,
        width: '100%'
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 12,
        paddingBottom: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        borderBottomStyle: 'solid'
    },
    summaryGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        backgroundColor: '#f9fafb',
        padding: 16,
        borderRadius: 8
    },
    summaryItem: {
        flex: 1,
        alignItems: 'center'
    },
    summaryLabel: {
        fontSize: 10,
        color: '#6b7280',
        marginBottom: 4
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: 'bold'
    },
    positiveValue: {
        color: '#10b981'
    },
    negativeValue: {
        color: '#ef4444'
    },
    chartsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 24
    },
    chartWrapper: {
        marginBottom: 20,
        alignItems: 'center',
        width: '100%'
    },
    chartTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#4b5563'
    },
    table: {
        marginTop: 20,
        width: '100%'
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f3f4f6',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#d1d5db'
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb'
    },
    tableCell: {
        fontSize: 9,
        paddingHorizontal: 4
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        fontSize: 8,
        color: '#9ca3af'
    }
});

/**
 * Componente React para el PDF
 */


// ... (estilos existentes)

/**
 * Componente React para el PDF
 */
const DashboardPDF = ({ data, chartImages }: { data: any, chartImages?: { monthlyTrend?: string, distributionGastos?: string, distributionIngresos?: string } }) => (
    <Document>
        <Page size="A4" style={styles.page} >
            {/* Encabezado */}
            < View style={styles.header} >
                <Text style={styles.title}> {data.metadata?.title || 'Reporte Financiero'} </Text>
                < Text style={styles.subtitle} >
                    Generado: {data.metadata?.generatedAt}
                </Text>
                < Text style={styles.subtitle} >
                    Período: {data.metadata?.filters?.periodLabel}
                </Text>
            </View>

            {/* Resumen ejecutivo */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}> Resumen Ejecutivo </Text>
                < View style={styles.summaryGrid} >
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}> Total Transacciones </Text>
                        < Text style={styles.summaryValue} >
                            {data.summaries?.totalTransactions || 0}
                        </Text>
                    </View>
                    < View style={styles.summaryItem} >
                        <Text style={styles.summaryLabel}> Total Ingresos </Text>
                        < Text style={[styles.summaryValue, styles.positiveValue]} >
                            €{data.summaries?.totalIncome?.toLocaleString('es-ES') || '0'}
                        </Text>
                    </View>
                    < View style={styles.summaryItem} >
                        <Text style={styles.summaryLabel}> Total Gastos </Text>
                        < Text style={[styles.summaryValue, styles.negativeValue]} >
                            €{data.summaries?.totalExpenses?.toLocaleString('es-ES') || '0'}
                        </Text>
                    </View>
                    < View style={styles.summaryItem} >
                        <Text style={styles.summaryLabel}> Balance Neto </Text>
                        < Text style={
                            [
                                styles.summaryValue,
                                (data.summaries?.netBalance || 0) >= 0 ? styles.positiveValue : styles.negativeValue
                            ]} >
                            €{data.summaries?.netBalance?.toLocaleString('es-ES') || '0'}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Gráficos (Snapshot de UI) */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}> Análisis Gráfico Visual </Text>

                {/* Gráfico de Tendencia */}
                {chartImages?.monthlyTrend && (
                    <View style={{ marginBottom: 20 }}>
                        <Text style={styles.chartTitle}>Evolución Financiera (Vista UI)</Text>
                        {/* eslint-disable-next-line jsx-a11y/alt-text */}
                        <Image
                            src={chartImages.monthlyTrend}
                            style={{ width: '100%', height: 250, objectFit: 'contain' }}
                        />
                    </View>
                )}

                {/* Gráficos de Distribución (Ingresos) */}
                {chartImages?.distributionIngresos && (
                    <View style={{ marginBottom: 20 }}>
                        <Text style={styles.chartTitle}>Distribución de Ingresos</Text>
                        {/* eslint-disable-next-line jsx-a11y/alt-text */}
                        <Image
                            src={chartImages.distributionIngresos}
                            style={{ width: '100%', height: 250, objectFit: 'contain' }}
                        />
                    </View>
                )}

                {/* Gráficos de Distribución (Gastos) */}
                {chartImages?.distributionGastos && (
                    <View>
                        <Text style={styles.chartTitle}>Distribución de Gastos</Text>
                        {/* eslint-disable-next-line jsx-a11y/alt-text */}
                        <Image
                            src={chartImages.distributionGastos}
                            style={{ width: '100%', height: 250, objectFit: 'contain' }}
                        />
                    </View>
                )}

                {!chartImages?.monthlyTrend && !chartImages?.distributionGastos && !chartImages?.distributionIngresos && (
                    <Text style={{ fontSize: 10, color: '#6b7280', fontStyle: 'italic' }}>
                        No se pudieron capturar las imágenes de los gráficos.
                    </Text>
                )}
            </View>

            {/* Top Gastos (Items) */}
            {
                (data.topExpenses && data.topExpenses.length > 0) && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}> Top Gastos (Items) </Text>
                        <View style={styles.table}>
                            <View style={styles.tableHeader}>
                                <Text style={[styles.tableCell, { width: '50%' }]}>Item / Concepto</Text>
                                <Text style={[styles.tableCell, { width: '25%' }]}>Categoría</Text>
                                <Text style={[styles.tableCell, { width: '25%' }]}>Total</Text>
                            </View>
                            {data.topExpenses.slice(0, 5).map((item: any, index: number) => (
                                <View key={index} style={styles.tableRow}>
                                    <Text style={[styles.tableCell, { width: '50%' }]}>{item.nombre}</Text>
                                    <Text style={[styles.tableCell, { width: '25%' }]}>{item.categoria}</Text>
                                    <Text style={[styles.tableCell, { width: '25%', color: '#ef4444' }]}>
                                        €{Math.abs(item.total).toLocaleString('es-ES')}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )
            }

            {/* Tabla de transacciones de muestra */}
            {
                (data.sampleTransactions && data.sampleTransactions.length > 0) ? (
                    <View style={[styles.section, { marginTop: 20 }]} >
                        <Text style={styles.sectionTitle}>
                            Transacciones Recientes
                        </Text>

                        < View style={styles.table} >
                            {/* Encabezado de tabla */}
                            < View style={styles.tableHeader} >
                                <Text style={[styles.tableCell, { width: '15%' }]}> Fecha </Text>
                                < Text style={[styles.tableCell, { width: '40%' }]} > Descripción </Text>
                                < Text style={[styles.tableCell, { width: '20%' }]} > Categoría </Text>
                                < Text style={[styles.tableCell, { width: '25%' }]} > Monto </Text>
                            </View>

                            {/* Filas de transacciones */}
                            {
                                data.sampleTransactions.map((tx: any, index: number) => (
                                    <View key={index} style={styles.tableRow} >
                                        <Text style={[styles.tableCell, { width: '15%' }]} >
                                            {new Date(tx.fechaValor).toLocaleDateString('es-ES')}
                                        </Text>
                                        < Text style={[styles.tableCell, { width: '40%' }]} >
                                            {tx.descripcion ? (tx.descripcion.length > 35 ? tx.descripcion.substring(0, 32) + '...' : tx.descripcion) : ''}
                                        </Text>
                                        < Text style={[styles.tableCell, { width: '20%' }]} >
                                            {tx.categoria}
                                        </Text>
                                        < Text style={
                                            [
                                                styles.tableCell,
                                                { width: '25%' },
                                                tx.importe >= 0 ? styles.positiveValue : styles.negativeValue
                                            ]} >
                                            €{Math.abs(tx.importe).toLocaleString('es-ES')}
                                        </Text>
                                    </View>
                                ))
                            }
                        </View>

                        < Text style={{ fontSize: 9, color: '#6b7280', marginTop: 10, textAlign: 'center' }
                        }>
                            * Se muestran las primeras 15 transacciones para referencia.
                        </Text>
                    </View>
                ) : null}

            {/* Pie de página */}
            <Text style={styles.footer} fixed >
                Reporte generado por Finanzas App • Documento confidencial • Página 1 de 1
            </Text>
        </Page>
    </Document>
);

/**
 * Función principal que genera el PDF como Blob
 */
export const buildDashboardPDF = async (data: any, chartImages?: { monthlyTrend?: string, distributionGastos?: string, distributionIngresos?: string }): Promise<Blob> => {
    const pdfElement = <DashboardPDF data={data} chartImages={chartImages} />;
    const blob = await pdf(pdfElement).toBlob();
    return blob;
};
