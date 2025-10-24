// src/context/TransactionsContext.jsx
import { createContext } from 'preact';
import { useState, useCallback, useContext } from 'preact/hooks';
import { TRANSACTION_TEMPLATE } from '../utils/constants';

const TransactionsContext = createContext();

export function TransactionsProvider({ children }) {
  const [transactions, setTransactionsState] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Validación de transacciones
  const validateTransaction = useCallback((transaction) => {
    const errors = [];
    
    if (transaction.fecha && !/^\d{2}\/\d{2}\/\d{4}$/.test(transaction.fecha)) {
      errors.push('Formato de fecha inválido');
    }
    
    if (isNaN(transaction.importe)) {
      errors.push('Importe debe ser un número válido');
    }
    
    if (isNaN(transaction.saldo)) {
      errors.push('Saldo debe ser un número válido');
    }
    
    return errors;
  }, []);

  const addTransaction = useCallback(() => {
    setTransactionsState(prev => [...prev, { ...TRANSACTION_TEMPLATE }]);
  }, []);

  const updateTransaction = useCallback((index, updates) => {
    setTransactionsState(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...updates };
      
      const errors = validateTransaction(updated[index]);
      if (errors.length > 0) {
        console.warn('Errores de validación:', errors);
      }
      
      return updated;
    });
  }, [validateTransaction]);

  const removeTransaction = useCallback((index) => {
    setTransactionsState(prev => prev.filter((_, i) => i !== index));
  }, []);

  const setTransactions = useCallback((newTransactions) => {
    // Limpiar transacciones anteriores completamente
    setTransactionsState([]);
    
    // Pequeño delay para asegurar el renderizado
    setTimeout(() => {
      // Validar todas las transacciones
      const validationResults = newTransactions.map(validateTransaction);
      const hasErrors = validationResults.some(errors => errors.length > 0);
      
      if (hasErrors) {
        console.warn('Algunas transacciones tienen errores de validación');
      }
      
      setTransactionsState(newTransactions);
    }, 10);
  }, [validateTransaction]);

  const clearTransactions = useCallback(() => {
    setTransactionsState([]);
  }, []);

  // Función para obtener datos procesados para gráficos
  const getChartData = useCallback(() => {
    const assignedTransactions = transactions.filter(t => t.itemAsignado);
    
    if (assignedTransactions.length === 0) {
      return null;
    }

    // Agrupar por ítem
    const itemsData = {};
    assignedTransactions.forEach(transaction => {
      const item = transaction.itemAsignado;
      if (!itemsData[item]) {
        itemsData[item] = { ingresos: 0, gastos: 0, transacciones: [] };
      }
      
      if (transaction.importe > 0) {
        itemsData[item].ingresos += transaction.importe;
      } else {
        itemsData[item].gastos += Math.abs(transaction.importe);
      }
      
      itemsData[item].transacciones.push(transaction);
    });

    return {
      itemsData,
      totalIngresos: Object.values(itemsData).reduce((sum, item) => sum + item.ingresos, 0),
      totalGastos: Object.values(itemsData).reduce((sum, item) => sum + item.gastos, 0),
      totalTransacciones: assignedTransactions.length
    };
  }, [transactions]);

  const value = {
    transactions,
    loading,
    error,
    setLoading,
    setError,
    addTransaction,
    updateTransaction,
    removeTransaction,
    setTransactions,
    clearTransactions,
    getChartData
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