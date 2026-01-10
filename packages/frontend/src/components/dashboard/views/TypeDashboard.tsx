import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { CategoryPieChart } from '@/components/charts/CategoryPieChart';
import { MonthlyTrendChart } from '@/components/charts/MonthlyTrendChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface TypeDashboardProps {
    context: any;
    isGeneratingPdf: boolean;
}

export function TypeDashboard({ context, isGeneratingPdf }: TypeDashboardProps) {
    const { year, tipoItem } = context.filters;

    const { data: stats, isLoading } = useQuery({
        queryKey: ['typeStats', tipoItem, year],
        queryFn: () => apiClient.getTypeStats(tipoItem, Number(year)),
        enabled: !!tipoItem && tipoItem !== 'ALL'
    });

    if (isLoading) {
        return <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>;
    }

    if (!stats) return null;

    const hasGastos = stats.categoryDistribution?.some(c => c.gastos > 0);
    const hasIngresos = stats.categoryDistribution?.some(c => c.ingresos > 0);

    return (
        <div className="space-y-6">
            {/* Top Row: Monthly Trend & Top Items */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2" id="dashboard-chart-monthly-trend">
                    <MonthlyTrendChart
                        data={stats.monthlyTrend}
                        year={Number(year)}
                        title={`Evolución Mensual: ${context.title}`}
                    />
                </div>
                <div className="lg:col-span-1">
                    <Card className="h-full border-slate-200 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">Top Gastos (Items)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {stats.topItems.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xs">
                                                {idx + 1}
                                            </div>
                                            <span className="font-medium text-slate-700 truncate max-w-[120px]" title={item.name}>
                                                {item.name}
                                            </span>
                                        </div>
                                        <span className="font-bold text-slate-900">
                                            {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(item.amount)}
                                        </span>
                                    </div>
                                ))}
                                {stats.topItems.length === 0 && (
                                    <p className="text-slate-500 text-sm">No hay datos de gastos.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Bottom Row: Pies */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {hasGastos && (
                    <div id="dashboard-chart-pie-gastos">
                        <CategoryPieChart
                            data={stats.categoryDistribution}
                            type="gastos"
                            title="Distribución de Gastos"
                            disableAnimation={isGeneratingPdf}
                        />
                    </div>
                )}
                {hasIngresos && (
                    <div id="dashboard-chart-pie-ingresos">
                        <CategoryPieChart
                            data={stats.categoryDistribution}
                            type="ingresos"
                            title="Distribución de Ingresos"
                            disableAnimation={isGeneratingPdf}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
