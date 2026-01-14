import React from 'react';
import { View, Text, Svg, Path, G } from '@react-pdf/renderer';
import * as d3Shape from 'd3-shape';

interface PieData {
    label: string;
    value: number;
    color: string;
}

interface PdfPieChartProps {
    data: PieData[];
    width?: number;
    height?: number;
    title?: string;
}

export const PdfPieChart = ({ data, width = 300, height = 300, title }: PdfPieChartProps) => {
    // Calcular total para porcentajes
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const radius = Math.min(width, height) / 2;
    const innerRadius = 0; // Pie, no donut

    // Generador de arcos de D3
    const pie = d3Shape.pie<PieData>().value(d => d.value).sort(null);
    const arcGenerator = d3Shape.arc<d3Shape.PieArcDatum<PieData>>()
        .innerRadius(innerRadius)
        .outerRadius(radius);

    const arcs = pie(data);

    return (
        <View style={{ width, height: height + 60, alignItems: 'center' }}>
            {title && (
                <Text style={{ fontSize: 12, marginBottom: 10, textAlign: 'center', color: '#374151', fontFamily: 'Inter', fontWeight: 'bold' }}>
                    {title}
                </Text>
            )}

            <Svg width={width} height={height}>
                <G transform={`translate(${width / 2}, ${height / 2})`}>
                    {arcs.map((arc, i) => {
                        const path = arcGenerator(arc);
                        return (
                            <Path
                                key={i}
                                d={path || ''}
                                fill={data[i].color}
                            />
                        );
                    })}
                </G>
            </Svg>

            {/* Leyenda simple debajo */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 10, width: '100%' }}>
                {data.map((item, i) => {
                    const percent = ((item.value / total) * 100).toFixed(0);
                    return (
                        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10, marginBottom: 4 }}>
                            <View style={{ width: 8, height: 8, backgroundColor: item.color, marginRight: 4 }} />
                            <Text style={{ fontSize: 8, color: '#4b5563' }}>
                                {item.label} ({percent}%)
                            </Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
};
