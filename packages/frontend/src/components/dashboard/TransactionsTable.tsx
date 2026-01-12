import { Transaction, Item, ItemType } from '@/types';
import { TransactionRow } from './TransactionRow';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2, ChevronUp, ChevronDown } from 'lucide-react';

interface TransactionsTableProps {
    transactions: Transaction[];
    items: Item[];
    itemTypes: ItemType[];
    isLoading: boolean;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onAssignItem: (transactionId: string, itemId: string | null) => void;
    onAssignCategory: (transactionId: string, categoryId: string | null) => void;
    updatingTransactionId?: string;
    isTableVisible?: boolean;
    onToggleVisibility?: () => void;
}

export function TransactionsTable({
    transactions,
    items,
    itemTypes,
    isLoading,
    currentPage,
    totalPages,
    onPageChange,
    onAssignItem,
    onAssignCategory,
    updatingTransactionId,
    isTableVisible = true,
    onToggleVisibility,
}: TransactionsTableProps) {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    if (transactions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="text-muted-foreground mb-2">
                    No se encontraron transacciones
                </div>
                <div className="text-sm text-muted-foreground">
                    Intenta ajustar los filtros o sube un archivo Excel
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Table */}
            <div className="rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50">
                            <tr className="border-b border-slate-200">
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-[120px]">
                                    Fecha
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Descripción / Importe
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-[200px]">
                                    Item
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-[200px]">
                                    <div className="flex items-center justify-between">
                                        <span>Categoría</span>
                                        {onToggleVisibility && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 ml-2 text-slate-400 hover:text-slate-600"
                                                onClick={onToggleVisibility}
                                                title={isTableVisible ? "Ocultar tabla" : "Mostrar tabla"}
                                            >
                                                {isTableVisible ? (
                                                    <ChevronUp className="h-4 w-4" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4" />
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        {isTableVisible && (
                            <tbody className="bg-white divide-y divide-slate-100">
                                {transactions.map((transaction) => (
                                    <TransactionRow
                                        key={transaction.id}
                                        transaction={transaction}
                                        items={items}
                                        itemTypes={itemTypes}
                                        onAssignItem={onAssignItem}
                                        onAssignCategory={onAssignCategory}
                                        isUpdating={updatingTransactionId === transaction.id}
                                    />
                                ))}
                            </tbody>
                        )}
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {isTableVisible && totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                    <div className="text-sm text-slate-500">
                        Página {currentPage} de {totalPages}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="h-8"
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Anterior
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="h-8"
                        >
                            Siguiente
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
