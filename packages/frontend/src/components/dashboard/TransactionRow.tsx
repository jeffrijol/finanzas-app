import { Transaction, Item } from '@/types';
import { formatCurrency, formatDate, truncateText } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

interface TransactionRowProps {
    transaction: Transaction;
    items: Item[];
    onAssignItem: (transactionId: string, itemId: string | null) => void;
    isUpdating?: boolean;
}

export function TransactionRow({
    transaction,
    items,
    onAssignItem,
    isUpdating = false,
}: TransactionRowProps) {
    const assignedItem = items.find((item) => item.id === transaction.itemAsignadoId);

    const getAmountColor = (amount: number) => {
        if (amount > 0) return 'text-emerald-400';
        if (amount < 0) return 'text-rose-400';
        return 'text-muted-foreground';
    };

    return (
        <tr className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
            {/* Fecha */}
            <td className="px-4 py-3 text-sm">
                {formatDate(transaction.fechaValor)}
            </td>



            {/* Descripción */}
            <td className="px-4 py-3 text-sm max-w-xs">
                <span title={transaction.descripcion}>
                    {truncateText(transaction.descripcion, 50)}
                </span>
            </td>

            {/* Importe */}
            <td className={`px-4 py-3 text-sm font-medium text-right ${getAmountColor(transaction.importe)}`}>
                {formatCurrency(transaction.importe)}
            </td>



            {/* Asignar Item + Categoría */}
            <td className="px-4 py-3 text-sm">
                <div className="flex flex-col gap-1.5 items-start">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 h-8 text-xs font-normal border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800"
                                disabled={isUpdating}
                            >
                                {assignedItem ? (
                                    <>
                                        <div
                                            className="w-2 h-2 rounded-full"
                                            style={{ backgroundColor: assignedItem.color || '#64748b' }}
                                        />
                                        {assignedItem.nombre}
                                    </>
                                ) : (
                                    <span className="text-muted-foreground italic">Asignar Item</span>
                                )}
                                <ChevronDown className="h-3 w-3 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-slate-800 text-slate-200">
                            <DropdownMenuLabel>Asignar a</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-slate-800" />
                            <DropdownMenuItem onClick={() => onAssignItem(transaction.id, null)} className="focus:bg-slate-800 focus:text-white cursor-pointer">
                                <div className="w-2 h-2 rounded-full bg-slate-500 mr-2" />
                                Sin asignar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-800" />
                            {items.filter((item) => item.activo).map((item) => (
                                <DropdownMenuItem key={item.id} onClick={() => onAssignItem(transaction.id, item.id)} className="focus:bg-slate-800 focus:text-white cursor-pointer">
                                    <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: item.color || '#64748b' }} />
                                    {item.icono && <span className="mr-1">{item.icono}</span>}
                                    {item.nombre}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {transaction.categoryRel ? (
                        <Badge variant="secondary" className="bg-slate-800/50 text-slate-400 text-[10px] px-2 py-0 h-5 font-normal border border-slate-800">
                            {transaction.categoryRel.name}
                        </Badge>
                    ) : (
                        <span className="text-[10px] text-slate-500 px-1">{transaction.categoria}</span>
                    )}
                </div>
            </td>
        </tr>
    );
}
