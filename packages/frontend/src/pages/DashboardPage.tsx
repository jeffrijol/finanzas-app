import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { PeriodSelector } from '@/components/dashboard/PeriodSelector';
import { TransactionsTable } from '@/components/dashboard/TransactionsTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePeriodStore } from '@/stores/period-store';
import { FiltersBar } from '@/components/dashboard/FiltersBar';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PdfGeneratorService } from '@/lib/pdf-service';
import { useDashboardFiltersStore } from '@/stores/dashboard-filters-store';
import { useDashboardContext } from '@/hooks/useDashboardContext';
import { DashboardChartsRenderer } from '@/components/dashboard/DashboardChartsRenderer';

export function DashboardPage() {
    const { year, quarter } = usePeriodStore();
    const queryClient = useQueryClient();

    // Global filter state
    const {
        searchQuery,
        selectedTipoItem,
        selectedItemId,
        selectedCategory,
    } = useDashboardFiltersStore();

    // Local pagination state
    const [page, setPage] = useState(1);
    const [updatingTransactionId, setUpdatingTransactionId] = useState<string | undefined>();
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    // Fetch items
    const { data: items = [] } = useQuery({
        queryKey: ['items'],
        queryFn: () => apiClient.getItems(),
    });

    // Fetch itemTypes
    const { data: itemTypes = [] } = useQuery({
        queryKey: ['itemTypes'],
        queryFn: () => apiClient.getItemTypes(),
    });

    // Fetch categories
    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: () => apiClient.getCategories(),
    });

    // Smart Dashboard Context
    const dashboardContext = useDashboardContext(items, itemTypes, categories);

    // Fetch transactions with filters from Store
    const {
        data: transactionsData,
        isLoading: isLoadingTransactions,
    } = useQuery({
        queryKey: ['transactions', page, searchQuery, selectedTipoItem, selectedItemId, selectedCategory, year, quarter],
        queryFn: () =>
            apiClient.getTransactions({
                page,
                limit: 10,
                search: searchQuery || undefined,
                tipoItem: selectedTipoItem || undefined,
                itemAsignadoId: selectedItemId || undefined,
                categoryId: selectedCategory || undefined, // Send as categoryId
                year: Number(year),
                quarter: quarter === 'all' ? undefined : Number(quarter),
            }),
    });

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handleAssignItem = async (transactionId: string, itemId: string | null) => {
        setUpdatingTransactionId(transactionId);
        try {
            await apiClient.updateTransaction(transactionId, { itemAsignadoId: itemId });
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
        } finally {
            setUpdatingTransactionId(undefined);
        }
    };

    const handleAssignCategory = async (transactionId: string, categoryId: string | null) => {
        setUpdatingTransactionId(transactionId);
        try {
            await apiClient.updateTransaction(transactionId, { categoryId });
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
        } finally {
            setUpdatingTransactionId(undefined);
        }
    };

    // Filter change handlers are now inside FiltersBar directly interacting with the store
    // Page reset on filter change should be handled by a useEffect or similar if strictly needed
    // For now, let's reset page when filters change by using the key in useQuery or simplified logic
    // Ideally useDashboardFiltersStore could expose an event, but we can check if page > 1 and filters changed...
    // Or just accept that page stays for now (simplification).

    const handleDownloadPdf = async () => {
        setIsGeneratingPdf(true);
        // Delay to ensure render
        await new Promise(r => setTimeout(r, 500));

        try {
            // Simplified PDF extraction, ideally needs Context awareness too
            const chartIds: string[] = [];
            const level = dashboardContext.level;

            if (level === 'general' || level === 'year' || level === 'quarter') {
                chartIds.push('dashboard-chart-annual');
                chartIds.push('dashboard-chart-pie-gastos', 'dashboard-chart-pie-ingresos');
            } else if (level === 'type' || level === 'item') {
                chartIds.push('dashboard-chart-monthly-trend');
                chartIds.push('dashboard-chart-pie-gastos', 'dashboard-chart-pie-ingresos');
            } else if (level === 'category') {
                chartIds.push('dashboard-chart-monthly-trend');
            }

            await PdfGeneratorService.generateDashboardReport({
                title: `Reporte Financiero - ${dashboardContext.title}`,
                subtitle: dashboardContext.description,
                chartIds
            });
        } catch (err) {
            console.error('Error generating PDF', err);
        } finally {
            setIsGeneratingPdf(false);
        }
    };



    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">{dashboardContext.title}</h1>
                        <p className="text-slate-500 mt-2">
                            {dashboardContext.description}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                            onClick={handleDownloadPdf}
                            disabled={isGeneratingPdf || isLoadingTransactions}
                        >
                            {isGeneratingPdf ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Download className="h-4 w-4 mr-2" />
                            )}
                            Descargar Reporte
                        </Button>
                    </div>
                </div>

                {/* Period Selector */}
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                            Rango de Fechas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <PeriodSelector />
                    </CardContent>
                </Card>

                {/* Filters & Table */}
                <Card className="border-slate-200 shadow-sm overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b border-gray-100">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-lg font-semibold text-slate-800">
                                Transacciones ({transactionsData?.total || 0})
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <FiltersBar
                            items={items}
                            itemTypes={itemTypes}
                            categories={categories}
                        />

                        <TransactionsTable
                            transactions={transactionsData?.items || []}
                            items={items}
                            itemTypes={itemTypes}
                            isLoading={isLoadingTransactions}
                            currentPage={page}
                            totalPages={transactionsData?.totalPages || 1}
                            onPageChange={handlePageChange}
                            onAssignItem={handleAssignItem}
                            onAssignCategory={handleAssignCategory}
                            updatingTransactionId={updatingTransactionId}
                        />
                    </CardContent>
                </Card>

                {/* Smart Section */}
                <div className="mt-8">
                    <DashboardChartsRenderer
                        context={dashboardContext}
                        isGeneratingPdf={isGeneratingPdf}
                        items={items}
                        itemTypes={itemTypes}
                    />
                </div>
            </div>
        </DashboardLayout>
    );
}
