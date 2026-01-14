import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useDashboardFiltersStore } from '@/stores/dashboard-filters-store';
import { usePeriodStore } from '@/stores/period-store';
import { useToast } from '@/hooks/use-toast';
import { buildDashboardPDF } from '@/lib/pdf-generator/pdf-builder';
import { saveAs } from 'file-saver';
import { apiClient } from '@/lib/api-client';

export const usePDFExport = () => {
    const [isGenerating, setIsGenerating] = useState(false);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Obtener filtros de los stores globales
    const { year, quarter } = usePeriodStore();
    const {
        searchQuery,
        selectedTipoItem,
        selectedItemId,
        selectedCategory
    } = useDashboardFiltersStore();

    const generateDashboardPDF = useCallback(async () => {
        setIsGenerating(true);

        try {
            // 1. Obtener datos actuales
            // NOTA: Replicamos la lógica de llamadas de DashboardPage para asegurar consistencia
            // Primero intentamos sacar de cache, si no, hacemos fetch

            // Stats
            let statsData = queryClient.getQueryData<any>(['stats', year, quarter, selectedTipoItem, selectedItemId]);
            if (!statsData) {
                // Si no está en cache (raro si se está viendo), forzamos fetch
                statsData = await apiClient.getStats({
                    year: Number(year),
                    quarter: quarter === 'all' ? undefined : Number(quarter),
                    tipoItem: selectedTipoItem || undefined,
                    itemAsignadoId: selectedItemId || undefined,
                });
            }

            // Transacciones
            // Usamos los mismos params que en la UI
            const transactionsParams = {
                page: 1,
                limit: 200, // Traer suficientes para una buena muestra en PDF
                search: searchQuery || undefined,
                tipoItem: selectedTipoItem || undefined,
                itemAsignadoId: selectedItemId || undefined,
                categoryId: selectedCategory || undefined,
                year: Number(year),
                quarter: quarter === 'all' ? undefined : Number(quarter),
            };

            // Fetch fresco de transacciones para el reporte (limit 200)
            const transactionsData = await apiClient.getTransactions(transactionsParams);

            if (!statsData) {
                throw new Error('No hay datos estadísticos disponibles para generar el reporte');
            }

            // 2. Preparar datos para los gráficos
            // Adaptamos la estructura de `statsData` a lo que espera el renderer

            // Gráfico de Barras: Tendencia o Comparativa por Tipo
            // Dependiendo del nivel de filtrado, statsData.porTipoItem o similar.
            // Para el reporte general/anual usamos porTipoItem como en AnnualStatsChart
            const barChartData = statsData.porTipoItem?.map((item: any) => ({
                name: item.tipo, // O mapear nombres 'INMUEBLE' -> 'Inmueble' si es necesario
                ingresos: item.ingresos,
                gastos: item.gastos
            })) || [];

            // Gráficos de Torta: Distribución por Categoría
            // statsData.porCategoryRel contiene { categoria, ingresos, gastos }
            const expensesPieData = statsData.porCategoryRel
                ?.filter((c: any) => c.gastos > 0)
                .map((c: any) => ({
                    name: c.categoria,
                    value: c.gastos
                }))
                .sort((a: any, b: any) => b.value - a.value) // Ordenar mayor a menor
                .slice(0, 8) || []; // Top 8

            const incomePieData = statsData.porCategoryRel
                ?.filter((c: any) => c.ingresos > 0)
                .map((c: any) => ({
                    name: c.categoria,
                    value: c.ingresos
                }))
                .sort((a: any, b: any) => b.value - a.value)
                .slice(0, 8) || [];

            // 3. Preparar datos para los gráficos (Datos crudos para componentes nativos)
            // Ya no renderizamos a SVG/PNG aquí. Pasamos los datos limpios.

            // Colores para gráficos de torta
            const expenseColors = ['#ef4444', '#f87171', '#fca5a5', '#fecaca', '#fee2e2', '#b91c1c'];
            const incomeColors = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5', '#047857'];

            // Mapear datos de torta con colores
            const expensesPieDataWithColors = expensesPieData.map((d: any, i: number) => ({
                label: d.name,
                value: d.value,
                color: expenseColors[i % expenseColors.length]
            }));

            const incomePieDataWithColors = incomePieData.map((d: any, i: number) => ({
                label: d.name,
                value: d.value,
                color: incomeColors[i % incomeColors.length]
            }));


            // Nota: El componente de barras actual es simple. Si queremos doble barra (Ingreso/Gasto) habría que adaptar PdfBarChart.
            // Por ahora, para mantener paridad visual simple, pasamos un array combinado o adaptamos el componente.
            // Vamos a adaptar PdfBarChart para recibir ingresos/gastos si es necesario, pero el componente creado antes era simple.
            // Revisando PdfBarChart creado: recibe { label, value, color }.
            // Para mostrar Ingresos vs Gastos lado a lado, necesitaríamos un componente más complejo.
            // Por ahora, mostraremos Balance Neto (Ingresos - Gastos) o solo Ingresos para probar.
            // MEJOR: Modificamos PdfBarChart para ser más flexible o pasamos datos de "Balance" que es útil.
            const netBalanceData = barChartData.map((d: any) => ({
                label: d.name,
                value: d.ingresos - d.gastos,
                color: (d.ingresos - d.gastos) >= 0 ? '#10b981' : '#ef4444'
            }));


            // 4. Calcular totales para resumen
            const totalIncome = barChartData.reduce((sum: number, item: any) => sum + (item.ingresos || 0), 0);
            const totalExpenses = barChartData.reduce((sum: number, item: any) => sum + (item.gastos || 0), 0);

            // Fetch quarterly report
            const quarterlyReport = await apiClient.getQuarterlyReport(Number(year));

            // ... (existing processing code)

            // 5. Construir el objeto de datos completo para el PDF
            const reportData = {
                metadata: {
                    title: `Reporte Financiero ${year}`,
                    generatedAt: new Date().toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    }),
                    filters: {
                        periodLabel: quarter === 'all'
                            ? `Año completo ${year}`
                            : `Trimestre ${quarter} de ${year}`,
                        searchQuery,
                        selectedTipoItem,
                        selectedItemId
                    }
                },
                summaries: {
                    totalTransactions: transactionsData.total || 0,
                    totalIncome,
                    totalExpenses,
                    netBalance: totalIncome - totalExpenses
                },
                charts: {
                    barData: netBalanceData,
                    expensesPieData: expensesPieDataWithColors,
                    incomePieData: incomePieDataWithColors
                },
                topExpenses: statsData.topExpenses || [],
                sampleTransactions: transactionsData.items || [],
                quarterlyReport // Add quarterly report
            };

            // 5b. CAPTURA DE GRÁFICOS (SNAPSHOTS)
            let chartImages: { monthlyTrend?: string, distributionGastos?: string, distributionIngresos?: string, stackedTrend?: string } = {};

            try {
                const { captureChart } = await import('@/lib/pdf-generator/snapshot-utils');

                const trendId = 'dashboard-chart-annual';
                const gastosId = 'dashboard-chart-pie-gastos';
                const ingresosId = 'dashboard-chart-pie-ingresos';
                const stackedId = 'dashboard-chart-stacked'; // Add Stacked ID

                toast({ title: 'Generando PDF', description: 'Capturando gráficos...' });

                // Helper for optional capture
                const safeCapture = async (id: string) => {
                    if (document.getElementById(id)) {
                        return await captureChart(id);
                    }
                    return undefined;
                };

                const [trendImg, distGastosImg, distIngresosImg, stackedImg] = await Promise.all([
                    safeCapture(trendId),
                    safeCapture(gastosId),
                    safeCapture(ingresosId),
                    safeCapture(stackedId)
                ]);

                // @ts-ignore
                chartImages = {
                    monthlyTrend: trendImg,
                    distributionGastos: distGastosImg,
                    distributionIngresos: distIngresosImg,
                    stackedTrend: stackedImg
                };

            } catch (captureError) {
                console.error('Error capturando gráficos:', captureError);
                toast({
                    title: 'Advertencia',
                    description: 'No se pudieron incluir los gráficos visuales en el reporte.',
                    variant: 'destructive'
                });
            }

            // 6. Generar Blob
            toast({ title: 'Generando PDF', description: 'Compilando documento final...' });
            const pdfBlob = await buildDashboardPDF(reportData, chartImages);

            // 7. Descargar
            const filename = `reporte-financiero-${year}-${quarter === 'all' ? 'anual' : `q${quarter}`}-${Date.now()}.pdf`;
            saveAs(pdfBlob, filename);

            toast({
                title: '✅ Reporte PDF generado',
                description: `Archivo descargado: ${filename}`,
                duration: 5000,
            });

            return true;

        } catch (error) {
            console.error('Error generando PDF:', error);
            toast({
                title: '❌ Error al generar reporte',
                description: error instanceof Error ? error.message : 'Ocurrió un error inesperado',
                variant: 'destructive',
                duration: 5000,
            });
            return false;
        } finally {
            setIsGenerating(false);
        }
    }, [queryClient, year, quarter, searchQuery, selectedTipoItem, selectedItemId, selectedCategory, toast]);

    return {
        generateDashboardPDF,
        isGenerating
    };
};
