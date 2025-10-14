/* // src/components/TransactionTable.jsx
import { useMemo } from 'preact/hooks';

const ITEM_OPTIONS = [
  "Vivienda 1",
  "Vivienda 2", 
  "Sociedad Anonima 1"
];

export default function TransactionTable({ transactions, setTransactions }) {
  const handleItemChange = (index, value) => {
    const updatedTransactions = [...transactions];
    updatedTransactions[index].itemAsignado = value;
    setTransactions(updatedTransactions);
  };

  const addTransaction = () => {
    setTransactions([
      ...transactions,
      {
        fecha: '',
        categoria: '',
        descripcion: '',
        importe: 0,
        saldo: 0,
        itemAsignado: ''
      }
    ]);
  };

  const removeTransaction = (index) => {
    const updatedTransactions = transactions.filter((_, i) => i !== index);
    setTransactions(updatedTransactions);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  if (transactions.length === 0) {
    return (
      <div class="text-center py-8 text-gray-500">
        No hay transacciones cargadas. Sube un archivo CSV para comenzar.
      </div>
    );
  }

  return (
    <div class="overflow-x-auto bg-white rounded-lg shadow">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Categoría
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Descripción
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Importe
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Item Asignado
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          {transactions.map((transaction, index) => (
            <tr key={index} class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {transaction.fecha}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {transaction.categoria}
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">
                {transaction.descripcion}
              </td>
              <td class={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                transaction.importe < 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {formatCurrency(transaction.importe)}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <select
                  value={transaction.itemAsignado}
                  onChange={(e) => handleItemChange(index, e.target.value)}
                  class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">Seleccionar</option>
                  {ITEM_OPTIONS.map(item => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => removeTransaction(index)}
                  class="text-red-600 hover:text-red-900"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div class="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <button
          onClick={addTransaction}
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Agregar Transacción
        </button>
      </div>
    </div>
  );
} */

  // src/components/TransactionTable.jsx
import { useCallback, useMemo } from 'preact/hooks';
import { useTransactions } from '../context/TransactionsContext';
import { ITEM_OPTIONS } from '../utils/constants';
import { formatCurrency } from '../utils/formatters';

export default function TransactionTable() {
  const { transactions, updateTransaction, removeTransaction, addTransaction } = useTransactions();

  const handleItemChange = useCallback((index, value) => {
    updateTransaction(index, { itemAsignado: value });
  }, [updateTransaction]);

  const handleRemoveTransaction = useCallback((index) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta transacción?')) {
      removeTransaction(index);
    }
  }, [removeTransaction]);

  const formattedTransactions = useMemo(() => {
    return transactions.map(transaction => ({
      ...transaction,
      formattedImporte: formatCurrency(transaction.importe)
    }));
  }, [transactions]);

  if (transactions.length === 0) {
    return (
      <div class="text-center py-8 text-gray-500 bg-white rounded-lg shadow">
        No hay transacciones cargadas. Sube un archivo CSV para comenzar.
      </div>
    );
  }

  return (
    <div class="overflow-x-auto bg-white rounded-lg shadow">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Categoría
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Descripción
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Importe
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Item Asignado
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          {formattedTransactions.map((transaction, index) => (
            <tr key={index} class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {transaction.fecha}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {transaction.categoria}
              </td>
              <td class="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                {transaction.descripcion}
              </td>
              <td class={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                transaction.importe < 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {transaction.formattedImporte}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <select
                  value={transaction.itemAsignado}
                  onChange={(e) => handleItemChange(index, e.target.value)}
                  class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">Seleccionar</option>
                  {ITEM_OPTIONS.map(item => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => handleRemoveTransaction(index)}
                  class="text-red-600 hover:text-red-900 transition-colors"
                  title="Eliminar transacción"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div class="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <button
          onClick={addTransaction}
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Agregar Transacción
        </button>
      </div>
    </div>
  );
}