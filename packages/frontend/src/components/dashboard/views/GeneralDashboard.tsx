import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { AnnualStatsChart } from '@/components/charts/AnnualStatsChart';
import { CategoryPieChart } from '@/components/charts/CategoryPieChart';
import { ItemType } from '@/types';

interface GeneralDashboardProps {
    context: any;
    isGeneratingPdf: boolean;
    itemTypes: ItemType[];
}

export function GeneralDashboard({ context, isGeneratingPdf, itemTypes }: GeneralDashboardProps) {
    const { year, quarter, tipoItem, itemId, categoryId } = context.filters;

    // Fetch Stats using existing logic for now
    const { data: stats } = useQuery({
        queryKey: ['stats', year, quarter, tipoItem, itemId, categoryId],
        queryFn: () => apiClient.getStats({
            year: Number(year),
            quarter: quarter === 'all' ? undefined : Number(quarter),
            tipoItem: tipoItem || undefined,
            itemAsignadoId: itemId || undefined,
            categoryId: categoryId || undefined,
        })
    });

    if (!stats) return null;

    const hasGastos = stats.porCategoryRel?.some((c: any) => c.gastos > 0);
    const hasIngresos = stats.porCategoryRel?.some((c: any) => c.ingresos > 0);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div id="dashboard-chart-annual" className="md:col-span-2">
                <AnnualStatsChart
                    data={stats.porTipoItem}
                    year={Number(year)}
                    title={`Finanzas ${year}${quarter !== 'all' ? ` - Q${quarter}` : ''}`}
                    disableAnimation={isGeneratingPdf}
                />
            </div>

            {hasGastos && (
                <div id="dashboard-chart-pie-gastos">
                    <CategoryPieChart
                        data={stats.porCategoryRel}
                        type="gastos"
                        title="Gastos por Categoría"
                        disableAnimation={isGeneratingPdf}
                    />
                </div>
            )}

            {hasIngresos && (
                <div id="dashboard-chart-pie-ingresos">
                    <CategoryPieChart
                        data={stats.porCategoryRel}
                        type="ingresos"
                        title="Ingresos por Categoría"
                        disableAnimation={isGeneratingPdf}
                    />
                </div>
            )}
        </div>
    );
}
