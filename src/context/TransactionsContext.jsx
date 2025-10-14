// src/context/TransactionsContext.jsx
import { createContext } from 'preact';
import { useState, useCallback, useContext } from 'preact/hooks';
import { TRANSACTION_TEMPLATE } from '../utils/constants';

const TransactionsContext = createContext();

export function TransactionsProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Validación de transacciones
  const validateTransaction = useCallback((transaction) => {
    const errors = [];
    
    // Validar fecha (formato DD/MM/AAAA)
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(transaction.fecha)) {
      errors.push('Formato de fecha inválido');
    }
    
    // Validar importe
    if (isNaN(transaction.importe)) {
      errors.push('Importe debe ser un número válido');
    }
    
    // Validar saldo
    if (isNaN(transaction.saldo)) {
      errors.push('Saldo debe ser un número válido');
    }
    
    return errors;
  }, []);

  const addTransaction = useCallback(() => {
    setTransactions(prev => [...prev, { ...TRANSACTION_TEMPLATE }]);
  }, []);

  const updateTransaction = useCallback((index, updates) => {
    setTransactions(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...updates };
      
      // Validar la transacción actualizada
      const errors = validateTransaction(updated[index]);
      if (errors.length > 0) {
        console.warn('Errores de validación:', errors);
      }
      
      return updated;
    });
  }, [validateTransaction]);

  const removeTransaction = useCallback((index) => {
    setTransactions(prev => prev.filter((_, i) => i !== index));
  }, []);

  const setTransactionsWithValidation = useCallback((newTransactions) => {
    // Validar todas las transacciones
    const validationResults = newTransactions.map(validateTransaction);
    const hasErrors = validationResults.some(errors => errors.length > 0);
    
    if (hasErrors) {
      console.warn('Algunas transacciones tienen errores de validación');
    }
    
    setTransactions(newTransactions);
  }, [validateTransaction]);

  const value = {
    transactions,
    loading,
    error,
    setLoading,
    setError,
    addTransaction,
    updateTransaction,
    removeTransaction,
    setTransactions: setTransactionsWithValidation
  };

  return (
    <TransactionsContext.Provider value={value}>
      {children}
    </TransactionsContext.Provider>
  );
}

export const useTransactions = () => {
  const context = useContext(TransactionsContext);
  if (!context) {
    throw new Error('useTransactions debe usarse dentro de TransactionsProvider');
  }
  return context;
};