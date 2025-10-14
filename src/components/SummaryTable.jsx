/* // src/components/SummaryTable.jsx
import { useMemo } from 'preact/hooks';

const ITEM_OPTIONS = [
  "Vivienda 1",
  "Vivienda 2", 
  "Sociedad Anonima 1"
];

export default function SummaryTable({ transactions }) {
  const summary = useMemo(() => {
    const result = {};
    
    // Inicializar todos los ítems con suma 0
    ITEM_OPTIONS.forEach(item => {
      result[item] = 0;
    });
    
    // Calcular sumas
    transactions.forEach(transaction => {
      if (transaction.itemAsignado && result.hasOwnProperty(transaction.itemAsignado)) {
        result[transaction.itemAsignado] += transaction.importe;
      }
    });
    
    return result;
  }, [transactions]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div class="overflow-x-auto bg-white rounded-lg shadow">
      <h2 class="text-xl font-semibold p-6 border-b border-gray-200">
        Total por Item
      </h2>
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Item
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sumatoria
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          {ITEM_OPTIONS.map(item => (
            <tr key={item} class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {item}
              </td>
              <td class={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                summary[item] < 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {formatCurrency(summary[item])}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} */

  // src/components/SummaryTable.jsx
import { useMemo } from 'preact/hooks';
import { useTransactions } from '../context/TransactionsContext';
import { ITEM_OPTIONS } from '../utils/constants';
import { formatCurrency } from '../utils/formatters';

export default function SummaryTable() {
  const { transactions } = useTransactions();

  const summary = useMemo(() => {
    const result = {};
    
    ITEM_OPTIONS.forEach(item => {
      result[item] = 0;
    });
    
    transactions.forEach(transaction => {
      if (transaction.itemAsignado && result.hasOwnProperty(transaction.itemAsignado)) {
        result[transaction.itemAsignado] += transaction.importe;
      }
    });
    
    return result;
  }, [transactions]);

  const total = useMemo(() => {
    return Object.values(summary).reduce((sum, amount) => sum + amount, 0);
  }, [summary]);

  if (transactions.length === 0) {
    return null;
  }

  return (
    <div class="overflow-x-auto bg-white rounded-lg shadow">
      <h2 class="text-xl font-semibold p-6 border-b border-gray-200">
        Resumen por Item
      </h2>
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Item
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sumatoria
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          {ITEM_OPTIONS.map(item => (
            <tr key={item} class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {item}
              </td>
              <td class={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                summary[item] < 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {formatCurrency(summary[item])}
              </td>
            </tr>
          ))}
          <tr class="bg-gray-50 font-semibold">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              Total
            </td>
            <td class={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
              total < 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {formatCurrency(total)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}