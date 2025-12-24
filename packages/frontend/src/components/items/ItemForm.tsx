
import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2 } from "lucide-react"
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { Item } from "@/types"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const itemSchema = z.object({
    nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    descripcion: z.string().optional(),
    itemTypeId: z.string().min(1, "El tipo de item es requerido"),
    color: z.string().optional(),
    icono: z.string().optional(),
    activo: z.boolean().default(true),
})

type ItemFormValues = z.infer<typeof itemSchema>

interface ItemFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    itemToEdit?: Item
}

export function ItemForm({ open, onOpenChange, itemToEdit }: ItemFormProps) {
    const { toast } = useToast()
    const queryClient = useQueryClient()

    const { data: itemTypes = [] } = useQuery({
        queryKey: ['itemTypes'],
        queryFn: () => apiClient.getItemTypes(),
    });

    const form = useForm<ItemFormValues>({
        resolver: zodResolver(itemSchema),
        defaultValues: {
            nombre: "",
            descripcion: "",
            itemTypeId: "",
            color: "#3B82F6",
            icono: "💰",
            activo: true,
        },
    })

    React.useEffect(() => {
        if (itemToEdit) {
            form.reset({
                nombre: itemToEdit.nombre,
                descripcion: itemToEdit.descripcion || "",
                itemTypeId: itemToEdit.itemTypeId,
                color: itemToEdit.color || "#3B82F6",
                icono: itemToEdit.icono || "💰",
                activo: itemToEdit.activo,
            })
        } else {
            form.reset({
                nombre: "",
                descripcion: "",
                itemTypeId: "",
                color: "#3B82F6",
                icono: "💰",
                activo: true,
            })
        }
    }, [itemToEdit, form])

    const mutation = useMutation({
        mutationFn: (values: ItemFormValues) => {
            if (itemToEdit) {
                return apiClient.updateItem(itemToEdit.id, values);
            }
            return apiClient.createItem(values);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['items'] });
            toast({
                title: itemToEdit ? 'Item actualizado' : 'Item creado',
                description: `El item se ha ${itemToEdit ? 'actualizado' : 'creado'} correctamente.`,
            })
            onOpenChange(false)
            form.reset()
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Hubo un error al guardar el item.",
                variant: "destructive",
            })
        },
    })


    function onSubmit(data: ItemFormValues) {
        mutation.mutate(data)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle>{itemToEdit ? "Editar Item" : "Nuevo Item"}</DialogTitle>
                    <DialogDescription>
                        {itemToEdit ? "Edita los detalles del item existente." : "Crea un nuevo item para clasificar tus movimientos."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="nombre"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej. Nómina" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="itemTypeId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Tipo..." />
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
                            <FormField
                                control={form.control}
                                name="icono"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Icono</FormLabel>
                                        <FormControl>
                                            <Input placeholder="💰" {...field} maxLength={2} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="descripcion"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descripción</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Descripción opcional..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="color"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Color</FormLabel>
                                    <FormControl>
                                        <Input type="color" className="h-10 w-full" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={mutation.isPending}>
                                {mutation.isPending && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                {itemToEdit ? "Actualizar" : "Crear"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
