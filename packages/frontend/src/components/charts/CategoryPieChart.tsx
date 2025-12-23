import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface CategoryStats {
    categoria: string;
    ingresos: number;
    gastos: number;
}

interface CategoryPieChartProps {
    data: CategoryStats[];
    type: 'ingresos' | 'gastos';
}

const COLORS = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#06b6d4'
];

export function CategoryPieChart({ data, type }: CategoryPieChartProps) {
    // Filtrar y preparar datos
    const chartData = data
        .map(d => ({
            name: d.categoria,
            value: type === 'ingresos' ? d.ingresos : d.gastos
        }))
        .filter(d => d.value > 0)
        .sort((a, b) => b.value - a.value);

    // Agrupar si hay muchos (Top 6 + Otros)
    const finalData = chartData.length > 7 ? [
        ...chartData.slice(0, 6),
        {
            name: 'Otros',
            value: chartData.slice(6).reduce((sum, item) => sum + item.value, 0)
        }
    ] : chartData;

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
    };

    const title = type === 'ingresos' ? 'Ingresos por Categoría' : 'Distribución de Gastos';
    const description = type === 'ingresos' ? 'Fuentes de ingresos principales' : 'Desglose de gastos por categoría';

    if (finalData.length === 0) return null;

    return (
        <Card className="col-span-1 shadow-sm border-slate-200" id={`pie-chart-${type}`}>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold text-slate-900">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={finalData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={2}
                                dataKey="value"
                            >
                                {finalData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: number) => formatCurrency(value)}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend
                                layout="vertical"
                                verticalAlign="middle"
                                align="right"
                                wrapperStyle={{ fontSize: '12px' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
