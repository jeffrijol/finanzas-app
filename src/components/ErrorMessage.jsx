// src/components/ErrorMessage.jsx
import { useTransactions } from '../context/TransactionsContext';

export default function ErrorMessage() {
  const { error, setError } = useTransactions();

  if (!error) return null;

  return (
    <div class="max-w-2xl mx-auto mb-6">
      <div class="bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex justify-between items-start">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <span class="text-red-800 font-medium">Error</span>
          </div>
          <button
            onClick={() => setError(null)}
            class="text-red-400 hover:text-red-600"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
        <p class="text-red-700 mt-2 text-sm">{error}</p>
      </div>
    </div>
  );
}