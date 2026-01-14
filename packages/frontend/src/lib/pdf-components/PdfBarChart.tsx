import React from 'react';
import { View, Text } from '@react-pdf/renderer';

interface BarData {
    label: string;
    value: number;
    color: string;
}

interface PdfBarChartProps {
    data: BarData[];
    width?: number;
    height?: number;
    title?: string;
}

export const PdfBarChart = ({ data, width = 500, height = 250, title }: PdfBarChartProps) => {
    // Calcular máximo para escala
    const maxValue = Math.max(...data.map(d => d.value), 100); // Mínimo 100 para evitar div/0
    const chartHeight = height - 40; // Espacio para etiquetas
    const barWidth = (width / data.length) * 0.6; // 60% del espacio disponible
    const gap = (width / data.length) * 0.4;

    return (
        <View style={{ width, height, marginBottom: 10 }}>
            {title && (
                <Text style={{ fontSize: 12, marginBottom: 10, textAlign: 'center', color: '#374151', fontFamily: 'Inter', fontWeight: 'bold' }}>
                    {title}
                </Text>
            )}

            <View style={{
                flexDirection: 'row',
                alignItems: 'flex-end',
                height: chartHeight,
                borderBottomWidth: 1,
                borderBottomColor: '#e5e7eb',
                justifyContent: 'space-around',
                paddingBottom: 5
            }}>
                {data.map((item, index) => {
                    const barHeight = (item.value / maxValue) * (chartHeight - 20); // -20 padding top

                    return (
                        <View key={index} style={{ alignItems: 'center', width: barWidth + gap }}>
                            {/* Valor encima de la barra si hay espacio */}
                            <Text style={{ fontSize: 8, marginBottom: 2, color: '#6b7280' }}>
                                {item.value > 0 ? `€${Math.round(item.value)}` : ''}
                            </Text>

                            {/* Barra */}
                            <View style={{
                                width: barWidth,
                                height: Math.max(barHeight, 1), // Mínimo 1px visible
                                backgroundColor: item.color,
                                borderTopLeftRadius: 3,
                                borderTopRightRadius: 3,
                            }} />

                            {/* Etiqueta Eje X */}
                            <Text style={{
                                fontSize: 8,
                                marginTop: 4,
                                color: '#4b5563',
                                width: '100%',
                                textAlign: 'center'
                            }}>
                                {item.label}
                            </Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
};
