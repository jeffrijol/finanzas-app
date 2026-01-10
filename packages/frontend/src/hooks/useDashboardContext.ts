import { useMemo } from 'react';
import { usePeriodStore } from '@/stores/period-store';
import { useDashboardFiltersStore } from '@/stores/dashboard-filters-store';

export type DashboardLevel = 'general' | 'type' | 'item' | 'category' | 'year' | 'quarter';

interface DashboardContext {
    level: DashboardLevel;
    title: string;
    description: string;
    filters: {
        year: number;
        quarter: number | 'all';
        tipoItem: string;
        itemId: string;
        categoryId?: string;
    };
}

export const useDashboardContext = (
    items: { id: string; nombre: string }[],
    itemTypes: { id: string; name: string }[],
    categories: { id: string; name: string }[]
) => {
    const { year, quarter } = usePeriodStore();
    const { selectedTipoItem, selectedItemId, selectedCategory } = useDashboardFiltersStore();

    const context = useMemo<DashboardContext>(() => {
        const filters = {
            year,
            quarter,
            tipoItem: selectedTipoItem,
            itemId: selectedItemId,
            categoryId: selectedCategory
        };

        // Determine Level
        let level: DashboardLevel = 'general';
        if (selectedItemId) level = 'item';
        else if (selectedCategory && selectedCategory !== 'ALL') level = 'category';
        else if (selectedTipoItem && selectedTipoItem !== 'ALL') level = 'type';
        else if (quarter !== 'all') level = 'quarter';
        else if (year) level = 'year';

        // ... title and description logic ...
        let title = 'Visión General';
        let description = 'Resumen financiero global';

        switch (level) {
            case 'item':
                const itemName = items.find(i => i.id === selectedItemId)?.nombre || 'Item';
                title = `Análisis: ${itemName}`;
                description = 'Detalle de rendimiento por categoría y evolución';
                break;
            case 'type':
                const typeName = itemTypes.find(t => t.id === selectedTipoItem)?.name || 'Tipo';
                title = `Tipo: ${typeName}`;
                description = 'Comparativa de activos y distribución interna';
                break;
            case 'category':
                const catName = categories.find(c => c.id === selectedCategory)?.name || 'Categoría';
                title = `Categoría: ${catName}`;
                description = 'Análisis detallado de categoría';
                break;
            case 'quarter':
                title = `Trimestre ${quarter} - ${year}`;
                description = 'Desglose detallado del trimestre';
                break;
            case 'year':
                title = `Año ${year}`;
                description = 'Resumen anual consolidado';
                break;
        }

        return { level, title, description, filters };
    }, [year, quarter, selectedTipoItem, selectedItemId, items, itemTypes]);

    return context;
};
