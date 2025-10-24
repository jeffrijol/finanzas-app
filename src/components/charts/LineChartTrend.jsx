// src/components/charts/LineChartTrend.jsx
import { useMemo } from 'preact/hooks';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function LineChartTrend({ chartData }) {
  const data = useMemo(() => {
    const periodos = Object.keys(chartData.periodosData).sort();
    const items = Object.keys(chartData.itemsData);
    
    // Crear dataset para cada ítem
    const datasets = items.map((item, index) => {
      const colors = [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
      ];
      
      return {
        label: item,
        data: periodos.map(periodo => 
          (chartData.periodosData[periodo]?.items[item]?.ingresos || 0) - 
          (chartData.periodosData[periodo]?.items[item]?.gastos || 0)
        ),
        borderColor: colors[index % colors.length],
        backgroundColor: colors[index % colors.length],
        tension: 0.1,
      };
    });

    return {
      labels: periodos.map(periodo => chartData.periodosData[periodo].label),
      datasets,
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
        text: `Evolución de Resultados por Ítem (${chartData.periodo === 'mensual' ? 'Mensual' : 'Trimestral'})`,
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

  // Solo mostrar si hay suficientes períodos
  if (Object.keys(chartData.periodosData).length < 2) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolución Temporal</CardTitle>
        <CardDescription>
          Tendencia de resultados (ingresos - gastos) por ítem a lo largo del tiempo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Line data={data} options={options} />
      </CardContent>
    </Card>
  );
}