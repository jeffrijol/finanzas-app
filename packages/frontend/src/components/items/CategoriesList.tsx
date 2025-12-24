import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, Plus, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TransactionCategory } from '@/types';
import { CategoryForm } from './CategoryForm';
import { Badge } from '@/components/ui/badge';
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

export function CategoriesList() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<TransactionCategory | undefined>(undefined);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const { data: categories = [], isLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: () => apiClient.getCategories(),
    });

    const { data: itemTypes = [] } = useQuery({
        queryKey: ['itemTypes'],
        queryFn: () => apiClient.getItemTypes(),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => apiClient.deleteCategory(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            toast({
                title: 'Categoría eliminada',
                description: 'La categoría ha sido eliminada correctamente.',
            });
            setDeletingId(null);
        },
        onError: () => {
            toast({
                title: 'Error',
                description: 'No se pudo eliminar la categoría.',
                variant: 'destructive',
            });
            setDeletingId(null);
        },
    });

    const handleCreate = () => {
        setEditingCategory(undefined);
        setIsFormOpen(true);
    };

    const handleEdit = (category: TransactionCategory) => {
        setEditingCategory(category);
        setIsFormOpen(true);
    };

    const handleDelete = () => {
        if (deletingId) {
            deleteMutation.mutate(deletingId);
        }
    };

    const getItemTypeName = (id: string) => {
        return itemTypes.find(t => t.id === id)?.name || id;
    };

    if (isLoading) return <div>Cargando categorías...</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-lg font-semibold text-slate-800">Categorías de Transacción</h2>
                    <p className="text-sm text-slate-500">Administra las categorías internas para ingresos y gastos.</p>
                </div>
                <Button onClick={handleCreate} className="bg-slate-900 text-white hover:bg-slate-800">
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Categoría
                </Button>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50/50">
                            <TableHead>Nombre</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Item Asociado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.map((category) => (
                            <TableRow key={category.id} className="hover:bg-slate-50_">
                                <TableCell className="font-medium text-slate-700">{category.name}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {category.type === 'INCOME' ? (
                                            <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">
                                                <ArrowUpCircle className="w-3 h-3 mr-1" />
                                                Ingreso
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-rose-600 border-rose-200 bg-rose-50">
                                                <ArrowDownCircle className="w-3 h-3 mr-1" />
                                                Gasto
                                            </Badge>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-slate-600 text-sm bg-slate-100 px-2 py-1 rounded">
                                        {getItemTypeName(category.itemTypeId)}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEdit(category)}
                                            className="h-8 w-8 text-slate-500 hover:text-indigo-600"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setDeletingId(category.id)}
                                            className="h-8 w-8 text-slate-500 hover:text-red-600"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {categories.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                                    No hay categorías registradas. Crea una nueva para comenzar.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <CategoryForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                categoryToEdit={editingCategory}
            />

            <AlertDialog open={!!deletingId} onOpenChange={(open: boolean) => !open && setDeletingId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará la categoría permantentemente.
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
