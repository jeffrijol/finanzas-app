import { useState, Suspense, lazy } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { TransactionsTable } from '@/components/dashboard/TransactionsTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePeriodStore } from '@/stores/period-store';
import { useDashboardFiltersStore } from '@/stores/dashboard-filters-store';
import { useDashboardContext } from '@/hooks/useDashboardContext';
import { DashboardChartsRenderer } from '@/components/dashboard/DashboardChartsRenderer';
import { AnalyticsSkeleton } from '@/components/dashboard/views/AnalyticsSkeleton';
import { FileJson, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

// Lazy load Analytics View
const AnalyticsView = lazy(() => import('@/components/dashboard/views/AnalyticsView').then(module => ({ default: module.AnalyticsView })));

export function DashboardPage() {
    const { year, quarter } = usePeriodStore();
    const queryClient = useQueryClient();

    // View State
    const [currentView, setCurrentView] = useState<'management' | 'analytics'>('management');

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
    const [isExporting, setIsExporting] = useState(false);
    const [isTableVisible, setIsTableVisible] = useState(true);

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
                categoryId: selectedCategory || undefined,
                year: Number(year),
                quarter: quarter === 'all' ? undefined : Number(quarter),
            }),
    });

    // Fetch Stats
    const { data: stats } = useQuery({
        queryKey: ['stats', year, quarter, selectedTipoItem, selectedItemId, selectedCategory],
        queryFn: () => apiClient.getStats({
            year: Number(year),
            quarter: quarter === 'all' ? undefined : Number(quarter),
            tipoItem: selectedTipoItem || undefined,
            itemAsignadoId: selectedItemId || undefined,
            categoryId: selectedCategory || undefined,
        })
    });

    const fullContext = { ...dashboardContext, stats };

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

    const handleExport = async (format: 'json' | 'csv') => {
        setIsExporting(true);
        try {
            // Fetch all transactions with current filters (high limit)
            const data = await apiClient.getTransactions({
                limit: 10000,
                search: searchQuery || undefined,
                tipoItem: selectedTipoItem || undefined,
                itemAsignadoId: selectedItemId || undefined,
                categoryId: selectedCategory || undefined,
                year: Number(year),
                quarter: quarter === 'all' ? undefined : Number(quarter),
            });

            const transactions = data.items;
            const filename = `transacciones_${year}_${quarter}_${new Date().toISOString().split('T')[0]}`;

            let blob: Blob;
            if (format === 'json') {
                blob = new Blob([JSON.stringify(transactions, null, 2)], { type: 'application/json' });
            } else {
                // CSV Conversion
                const headers = ['ID', 'Fecha', 'Descripción', 'Categoría', 'Importe', 'Saldo', 'Item'];
                const rows = transactions.map(t => [
                    t.id,
                    new Date(t.fechaValor).toLocaleDateString(),
                    t.descripcion,
                    t.categoria,
                    t.importe,
                    t.saldo,
                    t.itemAsignado?.nombre || ''
                ]);

                const csvContent = [
                    headers.join(','),
                    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
                ].join('\n');

                // Add UTF-8 BOM for Excel compatibility with special characters
                blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
            }

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${filename}.${format}`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast({
                title: "Exportación exitosa",
                description: `Se ha descargado el archivo ${format.toUpperCase()} correctamente.`,
            });
        } catch (err) {
            console.error(`Error exporting ${format}`, err);
            toast({
                title: "Error",
                description: "No se pudieron exportar los datos.",
                variant: "destructive"
            });
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="container mx-auto p-4 max-w-7xl">

                {/* Unified Header */}
                <DashboardHeader
                    items={items}
                    itemTypes={itemTypes}
                    categories={categories}
                    currentView={currentView}
                    onViewChange={setCurrentView}
                    onExport={handleExport}
                />

                {/* Content Area */}
                <div className="mt-4">
                    {currentView === 'management' ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">

                            {/* Summary Cards */}
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            Ingresos Totales
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-emerald-600">
                                            €{stats?.totalIngresos?.toLocaleString('es-ES') || '0'}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            Gastos Totales
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-red-600">
                                            €{stats?.totalGastos?.toLocaleString('es-ES') || '0'}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            Balance
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className={`text-2xl font-bold ${(stats?.balance || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'
                                            }`}>
                                            €{stats?.balance?.toLocaleString('es-ES') || '0'}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            Transacciones
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {stats?.totalTransacciones || 0}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {stats?.transaccionesConItem || 0} asignadas
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Main Transaction Table */}
                            <Card className="border-slate-200 shadow-sm overflow-hidden">
                                <CardHeader className="bg-slate-50/50 border-b border-gray-100 py-3">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-lg font-semibold text-slate-800">
                                            Transacciones ({transactionsData?.total || 0})
                                        </CardTitle>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleExport('json')}
                                                disabled={isExporting || isLoadingTransactions}
                                                className="text-slate-600 hover:text-emerald-600 h-8 px-2"
                                                title="Descargar JSON"
                                            >
                                                <FileJson className="h-4 w-4 mr-1" />
                                                JSON
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleExport('csv')}
                                                disabled={isExporting || isLoadingTransactions}
                                                className="text-slate-600 hover:text-emerald-600 h-8 px-2"
                                                title="Descargar CSV"
                                            >
                                                <FileSpreadsheet className="h-4 w-4 mr-1" />
                                                CSV
                                            </Button>
                                            <button
                                                onClick={() => setIsTableVisible(!isTableVisible)}
                                                className="text-sm text-slate-500 hover:text-emerald-600 ml-2"
                                            >
                                                {isTableVisible ? 'Ocultar' : 'Mostrar'}
                                            </button>
                                        </div>
                                    </div>
                                </CardHeader>
                                {isTableVisible && (
                                    <CardContent className="space-y-6 pt-6 transition-all">
                                        <TransactionsTable
                                            transactions={transactionsData?.items || []}
                                            items={items}
                                            itemTypes={itemTypes}
                                            isLoading={isLoadingTransactions}
                                            currentPage={page}
                                            totalPages={transactionsData?.totalPages || 1}
                                            onPageChange={handlePageChange}
                                            onAssignItem={handleAssignItem}
                                            categories={categories}
                                            onAssignCategory={handleAssignCategory}
                                            updatingTransactionId={updatingTransactionId}
                                            isTableVisible={isTableVisible}
                                            onToggleVisibility={() => setIsTableVisible(!isTableVisible)}
                                        />
                                    </CardContent>
                                )}
                            </Card>

                            {/* Smart Charts Section */}
                            <div className="mt-8">
                                <DashboardChartsRenderer
                                    context={dashboardContext}
                                    isGeneratingPdf={false}
                                    items={items}
                                    itemTypes={itemTypes}
                                />
                            </div>
                        </div>
                    ) : (
                        <Suspense fallback={<AnalyticsSkeleton />}>
                            <AnalyticsView year={Number(year)} />
                        </Suspense>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
