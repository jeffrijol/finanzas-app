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

            // Mapear datos de barras con colores
            const barChartDataWithColors = barChartData.map((d: any) => ({
                label: d.name,
                value: d.ingresos, // Simplificación: solo ingresos por ahora en barras simples, o podríamos hacer stacked
                color: '#3b82f6'
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
                    // Pasamos datos estructurados para componentes nativos
                    barData: netBalanceData, // Usamos balance neto por mes/tipo
                    expensesPieData: expensesPieDataWithColors,
                    incomePieData: incomePieDataWithColors
                },
                topExpenses: statsData.topExpenses || [],
                sampleTransactions: transactionsData.items || []
            };

            // 5b. CAPTURA DE GRÁFICOS (SNAPSHOTS)
            // Intentamos capturar los gráficos del DOM actual
            let chartImages: { monthlyTrend?: string, distributionGastos?: string, distributionIngresos?: string } = {};

            try {
                // Import dinámico para no cargar html2canvas si no se usa
                const { captureChart } = await import('@/lib/pdf-generator/snapshot-utils');

                // IDs de los gráficos en el DOM (Deben coincidir con los componentes)
                const trendId = 'dashboard-chart-annual';
                // Detectar cuál gráfico circular está presente (ingresos o gastos)
                // Priorizamos gastos si hay ambos, o capturamos ambos y componemos (por ahora simple)
                const gastosId = 'dashboard-chart-pie-gastos';
                const ingresosId = 'dashboard-chart-pie-ingresos';

                // Captura secuencial para no sobrecargar el navegador
                // 1. Tendencia Mensual
                toast({ title: 'Generando PDF', description: 'Capturando gráfico de tendencia...' });
                const trendImg = await captureChart(trendId);

                // 2. Distribución Gastos
                let distGastosImg = undefined;
                if (document.getElementById(gastosId)) {
                    toast({ title: 'Generando PDF', description: 'Capturando gastos...' });
                    const res = await captureChart(gastosId);
                    distGastosImg = res || undefined;
                }

                // 3. Distribución Ingresos
                let distIngresosImg = undefined;
                if (document.getElementById(ingresosId)) {
                    toast({ title: 'Generando PDF', description: 'Capturando ingresos...' });
                    const res = await captureChart(ingresosId);
                    distIngresosImg = res || undefined;
                }

                // @ts-ignore
                chartImages = {
                    monthlyTrend: trendImg || undefined,
                    distributionGastos: distGastosImg,
                    distributionIngresos: distIngresosImg
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
