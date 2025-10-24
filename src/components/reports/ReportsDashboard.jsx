// src/components/reports/ReportsDashboard.jsx
import { useMemo, useState, useEffect } from 'preact/hooks';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import type { HistoricalData, Transaction, ChartData, PeriodData } from '../../types/finanzas';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Función para cargar datos históricos desde el elemento script
const loadHistoricalDataFromScript = (): HistoricalData[] => {
  try {
    // Intentar usar la función global primero
    if (typeof window.getHistoricalData === 'function') {
      return window.getHistoricalData();
    }
    
    // Fallback: leer directamente del script
    const scriptElement = document.getElementById('historical-data');
    if (scriptElement && scriptElement.textContent) {
      const data = JSON.parse(scriptElement.textContent);
      return data.historicalData || [];
    }
  } catch (error) {
    console.error('Error cargando datos históricos:', error);
  }
  return [];
};

interface ProcessedPeriod {
  periodo: string;
  rango?: string;
  transacciones: Transaction[];
  type: 'historical' | 'current';
}

export default function ReportsDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [currentData, setCurrentData] = useState<Transaction[]>([]);
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar datos al montar el componente
  useEffect(() => {
    const loadData = () => {
      // Cargar datos históricos desde el script inyectado
      const historical = loadHistoricalDataFromScript();
      setHistoricalData(historical);

      // Cargar datos actuales del localStorage
      try {
        const stored = localStorage.getItem('finanzas-transactions');
        if (stored) {
          const data = JSON.parse(stored);
          const assigned = data.transactions ? 
            (data.transactions as Transaction[]).filter((t: Transaction) => t.itemAsignado) : [];
          setCurrentData(assigned);
        }
      } catch (error) {
        console.error('Error cargando datos actuales:', error);
      }

      setLoading(false);
    };

    loadData();
  }, []);

  // Combinar y procesar datos
  const { chartData, availablePeriods } = useMemo(() => {
    if (loading) return { 
      chartData: { itemsData: {}, filteredData: [] } as ChartData, 
      availablePeriods: [] as string[] 
    };

    const allPeriods: ProcessedPeriod[] = [
      ...historicalData.map((data: HistoricalData) => ({ 
        ...data, 
        type: 'historical' as const 
      })),
      { 
        periodo: 'current', 
        rango: 'Período Actual', 
        transacciones: currentData,
        type: 'current' as const
      }
    ].filter(period => period.transacciones && period.transacciones.length > 0);

    // Crear mapeo de períodos para el selector
    const periodData: PeriodData = {};
    allPeriods.forEach(period => {
      const key = period.periodo;
      periodData[key] = {
        transacciones: period.transacciones,
        label: period.rango || period.periodo
      };
    });

    // Filtrar datos según período seleccionado
    const filteredData = selectedPeriod === 'all' 
      ? allPeriods.flatMap(period => period.transacciones)
      : (periodData[selectedPeriod]?.transacciones || []);

    // Procesar para gráficos
    const itemsData: { [key: string]: { ingresos: number; gastos: number; count: number } } = {};
    filteredData.forEach((transaction: Transaction) => {
      const item = transaction.itemAsignado;
      if (!item) return;
      
      if (!itemsData[item]) {
        itemsData[item] = { ingresos: 0, gastos: 0, count: 0 };
      }
      
      if (transaction.importe > 0) {
        itemsData[item].ingresos += transaction.importe;
      } else {
        itemsData[item].gastos += Math.abs(transaction.importe);
      }
      itemsData[item].count++;
    });

    return {
      chartData: { itemsData, filteredData } as ChartData,
      availablePeriods: Object.keys(periodData).filter(key => 
        periodData[key].transacciones.length > 0
      )
    };
  }, [historicalData, currentData, selectedPeriod, loading]);

  // Datos para gráfico de barras
  const barData = useMemo(() => {
    const items = Object.keys(chartData.itemsData);
    return {
      labels: items,
      datasets: [
        {
          label: 'Ingresos',
          data: items.map(item => chartData.itemsData[item].ingresos),
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 1,
        },
        {
          label: 'Gastos',
          data: items.map(item => chartData.itemsData[item].gastos),
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 1,
        },
      ],
    };
  }, [chartData]);

  // Datos para gráfico de dona (ingresos)
  const doughnutIncomeData = useMemo(() => {
    const items = Object.keys(chartData.itemsData);
    const incomeData = items.map(item => chartData.itemsData[item].ingresos);
    const totalIncome = incomeData.reduce((sum, val) => sum + val, 0);
    
    if (totalIncome === 0) return null;

    return {
      labels: items,
      datasets: [{
        data: incomeData,
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderWidth: 2,
      }],
    };
  }, [chartData]);

  // Datos para gráfico de dona (gastos)
  const doughnutExpenseData = useMemo(() => {
    const items = Object.keys(chartData.itemsData);
    const expenseData = items.map(item => chartData.itemsData[item].gastos);
    const totalExpense = expenseData.reduce((sum, val) => sum + val, 0);
    
    if (totalExpense === 0) return null;

    return {
      labels: items,
      datasets: [{
        data: expenseData,
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
        ],
        borderWidth: 2,
      }],
    };
  }, [chartData]);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            Cargando datos históricos...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (chartData.filteredData.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            No hay datos de transacciones asignadas para mostrar.
            <p className="text-sm mt-2">Asigna items a las transacciones en la página principal para ver los reportes.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selector de período */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Reporte</CardTitle>
          <CardDescription>
            Selecciona el período que deseas visualizar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <span className="text-sm font-medium">Período:</span>
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm max-w-xs"
            >
              <option value="all">Todos los períodos</option>
              {availablePeriods.map(period => (
                <option key={period} value={period}>
                  {period === 'current' ? 'Período Actual' : period}
                </option>
              ))}
            </select>
            <div className="text-xs text-muted-foreground">
              {availablePeriods.length} períodos disponibles
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700">
                {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(
                  Object.values(chartData.itemsData).reduce((sum, item) => sum + item.ingresos, 0)
                )}
              </div>
              <div className="text-sm text-green-600 font-medium">Total Ingresos</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-700">
                {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(
                  Object.values(chartData.itemsData).reduce((sum, item) => sum + item.gastos, 0)
                )}
              </div>
              <div className="text-sm text-red-600 font-medium">Total Gastos</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700">
                {chartData.filteredData.length}
              </div>
              <div className="text-sm text-blue-600 font-medium">Transacciones</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Ingresos vs Gastos por Ítem</CardTitle>
            <CardDescription>Comparativa visual de ingresos y gastos organizados por categoría</CardDescription>
          </CardHeader>
          <CardContent>
            <Bar 
              data={barData}
              options={{
                responsive: true,
                plugins: { 
                  legend: { position: 'top' },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                          label += ': ';
                        }
                        if (context.parsed.y !== null) {
                          label += new Intl.NumberFormat('es-ES', { 
                            style: 'currency', 
                            currency: 'EUR' 
                          }).format(context.parsed.y);
                        }
                        return label;
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return new Intl.NumberFormat('es-ES', { 
                          style: 'currency', 
                          currency: 'EUR' 
                        }).format(value);
                      }
                    }
                  },
                },
              }}
            />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {doughnutIncomeData && (
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Ingresos</CardTitle>
                <CardDescription>Porcentaje de ingresos por categoría</CardDescription>
              </CardHeader>
              <CardContent>
                <Doughnut 
                  data={doughnutIncomeData}
                  options={{
                    responsive: true,
                    plugins: { 
                      legend: { position: 'bottom' },
                      tooltip: {
                        callbacks: {
                          label: (context) => {
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${context.label}: ${new Intl.NumberFormat('es-ES', { 
                              style: 'currency', 
                              currency: 'EUR' 
                            }).format(value)} (${percentage}%)`;
                          }
                        }
                      }
                    }
                  }}
                />
              </CardContent>
            </Card>
          )}

          {doughnutExpenseData && (
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Gastos</CardTitle>
                <CardDescription>Porcentaje de gastos por categoría</CardDescription>
              </CardHeader>
              <CardContent>
                <Doughnut 
                  data={doughnutExpenseData}
                  options={{
                    responsive: true,
                    plugins: { 
                      legend: { position: 'bottom' },
                      tooltip: {
                        callbacks: {
                          label: (context) => {
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${context.label}: ${new Intl.NumberFormat('es-ES', { 
                              style: 'currency', 
                              currency: 'EUR' 
                            }).format(value)} (${percentage}%)`;
                          }
                        }
                      }
                    }
                  }}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}