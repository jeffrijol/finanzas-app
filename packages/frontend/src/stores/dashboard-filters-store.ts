import { create } from 'zustand';

interface DashboardFiltersState {
    searchQuery: string;
    selectedTipoItem: string; // ID of the type
    selectedItemId: string;   // ID of the item
    selectedCategory: string; // ID of the category
    setSearchQuery: (query: string) => void;
    setSelectedTipoItem: (id: string) => void;
    setSelectedItemId: (id: string) => void;
    setSelectedCategory: (id: string) => void;
    resetFilters: () => void;
}

export const useDashboardFiltersStore = create<DashboardFiltersState>((set) => ({
    searchQuery: '',
    selectedTipoItem: '',
    selectedItemId: '',
    selectedCategory: '',
    setSearchQuery: (query) => set({ searchQuery: query }),
    setSelectedTipoItem: (id) => set({ selectedTipoItem: id, selectedItemId: '' }), // Reset item when type changes
    setSelectedItemId: (id) => set({ selectedItemId: id }),
    setSelectedCategory: (id) => set({ selectedCategory: id }),
    resetFilters: () => set({ searchQuery: '', selectedTipoItem: '', selectedItemId: '', selectedCategory: '' }),
}));
