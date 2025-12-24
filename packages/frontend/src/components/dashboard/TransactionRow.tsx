import { Transaction, Item, ItemType, TransactionCategory } from '@/types';
import { formatCurrency, formatDate, truncateText } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown, Check, ChevronsUpDown } from 'lucide-react';
import { cn } from "@/lib/utils"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { useState } from 'react';

interface TransactionRowProps {
    transaction: Transaction;
    items: Item[];
    itemTypes: ItemType[];
    onAssignItem: (transactionId: string, itemId: string | null) => void;
    onAssignCategory: (transactionId: string, categoryId: string | null) => void;
    isUpdating?: boolean;
}

export function TransactionRow({
    transaction,
    items,
    itemTypes,
    onAssignItem,
    onAssignCategory,
    isUpdating = false,
}: TransactionRowProps) {
    const assignedItem = items.find((item) => item.id === transaction.itemAsignadoId);
    const [openCategory, setOpenCategory] = useState(false);


    // Filter categories logic
    let availableCategories: TransactionCategory[] = [];

    // Flatten all categories from itemTypes if needed, or filter by assigned item
    if (assignedItem) {
        const type = itemTypes.find(t => t.id === assignedItem.itemTypeId);

        // Fix: If no Item Type found or type has no categories, return all compatible categories
        if (type && type.categories && type.categories.length > 0) {
            availableCategories = type.categories;
        } else {
            // Fallback: If type has no categories (e.g. Retenciones), allow selecting ALL
            availableCategories = itemTypes.flatMap(t => t.categories || []);
        }
    } else {
        // If no item, show ALL categories from all types
        availableCategories = itemTypes.flatMap(t => t.categories || []);
    }

    // Sort categories alphabetically
    availableCategories.sort((a, b) => a.name.localeCompare(b.name));

    // Find current category name
    const currentCategory = availableCategories.find(c => c.id === transaction.categoryId)
        || (transaction.categoryRel ? transaction.categoryRel : undefined);


    return (
        <tr className="border-b border-slate-100/50 hover:bg-slate-50 transition-colors">
            {/* Fecha */}
            <td className="px-4 py-3 text-sm text-slate-600 align-top">
                {formatDate(transaction.fechaValor)}
            </td>

            {/* Descripción + Importe combined for cleaner look on mobile/desktop */}
            <td className="px-4 py-3 align-top">
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-700" title={transaction.descripcion}>
                        {truncateText(transaction.descripcion, 60)}
                    </span>
                    <span className={`text-sm ${transaction.importe > 0 ? 'text-emerald-600' : 'text-slate-500'}`}>
                        {formatCurrency(transaction.importe)}
                    </span>
                    {!transaction.categoryRel && (
                        <span className="text-xs text-slate-400 mt-1">{transaction.categoria}</span>
                    )}
                </div>
            </td>

            {/* Item Column */}
            <td className="px-4 py-3 align-top">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 h-8 text-xs justify-between w-full font-normal border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                            disabled={isUpdating}
                        >
                            <span className="truncate flex items-center gap-2">
                                {assignedItem ? (
                                    <>
                                        <div
                                            className="w-2 h-2 rounded-full shrink-0"
                                            style={{ backgroundColor: assignedItem.color || '#64748b' }}
                                        />
                                        {assignedItem.nombre}
                                    </>
                                ) : (
                                    <span className="text-slate-400 italic">Asignar Item</span>
                                )}
                            </span>
                            <ChevronDown className="h-3 w-3 opacity-50 shrink-0" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[200px]">
                        <DropdownMenuLabel>Asignar Item</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <div className="max-h-[300px] overflow-y-auto">
                            <DropdownMenuItem onClick={() => onAssignItem(transaction.id, null)} className="cursor-pointer">
                                <div className="w-2 h-2 rounded-full bg-slate-300 mr-2" />
                                Sin asignar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {items.filter((item) => item.activo).map((item) => (
                                <DropdownMenuItem key={item.id} onClick={() => onAssignItem(transaction.id, item.id)} className="cursor-pointer">
                                    <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: item.color || '#64748b' }} />
                                    {item.icono && <span className="mr-1">{item.icono}</span>}
                                    {item.nombre}
                                </DropdownMenuItem>
                            ))}
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>
            </td>

            {/* Categoría Column (Combobox) */}
            <td className="px-4 py-3 align-top">
                <Popover open={openCategory} onOpenChange={setOpenCategory}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openCategory}
                            disabled={isUpdating}
                            className={cn(
                                "w-full justify-between h-8 text-xs border-slate-200 bg-white hover:bg-slate-50 text-slate-600",
                                !transaction.categoryId && "text-slate-400 italic"
                            )}
                        >
                            <span className="truncate">
                                {currentCategory ? currentCategory.name : "Seleccionar..."}
                            </span>
                            <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0" align="start">
                        <Command>
                            <CommandInput placeholder="Buscar categoría..." />
                            <CommandList>
                                <CommandEmpty>No encontrada.</CommandEmpty>
                                <CommandGroup>
                                    <CommandItem
                                        value="SIN_CATEGORIA"
                                        onSelect={() => {
                                            onAssignCategory(transaction.id, null);
                                            setOpenCategory(false);
                                        }}
                                        className="text-slate-500 cursor-pointer"
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                !transaction.categoryId ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        Sin categoría
                                    </CommandItem>
                                    {availableCategories.map((category) => (
                                        <CommandItem
                                            key={category.id}
                                            value={category.name}
                                            onSelect={() => {
                                                onAssignCategory(transaction.id, category.id);
                                                setOpenCategory(false);
                                            }}
                                            className="cursor-pointer"
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    transaction.categoryId === category.id ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {category.name}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </td>
        </tr>
    );
}
