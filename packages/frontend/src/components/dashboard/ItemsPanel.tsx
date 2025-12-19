import { Item } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ItemsPanelProps {
    items: Item[];
    stats?: {
        itemId: string;
        cantidad: number;
        total: number;
    }[];
    sinAsignar?: {
        cantidad: number;
        total: number;
    };
}

export function ItemsPanel({ items, stats = [], sinAsignar }: ItemsPanelProps) {
    const getItemStats = (itemId: string) => {
        return stats.find((s) => s.itemId === itemId);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
        }).format(value);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {items
                    .filter((item) => item.activo)
                    .map((item) => {
                        const itemStats = getItemStats(item.id);
                        return (
                            <div
                                key={item.id}
                                className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-3 h-3 rounded-full shrink-0"
                                        style={{ backgroundColor: item.color || '#64748b' }}
                                    />
                                    <div>
                                        <div className="font-medium flex items-center gap-2">
                                            {item.icono && <span>{item.icono}</span>}
                                            {item.nombre}
                                        </div>
                                        {item.descripcion && (
                                            <div className="text-xs text-muted-foreground">
                                                {item.descripcion}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {itemStats && (
                                    <div className="text-right">
                                        <Badge variant="secondary" className="mb-1">
                                            {itemStats.cantidad}
                                        </Badge>
                                        <div className="text-xs text-muted-foreground">
                                            {formatCurrency(itemStats.total)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                {sinAsignar && sinAsignar.cantidad > 0 && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-slate-500 shrink-0" />
                            <div className="font-medium">Sin asignar</div>
                        </div>
                        <div className="text-right">
                            <Badge variant="outline" className="mb-1">
                                {sinAsignar.cantidad}
                            </Badge>
                            <div className="text-xs text-muted-foreground">
                                {formatCurrency(sinAsignar.total)}
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
