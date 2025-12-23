import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { CategoryPieChart } from '@/components/charts/CategoryPieChart';
import { AnnualStatsChart } from '@/components/charts/AnnualStatsChart';

export function DashboardPage() {
    const { year, quarter } = usePeriodStore();

    // State for filters and pagination
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTipoItem, setSelectedTipoItem] = useState<string>('');
    const [selectedItemId, setSelectedItemId] = useState<string>('');
    const [updatingTransactionId, setUpdatingTransactionId] = useState<string | undefined>();
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    // Fetch items
    const { data: items = [] } = useQuery({
        queryKey: ['items'],
        queryFn: () => apiClient.getItems(),
    });

    // Fetch transactions with filters
    const {
        data: transactionsData,
        isLoading: isLoadingTransactions,
    } = useQuery({
        queryKey: ['transactions', page, searchQuery, selectedTipoItem, selectedItemId, year, quarter],
        queryFn: () =>
            apiClient.getTransactions({
                page,
                limit: 10,
                search: searchQuery || undefined,
                tipoItem: selectedTipoItem || undefined,
                itemAsignadoId: selectedItemId || undefined,
                year: Number(year),
                quarter: quarter === 'all' ? undefined : Number(quarter),
            }),
    });

    // Fetch Stats with same filters
    const { data: stats } = useQuery({
        queryKey: ['stats', year, quarter, selectedTipoItem, selectedItemId],
        queryFn: () => apiClient.getStats({
            year: Number(year),
            quarter: quarter === 'all' ? undefined : Number(quarter),
            tipoItem: selectedTipoItem || undefined,
            itemAsignadoId: selectedItemId || undefined,
        })
    });

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handleAssignItem = async (transactionId: string, itemId: string | null) => {
        setUpdatingTransactionId(transactionId);
        try {
            await apiClient.updateTransaction(transactionId, { itemAsignadoId: itemId });
        } finally {
            setUpdatingTransactionId(undefined);
        }
    };

    // Reset page when filters change
    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        setPage(1);
    };

    const handleTipoItemChange = (value: string) => {
        setSelectedTipoItem(value);
        setSelectedItemId(''); // Reset item specific filter when type changes
        setPage(1);
    };

    const handleItemChange = (value: string) => {
        setSelectedItemId(value);
        setPage(1);
    };

    const handleDownloadPdf = async () => {
        if (!transactionsData?.items) return;

        setIsGeneratingPdf(true);
        // Small delay to ensure render
        await new Promise(r => setTimeout(r, 100));

        try {
            const chartIds = ['dashboard-chart-annual'];
            if (stats?.porCategoria && stats.porCategoria.length > 0) {
                chartIds.push('dashboard-chart-pie');
            }

            const itemName = selectedItemId ? items.find(i => i.id === selectedItemId)?.nombre : 'Todos';
            const typeName = selectedTipoItem && selectedTipoItem !== 'ALL' ? selectedTipoItem : 'Todos';

            await PdfGeneratorService.generateDashboardReport({
                title: `Reporte Financiero - ${periodLabel}${quarterLabel}`,
                subtitle: `Tipo: ${typeName} | Item: ${itemName}`,
                transactions: transactionsData.items,
                chartIds
            });
        } catch (err) {
            console.error('Error generating PDF', err);
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    const periodLabel = `Año ${year}`;
    const quarterLabel = quarter === 'all' ? '' : ` • Trimestre ${quarter}`;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Histórico de Movimientos</h1>
                        <p className="text-slate-500 mt-2">
                            {periodLabel}{quarterLabel}
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

                {/* Transactions Table */}
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
                            searchQuery={searchQuery}
                            onSearchChange={handleSearchChange}
                            selectedTipoItem={selectedTipoItem}
                            onTipoItemChange={handleTipoItemChange}
                            selectedItemId={selectedItemId}
                            onItemChange={handleItemChange}
                            items={items}
                        />

                        <TransactionsTable
                            transactions={transactionsData?.items || []}
                            items={items}
                            isLoading={isLoadingTransactions}
                            currentPage={page}
                            totalPages={transactionsData?.totalPages || 1}
                            onPageChange={handlePageChange}
                            onAssignItem={handleAssignItem}
                            updatingTransactionId={updatingTransactionId}
                        />
                    </CardContent>
                </Card>

                {/* Charts Section */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div id="dashboard-chart-annual">
                            <AnnualStatsChart
                                data={stats.porTipoItem}
                                year={Number(year)}
                            />
                        </div>
                        {stats.porCategoria && stats.porCategoria.length > 0 && (
                            <div id="dashboard-chart-pie">
                                <CategoryPieChart
                                    data={stats.porCategoria}
                                    type="gastos"
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
