import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { apiClient } from '@/lib/api-client';
import { TransactionCategory } from '@/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

const categorySchema = z.object({
    name: z.string().min(1, 'El nombre es requerido'),
    type: z.enum(['INCOME', 'EXPENSE'], {
        required_error: 'El tipo es requerido',
    }),
    itemTypeId: z.string().min(1, 'El tipo de item asociado es requerido'),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    categoryToEdit?: TransactionCategory;
}

export function CategoryForm({ open, onOpenChange, categoryToEdit }: CategoryFormProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: itemTypes = [] } = useQuery({
        queryKey: ['itemTypes'],
        queryFn: () => apiClient.getItemTypes(),
    });

    const form = useForm<CategoryFormValues>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: '',
            type: 'EXPENSE',
            itemTypeId: '',
        },
    });

    useEffect(() => {
        if (categoryToEdit) {
            form.reset({
                name: categoryToEdit.name,
                type: categoryToEdit.type,
                itemTypeId: categoryToEdit.itemTypeId,
            });
        } else {
            form.reset({
                name: '',
                type: 'EXPENSE',
                itemTypeId: '',
            });
        }
    }, [categoryToEdit, form]);

    const mutation = useMutation({
        mutationFn: (values: CategoryFormValues) => {
            if (categoryToEdit) {
                return apiClient.updateCategory(categoryToEdit.id, values);
            }
            return apiClient.createCategory(values);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            // Also invalidate itemTypes since they contain nested categories
            queryClient.invalidateQueries({ queryKey: ['itemTypes'] });

            toast({
                title: categoryToEdit ? 'Categoría actualizada' : 'Categoría creada',
                description: `La categoría se ha ${categoryToEdit ? 'actualizado' : 'creado'} correctamente.`,
            });
            onOpenChange(false);
        },
        onError: () => {
            toast({
                title: 'Error',
                description: 'Hubo un error al guardar la categoría.',
                variant: 'destructive',
            });
        },
    });

    const onSubmit = (values: CategoryFormValues) => {
        mutation.mutate(values);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{categoryToEdit ? 'Editar Categoría' : 'Nueva Categoría'}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej. Alquiler, Dividendos..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo de Transacción</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar..." />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="INCOME">Ingreso</SelectItem>
                                            <SelectItem value="EXPENSE">Gasto</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="itemTypeId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo de Item Asociado</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar Tipo de Item..." />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {itemTypes.map((type) => (
                                                <SelectItem key={type.id} value={type.id}>
                                                    {type.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={mutation.isPending}>
                                {mutation.isPending ? 'Guardando...' : 'Guardar'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
