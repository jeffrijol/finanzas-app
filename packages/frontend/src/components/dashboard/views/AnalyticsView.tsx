import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { StackedCategoryChart } from '@/components/charts/StackedCategoryChart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useDashboardFiltersStore } from '@/stores/dashboard-filters-store';

interface AnalyticsViewProps {
    year: number;
}

export function AnalyticsView({ year }: AnalyticsViewProps) {
    // Global filters
    const { selectedTipoItem, selectedCategory } = useDashboardFiltersStore();
    const filters = {
        tipoItem: selectedTipoItem || undefined,
        categoryId: selectedCategory || undefined
    };

    // 1. Fetch Stacked Trend
    const { data: stackedData, isLoading: isLoadingStacked } = useQuery({
        queryKey: ['stackedTrend', year, selectedTipoItem, selectedCategory],
        queryFn: () => apiClient.getStackedTrend(year, filters),
        staleTime: 5 * 60 * 1000, // 5 minutes cache
    });

    // 2. Fetch Quarterly Report
    const { data: quarterlyReport, isLoading: isLoadingQuarterly } = useQuery({
        queryKey: ['quarterlyReport', year, selectedTipoItem, selectedCategory],
        queryFn: () => apiClient.getQuarterlyReport(year, filters),
        staleTime: 5 * 60 * 1000, // 5 minutes cache
    });

    if (isLoadingStacked || isLoadingQuarterly) {
        return <div className="p-12 text-center text-slate-500">Cargando análisis...</div>;
    }

    if (!stackedData || !quarterlyReport) return null;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Sección 1: Composición del Gasto (Stacked) */}
            <div className="space-y-4" id="dashboard-chart-stacked">
                <h2 className="text-xl font-bold text-slate-900">Composición del Gasto Mensual</h2>
                <StackedCategoryChart
                    data={stackedData.data}
                    keys={stackedData.keys}
                    title={`Evolución de Categorías - ${year}`}
                    description="Desglose de gastos por categorías principales versus el resto."
                />
            </div>

            {/* Sección 2: Comparativa Trimestral */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">Rendimiento Trimestral</h2>

                {/* KPIs Comparativos */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {quarterlyReport.map((q) => (
                        <Card key={q.quarter} className="border-slate-200 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-500 uppercase">Trimestre {q.quarter}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-slate-900">
                                    {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(q.neto)}
                                </div>
                                <div className="flex items-center text-xs mt-1">
                                    <span className={q.neto >= 0 ? "text-emerald-600 font-medium" : "text-red-600 font-medium"}>
                                        {q.neto >= 0 ? "Ahorro Neto" : "Déficit"}
                                    </span>
                                    <span className="text-slate-400 mx-2">•</span>
                                    <span className="text-slate-500">{q.count} txs</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Gráfico Comparativo Ingresos vs Gastos */}
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle>Comparativa Trimestral</CardTitle>
                        <CardDescription>Ingresos vs Gastos por Trimestre</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={quarterlyReport}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="quarter" tickFormatter={(val) => `Q${val}`} />
                                <YAxis tickFormatter={(val) => `€${val / 1000}k`} />
                                <Tooltip
                                    formatter={(val: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val)}
                                    cursor={{ fill: '#f8fafc' }}
                                />
                                <Legend />
                                <Bar dataKey="ingresos" name="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="gastos" name="Gastos" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
