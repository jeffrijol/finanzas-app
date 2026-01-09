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
} from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatCurrency } from '@/lib/utils';

interface Transaction {
    tempId?: string;
    fechaValor: string;
    descripcion: string;
    importe: number;
    categoria: string;
    itemAsignadoId?: string | null;
    categoryId?: string | null;
}

interface Item {
    id: string;
    nombre: string;
    color?: string;
}

interface TransactionReviewTableProps {
    transactions: Transaction[];
    items: Item[];
    onUpdateTransaction: (transactionId: string, updates: Partial<Transaction>) => void;
}

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
} from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, CircleDashed, Clock } from 'lucide-react';

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
}

export function TransactionReviewTable({
    transactions,
    items,
    onUpdateTransaction,
}: TransactionReviewTableProps) {
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
        <div className="rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50 hover:bg-gray-50">
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
                                    className={`transition-colors ${isSynced ? 'bg-slate-50/50 hover:bg-slate-50' : 'hover:bg-gray-50/50'}`}
                                >
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
                                            onValueChange={(value) => {
                                                const itemId = value === 'sin-asignar' ? null : value;
                                                onUpdateTransaction(transaction.tempId!, { itemAsignadoId: itemId, categoryId: null });
                                            }}
                                        >
                                            <SelectTrigger className="w-full bg-white">
                                                <SelectValue placeholder="Seleccionar..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="sin-asignar">
                                                    <span className="text-gray-400 italic">Sin asignar</span>
                                                </SelectItem>
                                                {items.map((item) => (
                                                    <SelectItem key={item.id} value={item.id}>
                                                        <div className="flex items-center gap-2">
                                                            {item.color && (
                                                                <div
                                                                    className="w-3 h-3 rounded-full"
                                                                    style={{ backgroundColor: item.color }}
                                                                />
                                                            )}
                                                            <span>{item.nombre}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        <Select
                                            value={transaction.categoryId || 'sin-categoria'}
                                            onValueChange={(value) => {
                                                const categoryId = value === 'sin-categoria' ? null : value;
                                                onUpdateTransaction(transaction.tempId!, { categoryId });
                                            }}
                                            disabled={!transaction.itemAsignadoId}
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
        </div >
    );
}
