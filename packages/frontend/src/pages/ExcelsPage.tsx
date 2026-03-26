import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useOrganizationQuery } from '@/hooks/useOrganizationQuery';
import { useOrgItems } from '@/hooks/useOrgItems';
import { useOrgCategories } from '@/hooks/useOrgCategories';
import { useOrgTransactions } from '@/hooks/useOrgTransactions';
import { useOrganization } from '@/providers/OrganizationProvider';
import { apiClient } from '@/lib/api-client';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { TransactionsTable } from '@/components/dashboard/TransactionsTable';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileSpreadsheet, Calendar, Layers } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function ExcelsPage() {
    const queryClient = useQueryClient();
    const { currentOrg } = useOrganization();
    const [selectedUploadId, setSelectedUploadId] = useState<string>('');
    const [page, setPage] = useState(1);
    const [updatingTransactionId, setUpdatingTransactionId] = useState<string | undefined>();

    // Reset state on Org Change
    useEffect(() => {
        setSelectedUploadId('');
        setPage(1);
    }, [currentOrg?.id]);

    // Fetch list of Excel Uploads
    const { data: uploads = [] } = useOrganizationQuery({
        queryKey: ['excel-uploads'],
        queryFn: () => apiClient.getExcelUploads(),
    });

    // Fetch details for selected upload
    const { data: uploadDetails } = useOrganizationQuery({
        queryKey: ['excel-upload-details', selectedUploadId],
        queryFn: () => apiClient.getExcelUploadDetails(selectedUploadId),
        enabled: !!selectedUploadId,
    });

    // Fetch items (Level 2)
    const { data: items = [] } = useOrgItems();

    // Fetch itemTypes
    const { data: itemTypes = [] } = useOrganizationQuery({
        queryKey: ['itemTypes'],
        queryFn: () => apiClient.getItemTypes(),
    });

    // Fetch categories (Level 2)
    const { data: categories = [] } = useOrgCategories();

    // Fetch transactions for selected upload (Level 2)
    const {
        data: transactionsData,
        isLoading: isLoadingTransactions,
    } = useOrgTransactions({
        excelUploadId: selectedUploadId,
        page,
        limit: 20,
    });

    const handleUploadChange = (value: string) => {
        setSelectedUploadId(value);
        setPage(1); // Reset pagination on file change
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    // Reusing update handlers from Dashboard logic
    const handleAssignItem = async (transactionId: string, itemId: string | null) => {
        setUpdatingTransactionId(transactionId);
        try {
            await apiClient.updateTransaction(transactionId, { itemAsignadoId: itemId });
            // Invalidate transactions query to reflect changes immediately
            queryClient.invalidateQueries({ queryKey: ['transactions', currentOrg?.id] });
        } finally {
            setUpdatingTransactionId(undefined);
        }
    };

    const handleAssignCategory = async (transactionId: string, categoryId: string | null) => {
        setUpdatingTransactionId(transactionId);
        try {
            await apiClient.updateTransaction(transactionId, { categoryId });
            queryClient.invalidateQueries({ queryKey: ['transactions', currentOrg?.id] });
        } finally {
            setUpdatingTransactionId(undefined);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Gestión de Excels</h1>
                        <p className="text-slate-500 mt-2 text-lg">
                            Revisa y categoriza transacciones por archivo de origen.
                        </p>
                    </div>

                    <div className="w-[300px]">
                        <Select value={selectedUploadId} onValueChange={handleUploadChange}>
                            <SelectTrigger className="bg-white border-slate-200">
                                <SelectValue placeholder="Seleccionar archivo Excel..." />
                            </SelectTrigger>
                            <SelectContent>
                                {uploads.map((upload) => (
                                    <SelectItem key={upload.id} value={upload.id}>
                                        <div className="flex flex-col items-start gap-1 py-1">
                                            <span className="font-medium">{upload.filename}</span>
                                            <span className="text-xs text-slate-400">
                                                {upload.createdAt && format(new Date(upload.createdAt), "dd MMM yyyy HH:mm", { locale: es })} • {upload.totalRows} filas
                                            </span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {uploadDetails && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-4">
                        <Card className="bg-white border-slate-200 shadow-sm">
                            <CardContent className="pt-6 flex items-center gap-4">
                                <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                                    <Layers className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Total Transacciones</p>
                                    <h3 className="text-2xl font-bold text-slate-900">{uploadDetails.totalRows}</h3>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border-slate-200 shadow-sm">
                            <CardContent className="pt-6 flex items-center gap-4">
                                <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
                                    <Calendar className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Primera Transacción</p>
                                    <h3 className="text-xl font-bold text-slate-900">
                                        {uploadDetails.stats?.minDate ? format(new Date(uploadDetails.stats.minDate), "dd MMM yyyy", { locale: es }) : '-'}
                                    </h3>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border-slate-200 shadow-sm">
                            <CardContent className="pt-6 flex items-center gap-4">
                                <div className="p-3 bg-violet-50 rounded-lg text-violet-600">
                                    <Calendar className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Última Transacción</p>
                                    <h3 className="text-xl font-bold text-slate-900">
                                        {uploadDetails.stats?.maxDate ? format(new Date(uploadDetails.stats.maxDate), "dd MMM yyyy", { locale: es }) : '-'}
                                    </h3>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Table Section */}
                <Card className="border-slate-200 shadow-sm overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b border-gray-100">
                        <CardTitle className="text-lg font-semibold text-slate-800">
                            Detalle de Transacciones
                        </CardTitle>
                        <CardDescription>
                            Visualizando registros del archivo seleccionado.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {selectedUploadId ? (
                            <div className="p-6">
                                <TransactionsTable
                                    transactions={transactionsData?.items || []}
                                    items={items}
                                    itemTypes={itemTypes}
                                    categories={categories}
                                    isLoading={isLoadingTransactions}
                                    currentPage={page}
                                    totalPages={transactionsData?.totalPages || 1}
                                    onPageChange={handlePageChange}
                                    onAssignItem={handleAssignItem}
                                    onAssignCategory={handleAssignCategory}
                                    updatingTransactionId={updatingTransactionId}
                                />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="p-4 bg-slate-50 rounded-full mb-4">
                                    <FileSpreadsheet className="w-8 h-8 text-slate-300" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900">Selecciona un archivo</h3>
                                <p className="text-slate-500 max-w-sm mt-1">
                                    Elige un archivo Excel procesado del menú superior para ver sus transacciones y corregir asignaciones.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
