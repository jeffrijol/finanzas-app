import { useState, useEffect } from 'react';
import { Search, LayoutGrid, BarChart3, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Item, ItemType, TransactionCategory } from '@/types';
import { useDashboardFiltersStore } from '@/stores/dashboard-filters-store';
import { PeriodSelector } from './PeriodSelector';
import { DownloadReportButton } from './DownloadReportButton';

interface DashboardHeaderProps {
    items: Item[];
    itemTypes: ItemType[];
    categories: TransactionCategory[];
    currentView: 'management' | 'analytics';
    onViewChange: (view: 'management' | 'analytics') => void;
    onExport: (format: 'json' | 'csv') => void;
}

export function DashboardHeader({
    items,
    itemTypes,
    categories,
    currentView,
    onViewChange,
    onExport
}: DashboardHeaderProps) {
    const {
        searchQuery, setSearchQuery,
        selectedTipoItem, setSelectedTipoItem,
        selectedItemId, setSelectedItemId,
        selectedCategory, setSelectedCategory,
        resetFilters
    } = useDashboardFiltersStore();

    // Local state for debounced input
    const [inputValue, setInputValue] = useState(searchQuery);

    // Sync local state with store when store changes (e.g. reset)
    useEffect(() => {
        setInputValue(searchQuery);
    }, [searchQuery]);

    // Debounce effect: Update store after delay
    useEffect(() => {
        const timer = setTimeout(() => {
            if (inputValue !== searchQuery) {
                setSearchQuery(inputValue);
            }
        }, 300); // 300ms delay

        return () => clearTimeout(timer);
    }, [inputValue, setSearchQuery, searchQuery]);

    // Filtering items based on type
    const filteredItems = selectedTipoItem && selectedTipoItem !== 'ALL'
        ? items.filter(i => i.itemTypeId === selectedTipoItem)
        : items;

    // Logic for filtering categories
    // 1. If Item is selected, filter categories by that Item's Type
    // 2. If no Item but Type is selected, filter categories by that Type
    // 3. Otherwise show all
    let activeTypeId: string | undefined;

    if (selectedItemId && selectedItemId !== 'ALL') {
        const selectedItem = items.find(i => i.id === selectedItemId);
        if (selectedItem) {
            activeTypeId = selectedItem.itemTypeId;
        }
    } else if (selectedTipoItem && selectedTipoItem !== 'ALL') {
        activeTypeId = selectedTipoItem;
    }

    const filteredCategories = activeTypeId
        ? categories.filter(c => c.itemTypeId === activeTypeId)
        : categories;

    const hasActiveFilters = selectedTipoItem || selectedItemId || searchQuery || selectedCategory;

    return (
        <div className="flex flex-col gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">

            {/* Top Row: Period & Main Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
                    <div className="hidden md:block h-6 w-px bg-slate-200 mx-2"></div>
                    <PeriodSelector />
                </div>

                <div className="flex items-center gap-2">
                    {/* View Toggles */}
                    <div className="flex p-1 bg-slate-100 rounded-lg">
                        <button
                            onClick={() => onViewChange('management')}
                            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${currentView === 'management'
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                            <span className="hidden sm:inline">Gestión</span>
                        </button>
                        <button
                            onClick={() => onViewChange('analytics')}
                            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${currentView === 'analytics'
                                ? 'bg-white text-emerald-700 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <BarChart3 className="w-4 h-4" />
                            <span className="hidden sm:inline">Analítica</span>
                        </button>
                    </div>

                    <div className="h-6 w-px bg-slate-200 mx-1"></div>
                    <DownloadReportButton />
                </div>
            </div>

            {/* Middle Row: Global Filters */}
            <div className="flex flex-col lg:flex-row gap-3 items-center pt-2">

                {/* Search */}
                <div className="relative w-full lg:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Buscar..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="pl-9 h-10 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                    />
                </div>

                <div className="flex flex-1 flex-col sm:flex-row gap-3 w-full">
                    {/* Type Filter */}
                    <Select
                        value={selectedTipoItem || "ALL"}
                        onValueChange={(val) => {
                            const newValue = val === "ALL" ? "" : val;
                            setSelectedTipoItem(newValue);
                            // Reset dependent filters to maintain integrity
                            setSelectedItemId("");
                            setSelectedCategory("");
                        }}
                    >
                        <SelectTrigger className={`w-full sm:w-[160px] h-10 ${selectedTipoItem ? 'border-emerald-500 bg-emerald-50/50 text-emerald-700' : 'bg-slate-50 border-slate-200'}`}>
                            <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Todo Tipo</SelectItem>
                            {itemTypes.map((type) => (
                                <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Item Filter (Dependent) */}
                    <Select
                        value={selectedItemId || "ALL"}
                        onValueChange={(val) => setSelectedItemId(val === "ALL" ? "" : val)}
                    >
                        <SelectTrigger className={`w-full sm:w-[200px] h-10 ${selectedItemId ? 'border-emerald-500 bg-emerald-50/50 text-emerald-700' : 'bg-slate-50 border-slate-200'}`}>
                            <SelectValue placeholder="Item Específico" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Cualquier Item</SelectItem>
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

                    {/* Category Filter */}
                    <Select
                        value={selectedCategory || "ALL"}
                        onValueChange={(val) => setSelectedCategory(val === "ALL" ? "" : val)}
                    >
                        <SelectTrigger className={`w-full sm:w-[160px] h-10 ${selectedCategory ? 'border-emerald-500 bg-emerald-50/50 text-emerald-700' : 'bg-slate-50 border-slate-200'}`}>
                            <SelectValue placeholder="Categoría" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Toda Categoría</SelectItem>
                            {filteredCategories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Reset Actions */}
                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetFilters}
                        className="text-slate-500 hover:text-red-500 hover:bg-red-50 h-10 px-3"
                    >
                        <X className="w-4 h-4 mr-1" />
                        Limpiar
                    </Button>
                )}
            </div>

            {/* Active Filters Badges */}
            {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 pt-1 animate-in fade-in slide-in-from-top-1">
                    {selectedTipoItem && (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 pl-1 pr-2">
                            <Filter className="w-3 h-3" /> Tipo: {itemTypes.find(t => t.id === selectedTipoItem)?.name}
                        </Badge>
                    )}
                    {selectedCategory && (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 pl-1 pr-2">
                            <Filter className="w-3 h-3" /> Cat: {categories.find(c => c.id === selectedCategory)?.name}
                        </Badge>
                    )}
                    {selectedItemId && (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 pl-1 pr-2">
                            <Filter className="w-3 h-3" /> Item: {items.find(i => i.id === selectedItemId)?.nombre}
                        </Badge>
                    )}
                </div>
            )}
        </div>
    );
}
