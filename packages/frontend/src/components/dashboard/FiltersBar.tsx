import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Item } from '@/types';

interface FiltersBarProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;

    selectedTipoItem?: string;
    onTipoItemChange: (value: string) => void;

    selectedItemId?: string;
    onItemChange: (value: string) => void;

    items: Item[]; // Para llenar el select de items
}

export function FiltersBar({
    searchQuery,
    onSearchChange,
    selectedTipoItem,
    onTipoItemChange,
    selectedItemId,
    onItemChange,
    items,
}: FiltersBarProps) {

    // Filtrar items basado en el tipo seleccionado
    const filteredItems = selectedTipoItem && selectedTipoItem !== 'ALL'
        ? items.filter(i => i.tipo === selectedTipoItem)
        : items;

    return (
        <div className="flex flex-col md:flex-row gap-4 items-center bg-slate-50/50 p-4 rounded-lg border border-slate-100">
            {/* Search */}
            <div className="relative flex-1 w-full md:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                    placeholder="Buscar descripción..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-9 bg-white border-slate-200 focus:ring-emerald-500"
                />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                {/* Tipo Item Filter */}
                <div className="w-full sm:w-[200px]">
                    <Select
                        value={selectedTipoItem || "ALL"}
                        onValueChange={(val) => onTipoItemChange(val === "ALL" ? "" : val)}
                    >
                        <SelectTrigger className="bg-white border-slate-200">
                            <SelectValue placeholder="Tipo de Activo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Todos los Tipos</SelectItem>
                            <SelectItem value="BIENES_INMUEBLES">Bienes Inmuebles</SelectItem>
                            <SelectItem value="INVERSIONES">Inversiones</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Item Filter */}
                <div className="w-full sm:w-[250px]">
                    <Select
                        value={selectedItemId || "ALL"}
                        onValueChange={(val) => onItemChange(val === "ALL" ? "" : val)}
                    >
                        <SelectTrigger className="bg-white border-slate-200">
                            <SelectValue placeholder="Filtrar por Item" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Todos los Items</SelectItem>
                            {filteredItems.map(item => (
                                <SelectItem key={item.id} value={item.id}>
                                    <span className="flex items-center gap-2">
                                        <span>{item.icono}</span>
                                        {item.nombre}
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Reset Button (Optional but useful) */}
            {(selectedTipoItem || selectedItemId || searchQuery) && (
                <Button
                    variant="ghost"
                    onClick={() => {
                        onSearchChange("");
                        onTipoItemChange("");
                        onItemChange("");
                    }}
                    className="text-slate-500 hover:text-red-500"
                >
                    Limpiar
                </Button>
            )}
        </div>
    );
}
