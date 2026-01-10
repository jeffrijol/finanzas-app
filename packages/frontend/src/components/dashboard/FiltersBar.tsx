import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Item, ItemType, TransactionCategory } from '@/types';
import { useDashboardFiltersStore } from '@/stores/dashboard-filters-store';

interface FiltersBarProps {
    items: Item[];
    itemTypes: ItemType[];
    categories: TransactionCategory[];
}

export function FiltersBar({ items, itemTypes, categories }: FiltersBarProps) {
    const {
        searchQuery, setSearchQuery,
        selectedTipoItem, setSelectedTipoItem,
        selectedItemId, setSelectedItemId,
        selectedCategory, setSelectedCategory,
        resetFilters
    } = useDashboardFiltersStore();

    // Filtrar items basado en el tipo seleccionado
    const filteredItems = selectedTipoItem && selectedTipoItem !== 'ALL'
        ? items.filter(i => i.itemTypeId === selectedTipoItem)
        : items;

    // Check if any filter is active
    const hasActiveFilters = selectedTipoItem || selectedItemId || searchQuery || selectedCategory;

    const handleSearchChange = (val: string) => setSearchQuery(val);
    const handleTipoItemChange = (val: string) => setSelectedTipoItem(val === "ALL" ? "" : val);
    const handleItemChange = (val: string) => setSelectedItemId(val === "ALL" ? "" : val);
    const handleCategoryChange = (val: string) => setSelectedCategory(val === "ALL" ? "" : val);

    return (
        <div className="flex flex-col md:flex-row gap-4 items-center bg-slate-50/50 p-4 rounded-lg border border-slate-100">
            {/* Search */}
            <div className="relative flex-1 w-full md:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                    placeholder="Buscar descripción..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-9 bg-white border-slate-200 focus:ring-emerald-500"
                />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                {/* Tipo Item Filter */}
                <div className="w-full sm:w-[180px]">
                    <Select
                        value={selectedTipoItem || "ALL"}
                        onValueChange={handleTipoItemChange}
                    >
                        <SelectTrigger className="bg-white border-slate-200">
                            <SelectValue placeholder="Tipo de Activo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Todos los Tipos</SelectItem>
                            {itemTypes.map((type) => (
                                <SelectItem key={type.id} value={type.id}>
                                    {type.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Category Filter */}
                {/* Category Filter - DISABLED
                <div className="w-full sm:w-[180px]">
                    <Select
                        value={selectedCategory || "ALL"}
                        onValueChange={handleCategoryChange}
                    >
                        <SelectTrigger className="bg-white border-slate-200">
                            <SelectValue placeholder="Categoría" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Todas las Categorías</SelectItem>
                            {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                    {cat.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                */}

                {/* Item Filter */}
                <div className="w-full sm:w-[250px]">
                    <Select
                        value={selectedItemId || "ALL"}
                        onValueChange={handleItemChange}
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

            {/* Reset Button */}
            {hasActiveFilters && (
                <Button
                    variant="ghost"
                    onClick={resetFilters}
                    className="text-slate-500 hover:text-red-500"
                >
                    Limpiar
                </Button>
            )}
        </div>
    );
}

