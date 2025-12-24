import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { Item } from '@/types';
import { ItemForm } from './ItemForm';
import { useToast } from '@/hooks/use-toast';
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

export function ItemsList() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Item | undefined>(undefined);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const { data: items = [], isLoading } = useQuery({
        queryKey: ['items'],
        queryFn: () => apiClient.getItems(),
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

    if (isLoading) {
        return <div className="text-center py-8 text-gray-500">Cargando items...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-lg font-semibold text-slate-800">Items Activos</h2>
                    <p className="text-sm text-slate-500">Gestiona tus items generadores de ingresos/gastos.</p>
                </div>
                <Button onClick={handleCreate} className="bg-slate-900 text-white hover:bg-slate-800">
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Item
                </Button>
            </div>

            <div className="rounded-lg border border-gray-200 overflow-hidden bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50 hover:bg-gray-50">
                            <TableHead className="w-12"></TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead className="w-32">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                                    <p className="text-lg">No hay items creados</p>
                                    <p className="text-sm mt-2">Haz clic en "Nuevo Item" para empezar</p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            items.map((item) => (
                                <TableRow key={item.id} className="hover:bg-gray-50/50">
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {item.icono && <span className="text-2xl">{item.icono}</span>}
                                            {item.color && (
                                                <div
                                                    className="w-4 h-4 rounded-full border border-gray-300"
                                                    style={{ backgroundColor: item.color }}
                                                />
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">{item.nombre}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                                            {item.itemType?.name || 'Desconocido'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={item.activo ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-50 text-gray-500 border-gray-200"}
                                        >
                                            {item.activo ? 'Activo' : 'Inactivo'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-gray-600 max-w-xs truncate">
                                        {item.descripcion || '-'}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEdit(item)}
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setDeletingId(item.id)}
                                            >
                                                <Trash2 className="w-4 h-4 text-red-600" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )))}
                    </TableBody>
                </Table>
            </div>

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
                            Esta acción no se puede deshacer. Se eliminará el item y sus referencias históricas podrían verse afectadas.
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
