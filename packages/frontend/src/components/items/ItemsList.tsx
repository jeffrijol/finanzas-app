import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2 } from 'lucide-react';
import { Item } from '@/types';

interface ItemsListProps {
    items: Item[];
    isLoading: boolean;
    onEdit: (item: Item) => void;
    onDelete: (id: string) => void;
}

export function ItemsList({ items, isLoading, onEdit, onDelete }: ItemsListProps) {
    if (isLoading) {
        return <div className="text-center py-8 text-gray-500">Cargando items...</div>;
    }

    if (items.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <p className="text-lg">No hay items creados</p>
                <p className="text-sm mt-2">Haz clic en "Nuevo Item" para empezar</p>
            </div>
        );
    }



    return (
        <div className="rounded-lg border border-gray-200 overflow-hidden">
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
                    {items.map((item) => (
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
                                        onClick={() => onEdit(item)}
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onDelete(item.id)}
                                    >
                                        <Trash2 className="w-4 h-4 text-red-600" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
