import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PeriodSelector } from '@/components/dashboard/PeriodSelector'; // Reutilizamos store global
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePeriodStore } from '@/stores/period-store';
import { AnnualStatsChart } from '@/components/charts/AnnualStatsChart';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

export function ReportsPage() {
    const { year, quarter } = usePeriodStore();
    const [selectedTipoItem, setSelectedTipoItem] = useState<string>('ALL');
    const [selectedItemId, setSelectedItemId] = useState<string>('ALL');

    // Fetch items
    const { data: items = [] } = useQuery({
        queryKey: ['items'],
        queryFn: () => apiClient.getItems(),
    });

    // Fetch Stats
    // Nota: El backend getStats ya agrupa, pero podemos filtrar más si enviamos itemAsignadoId/tipoItem como parámetros de query
    // En la versión actual del backend service, GET /stats acepta filtros básicos.
    // Necesitaríamos pasarle tipoItem para filtrar el query subyacente. 
    // Como getStats global devuelve 'transaccionesPorItem', podemos filtrar eso en el frontend.
    const { data: stats } = useQuery({
        queryKey: ['stats-reports', year, quarter],
        queryFn: () => apiClient.getStats({
            year,
            quarter: quarter === 'all' ? undefined : Number(quarter)
        }),
    });

    // Filtrar/Procesar datos localmente para los gráficos según selección de Tipo/Item

    // Gráfico de Items (Top gastos/ingresos)
    const itemsData = stats?.transaccionesPorItem
        .filter(t => {
            if (selectedItemId !== 'ALL') return t.itemId === selectedItemId;
            if (selectedTipoItem !== 'ALL') {
                const item = items.find(i => i.id === t.itemId);
                return item?.itemType?.name === selectedTipoItem;
            }
            return true;
        })
        .map(t => ({
            name: t.itemNombre,
            value: Math.abs(t.total), // Usamos valor absoluto para ver magnitud
            type: t.total > 0 ? 'Ingreso' : 'Gasto'
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10) || [];

    const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'];

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

    return (
        <DashboardLayout>
            <div className="space-y-8 animate-in fade-in duration-500">
                {/* Header */}
                <div className="border-b border-gray-100 pb-6">
                    <h1 className="text-3xl font-bold text-slate-900">Reportes Financieros</h1>
                    <p className="text-slate-500 mt-2">
                        Análisis detallado de rendimiento por categorías y activos.
                    </p>
                </div>

                {/* Filters Section */}
                <Card className="border-slate-200 shadow-sm bg-slate-50/50">
                    <CardContent className="pt-6">
                        <div className="flex flex-col xl:flex-row gap-6 items-start xl:items-center justify-between">
                            {/* Period Filter (Global Store) */}
                            <div className="space-y-1">
                                <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Período</span>
                                <div className="bg-white rounded-md border border-slate-200 p-1 inline-block">
                                    <PeriodSelector />
                                </div>
                            </div>

                            <div className="h-8 w-px bg-slate-200 hidden xl:block" />

                            {/* Item Type & Specific Item Filters */}
                            <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
                                <div className="space-y-1 w-full sm:w-[200px]">
                                    <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Tipo Activo</span>
                                    <Select value={selectedTipoItem} onValueChange={(val) => {
                                        setSelectedTipoItem(val);
                                        setSelectedItemId('ALL');
                                    }}>
                                        <SelectTrigger className="bg-white border-slate-200">
                                            <SelectValue placeholder="Tipo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ALL">Todos</SelectItem>
                                            <SelectItem value="INMUEBLE">Inmueble</SelectItem>
                                            <SelectItem value="INVERSION">Inversión</SelectItem>
                                            <SelectItem value="AVANZE_SOCIEDAD">Avanze Sociedad</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1 w-full sm:w-[250px]">
                                    <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Item Específico</span>
                                    <Select
                                        value={selectedItemId}
                                        onValueChange={setSelectedItemId}
                                        disabled={selectedTipoItem === 'ALL' && items.length > 20} // Opción de UX
                                    >
                                        <SelectTrigger className="bg-white border-slate-200">
                                            <SelectValue placeholder="Seleccionar Item" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ALL">Todos los items</SelectItem>
                                            {items
                                                .filter(i => selectedTipoItem === 'ALL' || i.itemType?.name === selectedTipoItem)
                                                .map(item => (
                                                    <SelectItem key={item.id} value={item.id}>
                                                        {item.nombre}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* KPI Cards Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500 uppercase">Ingresos Totales</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600">
                                {formatCurrency(stats?.totalIngresos || 0)}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500 uppercase">Gastos Totales</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">
                                {formatCurrency(stats?.totalGastos || 0)}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500 uppercase">Balance Neto</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${stats?.balance && stats.balance >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
                                {formatCurrency(stats?.balance || 0)}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Gráfico Anual (Siempre visible) */}
                    <div className="lg:col-span-2">
                        {stats?.porTipoItem ? (
                            <AnnualStatsChart data={stats.porTipoItem} year={year} />
                        ) : (
                            <Card className="h-[400px] flex items-center justify-center border-slate-200 shadow-sm">
                                <p className="text-slate-400">Cargando datos del gráfico...</p>
                            </Card>
                        )}
                    </div>

                    {/* Gráfico de Distribución (Top Items) */}
                    <Card className="col-span-1 lg:col-span-2 border-slate-200 shadow-sm">
                        <CardHeader>
                            <CardTitle>Distribución por Item (Top 10)</CardTitle>
                            <CardDescription>
                                Items con mayor volumen de movimiento en el período seleccionado.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[400px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={itemsData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }: { name: string; percent?: number }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                            outerRadius={150}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {itemsData.map((_entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip formatter={(val: any) => formatCurrency(Number(val))} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout >
    );
}
