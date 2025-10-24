// src/components/FinancialDashboard.jsx
import { useMemo } from 'preact/hooks';
import { useTransactions } from '../context/TransactionsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';

// Importaciones de Chart.js con lazy loading
import { lazy, Suspense } from 'preact/compat';

// Lazy loading de componentes de gráficos
const BarChartIncomeExpense = lazy(() => import('./charts/BarChartIncomeExpense'));
const DoughnutChartIncomeDistribution = lazy(() => import('./charts/DoughnutChartIncomeDistribution'));
const DoughnutChartExpenseDistribution = lazy(() => import('./charts/DoughnutChartExpenseDistribution'));

export default function FinancialDashboard() {
  const { transactions, getChartData } = useTransactions();

  const chartData = useMemo(() => {
    return getChartData();
  }, [getChartData]);

  // No mostrar si no hay transacciones asignadas
  if (!chartData || Object.keys(chartData.itemsData).length === 0) {
    return null;
  }

  const { totalIngresos, totalGastos, totalTransacciones } = chartData;

  return (
    <div className="space-y-6">
      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(totalIngresos)}
              </div>
              <div className="text-sm text-muted-foreground">Total Ingresos</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(totalGastos)}
              </div>
              <div className="text-sm text-muted-foreground">Total Gastos</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {totalTransacciones}
              </div>
              <div className="text-sm text-muted-foreground">Transacciones</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <Suspense fallback={<div className="text-center py-8">Cargando gráficos...</div>}>
        <BarChartIncomeExpense chartData={chartData} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DoughnutChartIncomeDistribution chartData={chartData} />
          <DoughnutChartExpenseDistribution chartData={chartData} />
        </div>
      </Suspense>
    </div>
  );
}