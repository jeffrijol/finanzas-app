// src/components/charts/BarChartIncomeExpense.jsx
import { useMemo } from 'preact/hooks';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function BarChartIncomeExpense({ chartData }) {
  const data = useMemo(() => {
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

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Ingresos vs Gastos por Ítem',
      },
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
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ingresos vs Gastos por Ítem</CardTitle>
        <CardDescription>
          Comparación visual de ingresos y gastos organizados por categoría
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Bar data={data} options={options} />
      </CardContent>
    </Card>
  );
}