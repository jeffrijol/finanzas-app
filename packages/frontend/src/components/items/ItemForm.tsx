import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Item } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

interface ItemFormProps {
    item: Item | null;
    onSubmit: (data: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => void;
    onCancel: () => void;
    isLoading: boolean;
}

export function ItemForm({ item, onSubmit, onCancel, isLoading }: ItemFormProps) {
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        itemTypeId: '',
        color: '#3B82F6',
        icono: '💰',
        activo: true,
    });

    const { data: itemTypes = [] } = useQuery({
        queryKey: ['itemTypes'],
        queryFn: () => apiClient.getItemTypes(),
    });

    useEffect(() => {
        if (item) {
            setFormData({
                nombre: item.nombre,
                descripcion: item.descripcion || '',
                itemTypeId: item.itemTypeId,
                color: item.color || '#3B82F6',
                icono: item.icono || '💰',
                activo: item.activo,
            });
        }
    }, [item]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader>
                <CardTitle>{item ? 'Editar Item' : 'Nuevo Item'}</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="nombre">Nombre *</Label>
                            <Input
                                id="nombre"
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="tipo">Tipo *</Label>
                            <Select
                                value={formData.itemTypeId}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, itemTypeId: value })
                                }
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar tipo..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {itemTypes.map((type) => (
                                        <SelectItem key={type.id} value={type.id}>
                                            {type.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="icono">Icono</Label>
                            <Input
                                id="icono"
                                value={formData.icono}
                                onChange={(e) => setFormData({ ...formData, icono: e.target.value })}
                                maxLength={2}
                            />
                        </div>

                        <div>
                            <Label htmlFor="color">Color</Label>
                            <Input
                                id="color"
                                type="color"
                                value={formData.color}
                                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <Label htmlFor="descripcion">Descripción</Label>
                            <Input
                                id="descripcion"
                                value={formData.descripcion}
                                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 justify-end">
                        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Guardando...' : item ? 'Actualizar' : 'Crear'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
