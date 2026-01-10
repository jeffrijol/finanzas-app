import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { CategoryPieChart } from '@/components/charts/CategoryPieChart';
import { MonthlyTrendChart } from '@/components/charts/MonthlyTrendChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, TrendingDown, TrendingUp, Wallet } from 'lucide-react';

interface ItemDashboardProps {
    context: any;
    isGeneratingPdf: boolean;
}

export function ItemDashboard({ context, isGeneratingPdf }: ItemDashboardProps) {
    const { year, itemId } = context.filters;

    const { data: stats, isLoading } = useQuery({
        queryKey: ['itemStats', itemId, year],
        queryFn: () => apiClient.getItemStats(itemId, Number(year)),
        enabled: !!itemId
    });

    if (isLoading) {
        return <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>;
    }

    if (!stats) return null;

    const hasGastos = stats.categoryDistribution?.some(c => c.gastos > 0);
    const hasIngresos = stats.categoryDistribution?.some(c => c.ingresos > 0);

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-slate-200 shadow-sm">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-red-100 rounded-full">
                            <TrendingDown className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Gastos ({year})</p>
                            <h3 className="text-2xl font-bold text-slate-900">
                                {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(stats.totalGastos)}
                            </h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-emerald-100 rounded-full">
                            <TrendingUp className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Ingresos ({year})</p>
                            <h3 className="text-2xl font-bold text-slate-900">
                                {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(stats.totalIngresos)}
                            </h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-full">
                            <Wallet className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Promedio Mensual (Gasto)</p>
                            <h3 className="text-2xl font-bold text-slate-900">
                                {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(stats.averageMonthlyExpense)}
                            </h3>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Monthly Trend */}
            <div className="w-full" id="dashboard-chart-monthly-trend">
                <MonthlyTrendChart
                    data={stats.monthlyTrend}
                    year={Number(year)}
                    title={`Evolución Mensual: ${context.title.replace('Análisis: ', '')}`}
                />
            </div>

            {/* Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {hasGastos && (
                    <div id="dashboard-chart-pie-gastos">
                        <CategoryPieChart
                            data={stats.categoryDistribution}
                            type="gastos"
                            title="Distribución de Gastos (Categorías Bancarias)"
                            disableAnimation={isGeneratingPdf}
                        />
                    </div>
                )}
                {hasIngresos && (
                    <div id="dashboard-chart-pie-ingresos">
                        <CategoryPieChart
                            data={stats.categoryDistribution}
                            type="ingresos"
                            title="Distribución de Ingresos (Categorías Bancarias)"
                            disableAnimation={isGeneratingPdf}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
