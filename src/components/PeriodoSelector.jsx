// src/components/PeriodoSelector.jsx
import { useTransactions } from '../context/TransactionsContext';

export default function PeriodoSelector() {
  const { periodoSeleccionado, setPeriodoSeleccionado } = useTransactions();

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">Agrupar por:</span>
      <div className="flex border border-gray-300 rounded-md overflow-hidden">
        <button
          onClick={() => setPeriodoSeleccionado('mensual')}
          className={`px-3 py-1 text-sm font-medium transition-colors ${
            periodoSeleccionado === 'mensual'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Mensual
        </button>
        <button
          onClick={() => setPeriodoSeleccionado('trimestral')}
          className={`px-3 py-1 text-sm font-medium transition-colors ${
            periodoSeleccionado === 'trimestral'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Trimestral
        </button>
      </div>
    </div>
  );
}