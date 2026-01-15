
import * as React from "react";
import { ComposedChart, Bar, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface MonthlyFinancialChartProps {
    data: any[];
    keys: string[]; // Keys for expense categories
    title: string;
    description?: string;
}

const MONTH_NAMES = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

// Consistent Palette for Categories
const PALETTE = [
    "#3b82f6", // Blue
    "#a855f7", // Purple
    "#f59e0b", // Amber
    "#ef4444", // Red
    "#10b981", // Emerald
    "#6366f1", // Indigo
    "#f43f5e", // Rose
    "#8b5cf6", // Violet
];

export function MonthlyFinancialChart({ data, keys, title, description }: MonthlyFinancialChartProps) {

    // Enrich data with month names
    const enrichedData = React.useMemo(() => {
        return data.map(d => ({
            ...d,
            name: MONTH_NAMES[d.month - 1]
        }));
    }, [data]);

    return (
        <Card className="shadow-sm border-slate-200">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={enrichedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                            <YAxis
                                yAxisId="left"
                                tickFormatter={(val) => `€${val / 1000}k`}
                                label={{ value: 'Gastos', angle: -90, position: 'insideLeft', style: { fill: '#64748b' } }}
                            />
                            {/* Optional Right Axis for Income if scales differ wildly, but keeping same axis for comparison is usually better for 'Coverage' view */}

                            <Tooltip
                                formatter={(value: number, name: string) => [
                                    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value),
                                    name === 'ingresos' ? 'Ingresos Totales' : name
                                ]}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />

                            {/* Stacked Bars for Expenses */}
                            {keys.filter(k => k !== 'Otros').map((key, index) => (
                                <Bar
                                    yAxisId="left"
                                    key={key}
                                    dataKey={key}
                                    stackId="expenses"
                                    fill={PALETTE[index % PALETTE.length]}
                                    name={key}
                                    radius={[0, 0, 0, 0]}
                                />
                            ))}
                            <Bar
                                yAxisId="left"
                                dataKey="Otros"
                                stackId="expenses"
                                fill="#94a3b8"
                                name="Otros"
                                radius={[4, 4, 0, 0]}
                            />

                            {/* Line for Income */}
                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="ingresos"
                                name="Ingresos"
                                stroke="#16a34a"
                                strokeWidth={3}
                                dot={{ r: 4, fill: "#16a34a", strokeWidth: 2, stroke: "#fff" }}
                                activeDot={{ r: 6 }}
                            />

                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
