import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface FiltersBarProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    selectedCategoria?: string;
    onCategoriaChange: (categoria?: string) => void;
    onlyUnassigned: boolean;
    onOnlyUnassignedChange: (value: boolean) => void;
    categorias: string[];
}

export function FiltersBar({
    searchQuery,
    onSearchChange,
    selectedCategoria,
    onCategoriaChange,
    onlyUnassigned,
    onOnlyUnassignedChange,
    categorias,
}: FiltersBarProps) {
    return (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* Search */}
            <div className="relative flex-1 w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar por descripción..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Category filter */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                        <Filter className="h-4 w-4" />
                        {selectedCategoria || 'Todas las categorías'}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => onCategoriaChange(undefined)}>
                        Todas las categorías
                    </DropdownMenuItem>
                    {categorias.map((cat) => (
                        <DropdownMenuItem
                            key={cat}
                            onClick={() => onCategoriaChange(cat)}
                        >
                            {cat}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Only unassigned checkbox */}
            <div className="flex items-center space-x-2">
                <Checkbox
                    id="only-unassigned"
                    checked={onlyUnassigned}
                    onCheckedChange={(checked) =>
                        onOnlyUnassignedChange(checked as boolean)
                    }
                />
                <Label
                    htmlFor="only-unassigned"
                    className="text-sm font-medium cursor-pointer"
                >
                    Solo sin asignar
                </Label>
            </div>
        </div>
    );
}
