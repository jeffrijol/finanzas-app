import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface StatsByType {
    tipo: string;
    ingresos: number;
    gastos: number;
}

interface AnnualStatsChartProps {
    data: StatsByType[];
    year: number;
    title?: string;
    disableAnimation?: boolean;
}

export function AnnualStatsChart({ data, year, title, disableAnimation = false }: AnnualStatsChartProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
    };

    const formatLabel = (val: string) => {
        const map: Record<string, string> = {
            'INMUEBLE': 'Inmueble',
            'INVERSION': 'Inversión',
            'AVANZE_SOCIEDAD': 'Avanze Soc.',
            'BIENES_INMUEBLES': 'Inmueble',
            'INVERSIONES': 'Inversión'
        };
        return map[val] || val;
    };

    return (
        <Card className="col-span-1 shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-xl font-bold text-slate-900">{title || `Estadísticas ${year}`}</CardTitle>
                    <CardDescription>Resumen de rendimiento por tipo de activo</CardDescription>
                </div>
                <Link
                    to="/reportes"
                    className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
                >
                    Ver reporte completo
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis
                                dataKey="tipo"
                                tickFormatter={formatLabel}
                                stroke="#64748b"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#64748b"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `€${value / 1000}k`}
                            />
                            <Tooltip
                                formatter={(value: any) => formatCurrency(Number(value))}
                                cursor={{ fill: '#f1f5f9' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Bar
                                dataKey="ingresos"
                                name="Ingresos"
                                fill="#10B981"
                                radius={[4, 4, 0, 0]}
                                maxBarSize={60}
                                isAnimationActive={!disableAnimation}
                            />
                            <Bar
                                dataKey="gastos"
                                name="Gastos"
                                fill="#EF4444"
                                radius={[4, 4, 0, 0]}
                                maxBarSize={60}
                                isAnimationActive={!disableAnimation}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
