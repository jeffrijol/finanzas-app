// src/components/FinancialDashboard.jsx
import { useTransactions } from '../context/TransactionsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import PeriodoSelector from './PeriodoSelector';

// Importaciones de Chart.js con lazy loading
import { lazy, Suspense } from 'preact/compat';

// Lazy loading de componentes de gráficos
const BarChartIncomeExpense = lazy(() => import('./charts/BarChartIncomeExpense'));
const DoughnutChartIncomeDistribution = lazy(() => import('./charts/DoughnutChartIncomeDistribution'));
const DoughnutChartExpenseDistribution = lazy(() => import('./charts/DoughnutChartExpenseDistribution'));
const LineChartTrend = lazy(() => import('./charts/LineChartTrend'));

// Componente de carga mejorado
const ChartLoader = () => (
  <div className="animate-pulse">
    <div className="h-64 bg-gray-200 rounded-lg"></div>
  </div>
);

export default function FinancialDashboard() {
  const { transactions, chartData } = useTransactions();

  // No mostrar si no hay transacciones asignadas
  if (!chartData || Object.keys(chartData.itemsData).length === 0) {
    return null;
  }

  const { totalIngresos, totalGastos, totalTransacciones } = chartData;

  return (
    <div className="space-y-6">
      {/* Header con estadísticas y selector */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 w-full">
          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-700">
                  {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(totalIngresos)}
                </div>
                <div className="text-sm text-green-600 font-medium">Total Ingresos</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-700">
                  {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(totalGastos)}
                </div>
                <div className="text-sm text-red-600 font-medium">Total Gastos</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-700">
                  {totalTransacciones}
                </div>
                <div className="text-sm text-blue-600 font-medium">Transacciones Asignadas</div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <PeriodoSelector />
      </div>

      {/* Gráficos con mejor manejo de carga */}
      <Suspense fallback={
        <div className="space-y-6">
          <ChartLoader />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartLoader />
            <ChartLoader />
          </div>
        </div>
      }>
        <div className="space-y-6">
          <BarChartIncomeExpense chartData={chartData} />
          <LineChartTrend chartData={chartData} />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DoughnutChartIncomeDistribution chartData={chartData} />
            <DoughnutChartExpenseDistribution chartData={chartData} />
          </div>
        </div>
      </Suspense>
    </div>
  );
}