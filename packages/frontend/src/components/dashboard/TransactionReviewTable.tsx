import { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectGroup,
    SelectLabel,
    SelectSeparator,
} from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, CircleDashed, Clock, CheckSquare, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

interface ReviewTransaction {
    tempId: string;
    id?: string;
    fechaValor: string;
    descripcion: string;
    importe: number;
    categoria: string;
    itemAsignadoId?: string | null;
    categoryId?: string | null;
    state: 'draft' | 'assigned' | 'synced';
    isDirty: boolean;
}

interface Item {
    id: string;
    nombre: string;
    color?: string;
}

interface TransactionReviewTableProps {
    transactions: ReviewTransaction[];
    items: Item[];
    onUpdateTransaction: (transactionId: string, updates: Partial<ReviewTransaction>) => void;
    onBulkAssign?: (transactionIds: string[], itemId: string) => void;
}

export function TransactionReviewTable({
    transactions,
    items,
    onUpdateTransaction,
    onBulkAssign
}: TransactionReviewTableProps) {
    const [isBatchMode, setIsBatchMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [openCategoryForTempId, setOpenCategoryForTempId] = useState<string | null>(null);
    const [openItemForTempId, setOpenItemForTempId] = useState<string | null>(null);

    const { data: itemTypes = [] } = useQuery({
        queryKey: ['itemTypes'],
        queryFn: () => apiClient.getItemTypes(),
    });

    const getAvailableCategories = (transaction: ReviewTransaction) => {
        if (!transaction.itemAsignadoId) return [];
        const item = items.find(i => i.id === transaction.itemAsignadoId);
        if (!item) return [];

        const type = itemTypes.find(t => t.id === (item as any).itemTypeId);
        if (!type || !type.categories) return [];

        const isIncome = transaction.importe > 0;

        if (!type || !type.categories || type.categories.length === 0) {
            const allCategories = itemTypes.flatMap(t => t.categories || []);
            return allCategories.filter(c => isIncome ? c.type === 'INCOME' : c.type === 'EXPENSE');
        }

        return type.categories.filter(c => isIncome ? c.type === 'INCOME' : c.type === 'EXPENSE');
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === transactions.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(transactions.map(t => t.tempId));
        }
    };

    const toggleSelectRow = (tempId: string) => {
        if (selectedIds.includes(tempId)) {
            setSelectedIds(selectedIds.filter(id => id !== tempId));
        } else {
            setSelectedIds([...selectedIds, tempId]);
        }
    };

    if (transactions.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <p className="text-lg">No hay transacciones para revisar</p>
                <p className="text-sm mt-2">Carga un archivo para comenzar</p>
            </div>
        );
    }

    const getStatusBadge = (state: string, isDirty: boolean) => {
        if (state === 'synced' && !isDirty) {
            return (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Sincronizado
                </Badge>
            );
        }
        if (state === 'assigned' || isDirty) {
            return (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    <Clock className="w-3 h-3 mr-1" /> Pendiente
                </Badge>
            );
        }
        return (
            <Badge variant="outline" className="text-slate-500 border-slate-200">
                <CircleDashed className="w-3 h-3 mr-1" /> Borrador
            </Badge>
        );
    };

    return (
        <div className="space-y-4 relative">
            {/* Toolbar for Batch Mode Toggle */}
            <div className="flex justify-end">
                <Button
                    variant={isBatchMode ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => {
                        setIsBatchMode(!isBatchMode);
                        setSelectedIds([]);
                    }}
                    className={isBatchMode ? "bg-slate-100" : ""}
                >
                    <CheckSquare className="w-4 h-4 mr-2" />
                    {isBatchMode ? "Cancelar Selección" : "Selección Múltiple"}
                </Button>
            </div>

            <div className="rounded-lg border border-gray-200 overflow-hidden relative">
                <div className="overflow-x-auto max-h-[600px]">
                    <Table>
                        <TableHeader className="bg-gray-50 sticky top-0 z-10">
                            <TableRow className="hover:bg-gray-50">
                                {isBatchMode && (
                                    <TableHead className="w-[40px]">
                                        <Checkbox
                                            checked={selectedIds.length === transactions.length && transactions.length > 0}
                                            onCheckedChange={toggleSelectAll}
                                        />
                                    </TableHead>
                                )}
                                <TableHead className="w-[120px] font-semibold text-gray-700">Estado</TableHead>
                                <TableHead className="font-semibold text-gray-700">Fecha</TableHead>
                                <TableHead className="font-semibold text-gray-700">Descripción</TableHead>
                                <TableHead className="font-semibold text-gray-700">Categoría</TableHead>
                                <TableHead className="font-semibold text-gray-700 text-right">Importe</TableHead>
                                <TableHead className="font-semibold text-gray-700 w-[220px] min-w-[220px]">
                                    Asignar Item
                                </TableHead>
                                <TableHead className="font-semibold text-gray-700 w-[220px] min-w-[220px]">
                                    Asignar Categoría
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.map((transaction) => {
                                const isSynced = transaction.state === 'synced' && !transaction.isDirty;
                                return (
                                    <TableRow
                                        key={transaction.tempId}
                                        className={`transition-colors ${isSynced ? 'bg-slate-50/50 hover:bg-slate-50' : 'hover:bg-gray-50/50'} ${selectedIds.includes(transaction.tempId) ? 'bg-blue-50/50' : ''}`}
                                    >
                                        {isBatchMode && (
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedIds.includes(transaction.tempId)}
                                                    onCheckedChange={() => toggleSelectRow(transaction.tempId)}
                                                />
                                            </TableCell>
                                        )}
                                        <TableCell>
                                            {getStatusBadge(transaction.state, transaction.isDirty)}
                                        </TableCell>
                                        <TableCell className="font-medium text-gray-900">
                                            {format(new Date(transaction.fechaValor), 'dd/MM/yyyy', { locale: es })}
                                        </TableCell>
                                        <TableCell className="max-w-[250px] truncate text-gray-700" title={transaction.descripcion}>
                                            {transaction.descripcion}
                                        </TableCell>
                                        <TableCell className="text-gray-600 text-sm">
                                            {transaction.categoria}
                                        </TableCell>
                                        <TableCell
                                            className={`text-right font-semibold ${transaction.importe >= 0 ? 'text-green-600' : 'text-red-600'
                                                }`}
                                        >
                                            {formatCurrency(transaction.importe)}
                                        </TableCell>
                                        <TableCell>
                                            <Select
                                                value={transaction.itemAsignadoId || 'sin-asignar'}
                                                open={openItemForTempId === transaction.tempId}
                                                onOpenChange={(open) => {
                                                    if (!open && openItemForTempId === transaction.tempId) {
                                                        setOpenItemForTempId(null);
                                                    } else if (open) {
                                                        setOpenItemForTempId(transaction.tempId);
                                                    }
                                                }}
                                                onValueChange={(value) => {
                                                    const itemId = value === 'sin-asignar' ? null : value;
                                                    onUpdateTransaction(transaction.tempId!, { itemAsignadoId: itemId, categoryId: null });
                                                    if (itemId) {
                                                        // Ensure the state update settles before opening next dropdown
                                                        setTimeout(() => setOpenCategoryForTempId(transaction.tempId), 50);
                                                    }
                                                }}
                                                disabled={isBatchMode}
                                            >
                                                <SelectTrigger className={`w-full bg-white ${isBatchMode ? 'opacity-50' : ''}`}>
                                                    <SelectValue placeholder="Seleccionar..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="sin-asignar">
                                                        <span className="text-gray-400 italic">Sin asignar</span>
                                                    </SelectItem>
                                                    {itemTypes.map((type: any) => {
                                                        const typeItems = items.filter((item) => (item as any).itemTypeId === type.id);
                                                        if (typeItems.length === 0) return null;

                                                        return (
                                                            <div key={type.id}>
                                                                <SelectGroup>
                                                                    <SelectLabel className="text-xs font-semibold text-slate-400 py-1 pl-2">{type.name}</SelectLabel>
                                                                    {typeItems.map((item) => (
                                                                        <SelectItem key={item.id} value={item.id} className="pl-6">
                                                                            <div className="flex items-center gap-2">
                                                                                {item.color && (
                                                                                    <div
                                                                                        className="w-3 h-3 rounded-full shrink-0"
                                                                                        style={{ backgroundColor: item.color }}
                                                                                    />
                                                                                )}
                                                                                <span>{item.nombre}</span>
                                                                            </div>
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectGroup>
                                                                <SelectSeparator />
                                                            </div>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell>
                                            <Select
                                                value={transaction.categoryId || 'sin-categoria'}
                                                open={openCategoryForTempId === transaction.tempId}
                                                onOpenChange={(open) => {
                                                    if (!open && openCategoryForTempId === transaction.tempId) {
                                                        setOpenCategoryForTempId(null);
                                                    } else if (open) {
                                                        setOpenCategoryForTempId(transaction.tempId);
                                                    }
                                                }}
                                                onValueChange={(value) => {
                                                    const categoryId = value === 'sin-categoria' ? null : value;
                                                    onUpdateTransaction(transaction.tempId!, { categoryId });

                                                    // Chain navigation: focus next transaction's item dropdown
                                                    if (categoryId) {
                                                        const currentIndex = transactions.findIndex(t => t.tempId === transaction.tempId);
                                                        if (currentIndex >= 0 && currentIndex < transactions.length - 1) {
                                                            const nextTransaction = transactions[currentIndex + 1];
                                                            setTimeout(() => {
                                                                setOpenCategoryForTempId(null);
                                                                setOpenItemForTempId(nextTransaction.tempId);
                                                            }, 100);
                                                        }
                                                    }
                                                }}
                                                disabled={!transaction.itemAsignadoId || isBatchMode}
                                            >
                                                <SelectTrigger className="w-full bg-white">
                                                    <SelectValue placeholder={transaction.itemAsignadoId ? "Categoría..." : "-"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="sin-categoria">
                                                        <span className="text-gray-400 italic">Sin categoría</span>
                                                    </SelectItem>
                                                    {getAvailableCategories(transaction).map((cat) => (
                                                        <SelectItem key={cat.id} value={cat.id}>
                                                            {cat.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>

                <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                    <p className="text-sm text-gray-600 flex justify-between">
                        <span>
                            <span className="font-medium">{transactions.length}</span> transacciones en total
                        </span>
                        <span>
                            <span className="font-medium text-emerald-600">
                                {transactions.filter(t => t.state === 'synced' && !t.isDirty).length}
                            </span> sincronizadas
                        </span>
                    </p>
                </div>
            </div>

            {/* Floating Bulk Action Bar */}
            {isBatchMode && selectedIds.length > 0 && (
                <div className="sticky bottom-4 mx-auto max-w-2xl bg-slate-900 text-white rounded-lg shadow-xl p-4 flex items-center justify-between gap-4 animate-in slide-in-from-bottom-5">
                    <div className="flex items-center gap-4">
                        <span className="font-medium text-sm whitespace-nowrap">
                            {selectedIds.length} seleccionadas
                        </span>
                        <div className="h-6 w-px bg-slate-700" />

                        <Select
                            onValueChange={(value) => {
                                if (onBulkAssign && value !== 'placeholder') {
                                    onBulkAssign(selectedIds, value);
                                    setSelectedIds([]); // Auto exit selection
                                    // setIsBatchMode(false); // Optional: Auto exit mode
                                }
                            }}
                        >
                            <SelectTrigger className="w-[200px] bg-slate-800 border-slate-700 text-white h-8 text-xs">
                                <SelectValue placeholder="Asignar Item a todas..." />
                            </SelectTrigger>
                            <SelectContent className="dark">
                                {itemTypes.map((type: any) => {
                                    const typeItems = items.filter((item) => (item as any).itemTypeId === type.id);
                                    if (typeItems.length === 0) return null;

                                    return (
                                        <div key={type.id}>
                                            <SelectGroup>
                                                <SelectLabel className="text-xs font-semibold text-slate-400 py-1 pl-2">{type.name}</SelectLabel>
                                                {typeItems.map((item) => (
                                                    <SelectItem key={item.id} value={item.id} className="pl-6">
                                                        {item.nombre}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                            <SelectSeparator className="bg-slate-700" />
                                        </div>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-white"
                        onClick={() => setSelectedIds([])}
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            )}
        </div >
    );
}
