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
}

interface Item {
    id: string;
    nombre: string;
    color?: string;
}

interface TransactionReviewTableProps {
    transactions: Transaction[];
    items: Item[];
    onUpdateTransaction: (transactionId: string, itemId: string | null) => void;
}

export function TransactionReviewTable({
    transactions,
    items,
    onUpdateTransaction,
}: TransactionReviewTableProps) {
    if (transactions.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <p className="text-lg">No hay transacciones para revisar</p>
                <p className="text-sm mt-2">Carga un archivo para comenzar</p>
            </div>
        );
    }

    return (
        <div className="rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50 hover:bg-gray-50">
                            <TableHead className="font-semibold text-gray-700">Fecha</TableHead>
                            <TableHead className="font-semibold text-gray-700">Descripción</TableHead>
                            <TableHead className="font-semibold text-gray-700">Categoría</TableHead>
                            <TableHead className="font-semibold text-gray-700 text-right">Importe</TableHead>
                            <TableHead className="font-semibold text-gray-700 w-[200px]">
                                Asignar Item
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.map((transaction) => (
                            <TableRow
                                key={transaction.tempId}
                                className="hover:bg-gray-50/50 transition-colors"
                            >
                                <TableCell className="font-medium text-gray-900">
                                    {format(new Date(transaction.fechaValor), 'dd/MM/yyyy', { locale: es })}
                                </TableCell>
                                <TableCell className="max-w-[300px] truncate text-gray-700" title={transaction.descripcion}>
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
                                            onUpdateTransaction(transaction.tempId!, itemId);
                                        }}
                                    >
                                        <SelectTrigger className="w-full">
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
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                    <span className="font-medium">{transactions.length}</span> transacciones en revisión •{' '}
                    <span className="font-medium">
                        {transactions.filter((t) => t.itemAsignadoId).length}
                    </span>{' '}
                    con item asignado
                </p>
            </div>
        </div>
    );
}
