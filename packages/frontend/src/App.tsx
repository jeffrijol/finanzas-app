import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { FileUploadCard } from '@/components/dashboard/FileUploadCard';
import { FiltersBar } from '@/components/dashboard/FiltersBar';
import { TransactionsTable } from '@/components/dashboard/TransactionsTable';
import { ItemsPanel } from '@/components/dashboard/ItemsPanel';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

function App() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State for filters
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<string | undefined>();
  const [onlyUnassigned, setOnlyUnassigned] = useState(false);
  const [updatingTransactionId, setUpdatingTransactionId] = useState<string | undefined>();

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
    queryKey: ['transactions', page, searchQuery, selectedCategoria, onlyUnassigned],
    queryFn: () =>
      apiClient.getTransactions({
        page,
        limit: 10,
        search: searchQuery || undefined,
        categoria: selectedCategoria,
        sinAsignar: onlyUnassigned || undefined,
      }),
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: () => apiClient.getTransactionStats(),
  });

  // Upload file mutation
  const uploadMutation = useMutation({
    mutationFn: (file: File) => apiClient.uploadFile(file),
    onSuccess: (data) => {
      toast({
        title: 'Archivo subido exitosamente',
        description: `Se procesaron ${data.totalRows} transacciones`,
      });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error al subir archivo',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update transaction mutation (assign item)
  const updateTransactionMutation = useMutation({
    mutationFn: ({ id, itemId }: { id: string; itemId: string | null }) =>
      apiClient.updateTransaction(id, { itemAsignadoId: itemId }),
    onMutate: async ({ id }) => {
      setUpdatingTransactionId(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      toast({
        title: 'Item asignado correctamente',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error al asignar item',
        description: error.message,
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setUpdatingTransactionId(undefined);
    },
  });

  // Get unique categories
  const categorias = Array.from(
    new Set(
      transactionsData?.items.map((t) => t.categoria) || []
    )
  ).sort();

  const handleFileUpload = (file: File) => {
    uploadMutation.mutate(file);
  };

  const handleAssignItem = (transactionId: string, itemId: string | null) => {
    updateTransactionMutation.mutate({ id: transactionId, itemId });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Upload Section */}
        <FileUploadCard
          onFileUpload={handleFileUpload}
          isUploading={uploadMutation.isPending}
        />

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Ingresos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-400">
                  {formatCurrency(stats.totalIngresos)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Gastos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-rose-400">
                  {formatCurrency(stats.totalGastos)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatCurrency(stats.balance)}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Transactions Table */}
          <div className="lg:col-span-3 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Transacciones ({transactionsData?.total || 0})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FiltersBar
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  selectedCategoria={selectedCategoria}
                  onCategoriaChange={setSelectedCategoria}
                  onlyUnassigned={onlyUnassigned}
                  onOnlyUnassignedChange={setOnlyUnassigned}
                  categorias={categorias}
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
          </div>

          {/* Items Panel */}
          <div className="lg:col-span-1">
            <ItemsPanel
              items={items}
              stats={stats?.transaccionesPorItem}
              sinAsignar={stats?.sinAsignar}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default App;
