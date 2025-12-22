import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export function ItemsStatsPanel() {
    const currentYear = new Date().getFullYear();

    const { data: stats } = useQuery({
        queryKey: ['stats'],
        queryFn: () => apiClient.getTransactionStats(),
    });

    if (!stats || !stats.transaccionesPorItem) {
        return null;
    }

    const itemsWithTransactions = stats.transaccionesPorItem.filter(
        (item: any) => item.totalTransacciones > 0
    );

    return (
        <Card className="border-gray-200 shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-800">
                    Estadísticas {currentYear}
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                    Resumen de gastos e ingresos por item
                </p>
            </CardHeader>
            <CardContent>
                {itemsWithTransactions.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                        No hay datos para mostrar
                    </p>
                ) : (
                    <div className="space-y-4">
                        {itemsWithTransactions.map((item: any) => {
                            const totalAmount = item.total || 0;
                            const isPositive = totalAmount >= 0;

                            return (
                                <div
                                    key={item.itemId}
                                    className="pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            {item.color && (
                                                <div
                                                    className="w-3 h-3 rounded-full flex-shrink-0 mt-0.5"
                                                    style={{ backgroundColor: item.color }}
                                                />
                                            )}
                                            <h4 className="font-medium text-gray-900">{item.nombreItem}</h4>
                                        </div>
                                        <span
                                            className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'
                                                }`}
                                        >
                                            {formatCurrency(totalAmount)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm text-gray-600">
                                        <span>{item.totalTransacciones} transacciones</span>
                                        <span className="text-xs text-gray-400">
                                            {isPositive ? 'Ingresos' : 'Gastos'}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}


                        {stats.sinAsignar && stats.sinAsignar.cantidad > 0 && (
                            <div className="pt-4 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500 italic">Sin asignar</span>
                                    <span className="text-sm font-medium text-orange-500">
                                        {stats.sinAsignar.cantidad} transacciones
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
