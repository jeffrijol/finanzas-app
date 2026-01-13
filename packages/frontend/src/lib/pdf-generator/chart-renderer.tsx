import React from 'react';
import { renderToString } from 'react-dom/server';
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Legend,
} from 'recharts';

/**
 * Renderiza un gráfico de barras a SVG string
 */
export const renderBarChartToSVG = (
    data: Array<{ name: string; ingresos: number; gastos: number }>,
    dimensions: { width: number; height: number } = { width: 600, height: 300 }
): string => {
    const chart = (
        <BarChart
            width={dimensions.width}
            height={dimensions.height}
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
                dataKey="name"
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
            />
            <YAxis
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                tickFormatter={(value) => `€${Number(value).toLocaleString()}`}
            />
            <Legend />
            <Bar
                dataKey="ingresos"
                name="Ingresos"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
                isAnimationActive={false}
            />
            <Bar
                dataKey="gastos"
                name="Gastos"
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
                isAnimationActive={false}
            />
        </BarChart>
    );

    return renderToString(chart);
};

/**
 * Renderiza un gráfico de torta a SVG string
 */
export const renderPieChartToSVG = (
    data: Array<{ name: string; value: number }>,
    colors: string[] = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'],
    dimensions: { width: number; height: number } = { width: 400, height: 300 }
): string => {
    const chart = (
        <PieChart width={dimensions.width} height={dimensions.height}>
            <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ percent }: { percent?: number }) => `${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={Math.min(dimensions.width, dimensions.height) / 2 - 20}
                fill="#8884d8"
                dataKey="value"
                isAnimationActive={false}
            >
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
            </Pie>
            <Legend />
        </PieChart>
    );

    return renderToString(chart);
};

/**
 * Extrae solo el SVG del string renderizado
 */
export const extractSVGFromRender = (htmlString: string): string => {
    // renderToString outputs the SVG string directly for Recharts in many cases, 
    // but sometimes wrapped. Recharts usually outputs <div class="recharts-wrapper">...<svg>...</div>
    // or sometimes just the svg if static (though Recharts wraps).
    const match = htmlString.match(/<svg[\s\S]*?<\/svg>/);
    return match ? match[0] : '';
};
