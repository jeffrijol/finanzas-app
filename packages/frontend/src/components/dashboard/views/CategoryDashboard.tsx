import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { MonthlyTrendChart } from '@/components/charts/MonthlyTrendChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface CategoryDashboardProps {
    context: any;
    isGeneratingPdf: boolean;
}

export function CategoryDashboard({ context, isGeneratingPdf }: CategoryDashboardProps) {
    const { year, categoryId } = context.filters;

    const { data: stats, isLoading } = useQuery({
        queryKey: ['categoryStats', categoryId, year],
        queryFn: () => apiClient.getCategoryStats(categoryId, Number(year)),
        enabled: !!categoryId && categoryId !== 'ALL'
    });

    if (isLoading) {
        return <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>;
    }

    if (!stats) return null;

    return (
        <div className="space-y-6">
            {/* Monthly Trend */}
            <div className="w-full" id="dashboard-chart-monthly-trend">
                <MonthlyTrendChart
                    data={stats.monthlyTrend}
                    year={Number(year)}
                    title={`Evolución Mensual: ${context.title.replace('Categoría: ', '')}`}
                />
            </div>

            {/* Top Items in Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="h-full border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Top Gastos en esta Categoría</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats.topItems.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                                            {idx + 1}
                                        </div>
                                        <span className="font-medium text-slate-700 truncate max-w-[200px]" title={item.name}>
                                            {item.name}
                                        </span>
                                    </div>
                                    <span className="font-bold text-slate-900">
                                        {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(item.amount)}
                                    </span>
                                </div>
                            ))}
                            {stats.topItems.length === 0 && (
                                <p className="text-slate-500 text-sm">No hay items destacados en esta categoría.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
