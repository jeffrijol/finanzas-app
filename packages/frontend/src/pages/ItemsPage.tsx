import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ItemForm } from '@/components/items/ItemForm';
import { ItemsList } from '@/components/items/ItemsList';
import { Item } from '@/types';
import { useToast } from '@/hooks/use-toast';

export function ItemsPage() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Item | null>(null);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: items = [], isLoading } = useQuery({
        queryKey: ['items'],
        queryFn: () => apiClient.getItems(),
    });

    const createMutation = useMutation({
        mutationFn: (data: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => apiClient.createItem(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['items'] });
            toast({ title: 'Item creado exitosamente' });
            setIsFormOpen(false);
        },
        onError: (error: Error) => {
            toast({ title: 'Error al crear item', description: error.message, variant: 'destructive' });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Item> }) =>
            apiClient.updateItem(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['items'] });
            toast({ title: 'Item actualizado exitosamente' });
            setEditingItem(null);
            setIsFormOpen(false);
        },
        onError: (error: Error) => {
            toast({ title: 'Error al actualizar item', description: error.message, variant: 'destructive' });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => apiClient.deleteItem(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['items'] });
            toast({ title: 'Item eliminado exitosamente' });
        },
        onError: (error: Error) => {
            toast({ title: 'Error al eliminar item', description: error.message, variant: 'destructive' });
        },
    });

    const handleAddNew = () => {
        setEditingItem(null);
        setIsFormOpen(true);
    };

    const handleEdit = (item: Item) => {
        setEditingItem(item);
        setIsFormOpen(true);
    };

    const handleSubmit = (data: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => {
        if (editingItem) {
            updateMutation.mutate({ id: editingItem.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleDelete = (id: string) => {
        if (confirm('¿Estás seguro de que deseas eliminar este item?')) {
            deleteMutation.mutate(id);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="border-b border-gray-200 pb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Mantenimiento de Items</h1>
                            <p className="text-gray-600 mt-2">
                                Gestiona los items para clasificar tus transacciones
                            </p>
                        </div>
                        <Button onClick={handleAddNew}>
                            <Plus className="w-4 h-4 mr-2" />
                            Nuevo Item
                        </Button>
                    </div>
                </div>

                {isFormOpen && (
                    <ItemForm
                        item={editingItem}
                        onSubmit={handleSubmit}
                        onCancel={() => {
                            setIsFormOpen(false);
                            setEditingItem(null);
                        }}
                        isLoading={createMutation.isPending || updateMutation.isPending}
                    />
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Lista de Items ({items.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ItemsList
                            items={items}
                            isLoading={isLoading}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
