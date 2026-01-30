import { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useOrganizationQuery } from '@/hooks/useOrganizationQuery';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { Item } from '@/types';
import { ItemForm } from './ItemForm';
import { useToast } from '@/hooks/use-toast';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { usePermissions } from '@/hooks/use-permissions';

export function ItemsList() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { canWrite, canDelete } = usePermissions();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Item | undefined>(undefined);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [showInactive, setShowInactive] = useState(false);

    const { data: items = [], isLoading } = useOrganizationQuery({
        queryKey: ['items', showInactive],
        queryFn: () => apiClient.getItems({ includeInactive: showInactive }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => apiClient.deleteItem(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['items'] });
            toast({
                title: 'Item eliminado',
                description: 'El item ha sido eliminado correctamente.',
            });
            setDeletingId(null);
        },
        onError: () => {
            toast({
                title: 'Error',
                description: 'No se pudo eliminar el item.',
                variant: 'destructive',
            });
            setDeletingId(null);
        },
    });

    const handleCreate = () => {
        setEditingItem(undefined);
        setIsFormOpen(true);
    };

    const handleEdit = (item: Item) => {
        setEditingItem(item);
        setIsFormOpen(true);
    };

    const handleDelete = () => {
        if (deletingId) {
            deleteMutation.mutate(deletingId);
        }
    };

    const columns = useMemo<ColumnDef<Item>[]>(() => [
        {
            accessorKey: 'nombre',
            header: 'Nombre',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-lg">
                        {row.original.icono || '📦'}
                    </div>
                    {row.original.color && (
                        <div
                            className="w-3 h-3 rounded-full border border-gray-300 shadow-sm"
                            style={{ backgroundColor: row.original.color }}
                        />
                    )}
                    <span className="font-medium text-slate-700">{row.original.nombre}</span>
                </div>
            ),
        },
        {
            accessorKey: 'itemType.name',
            header: 'Tipo',
            cell: ({ row }) => (
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100">
                    {row.original.itemType?.name || 'Desconocido'}
                </Badge>
            ),
        },
        {
            accessorKey: 'activo',
            header: 'Estado',
            cell: ({ row }) => (
                <Badge
                    variant="outline"
                    className={row.original.activo ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-50 text-gray-500 border-gray-200"}
                >
                    {row.original.activo ? 'Activo' : 'Inactivo'}
                </Badge>
            ),
        },
        {
            accessorKey: 'descripcion',
            header: 'Descripción',
            cell: ({ row }) => (
                <span className="text-gray-500 text-sm truncate block max-w-[200px]" title={row.original.descripcion || ''}>
                    {row.original.descripcion || '-'}
                </span>
            ),
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Acciones</div>,
            cell: ({ row }) => (
                <div className="flex justify-end gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(row.original)}
                        disabled={!canWrite}
                        className="h-8 w-8 text-slate-500 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        title={!canWrite ? 'No tienes permisos para editar' : 'Editar item'}
                    >
                        <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingId(row.original.id)}
                        disabled={!canDelete}
                        className="h-8 w-8 text-slate-500 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        title={!canDelete ? 'No tienes permisos para eliminar' : 'Eliminar item'}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            ),
        },
    ], [canWrite, canDelete]);

    if (isLoading) {
        return <div className="text-center py-8 text-gray-500">Cargando items...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-lg font-semibold text-slate-800">
                        {showInactive ? 'Todos los Items' : 'Items Activos'}
                    </h2>
                    <p className="text-sm text-slate-500">Gestiona tus items generadores de ingresos/gastos.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="show-inactive"
                            checked={showInactive}
                            onCheckedChange={(checked) => setShowInactive(checked as boolean)}
                        />
                        <Label htmlFor="show-inactive">Mostrar inactivos</Label>
                    </div>
                    <Button 
                        onClick={handleCreate} 
                        disabled={!canWrite}
                        className="bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        title={!canWrite ? 'No tienes permisos para crear items' : 'Crear nuevo item'}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo Item
                    </Button>
                </div>
            </div>

            <DataTable columns={columns} data={items} searchPlaceholder="Buscar items..." />

            <ItemForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                itemToEdit={editingItem}
            />

            <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar item?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción enviará el item a la papelera (soft delete) y no aparecerá en nuevas transacciones, pero se mantendrá en el histórico.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
