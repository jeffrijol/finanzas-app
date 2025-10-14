// src/components/LoadingSpinner.jsx
import { useTransactions } from '../context/TransactionsContext';

export default function LoadingSpinner() {
  const { loading } = useTransactions();

  if (!loading) return null;

  return (
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-lg">
        <div class="flex items-center space-x-3">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span class="text-gray-700">Procesando archivo...</span>
        </div>
      </div>
    </div>
  );
}