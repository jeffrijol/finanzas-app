// src/components/charts/DoughnutChartIncomeDistribution.jsx
import { useMemo } from 'preact/hooks';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';

// Registrar componentes de Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

export default function DoughnutChartIncomeDistribution({ chartData }) {
  const data = useMemo(() => {
    const items = Object.keys(chartData.itemsData);
    const ingresosData = items.map(item => chartData.itemsData[item].ingresos);
    
    // Solo mostrar items que tienen ingresos
    const filteredItems = items.filter((_, index) => ingresosData[index] > 0);
    const filteredData = ingresosData.filter(amount => amount > 0);
    
    return {
      labels: filteredItems,
      datasets: [
        {
          data: filteredData,
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(168, 85, 247, 0.8)',
            'rgba(234, 179, 8, 0.8)',
            'rgba(249, 115, 22, 0.8)',
          ],
          borderColor: [
            'rgba(34, 197, 94, 1)',
            'rgba(59, 130, 246, 1)',
            'rgba(168, 85, 247, 1)',
            'rgba(234, 179, 8, 1)',
            'rgba(249, 115, 22, 1)',
          ],
          borderWidth: 2,
        },
      ],
    };
  }, [chartData]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Distribución de Ingresos',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${new Intl.NumberFormat('es-ES', { 
              style: 'currency', 
              currency: 'EUR' 
            }).format(value)} (${percentage}%)`;
          }
        }
      }
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribución de Ingresos</CardTitle>
        <CardDescription>
          Porcentaje de ingresos por categoría
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Doughnut data={data} options={options} />
      </CardContent>
    </Card>
  );
}