// src/context/TransactionsContext.jsx
import { createContext } from 'preact';
import { useState, useCallback, useContext, useMemo } from 'preact/hooks';
import { TRANSACTION_TEMPLATE, ITEM_OPTIONS } from '../utils/constants';

const TransactionsContext = createContext();

export function TransactionsProvider({ children }) {
  const [transactions, setTransactionsState] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('mensual'); // 'mensual', 'trimestral'

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
    setTransactionsState([]);
    
    setTimeout(() => {
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

  // Función mejorada para obtener datos procesados para gráficos con agrupación temporal
  const getChartData = useCallback((periodo = periodoSeleccionado) => {
    const assignedTransactions = transactions.filter(t => t.itemAsignado);
    
    if (assignedTransactions.length === 0) {
      return null;
    }

    // Agrupar por ítem y período
    const itemsData = {};
    const periodosData = {};
    
    assignedTransactions.forEach(transaction => {
      const item = transaction.itemAsignado;
      if (!ITEM_OPTIONS.includes(item)) return;
      
      // Parsear fecha
      const [day, month, year] = transaction.fecha.split('/');
      const fecha = new Date(`${year}-${month}-${day}`);
      
      // Determinar período
      let periodoKey;
      let periodoLabel;
      
      if (periodo === 'mensual') {
        periodoKey = `${year}-${month.padStart(2, '0')}`;
        periodoLabel = `${month}/${year}`;
      } else {
        // Trimestral
        const trimestre = Math.floor((parseInt(month) - 1) / 3) + 1;
        periodoKey = `T${trimestre}-${year}`;
        periodoLabel = `T${trimestre} ${year}`;
      }
      
      // Inicializar datos del ítem
      if (!itemsData[item]) {
        itemsData[item] = { ingresos: 0, gastos: 0, transacciones: [] };
      }
      
      // Inicializar datos del período
      if (!periodosData[periodoKey]) {
        periodosData[periodoKey] = {
          label: periodoLabel,
          ingresos: 0,
          gastos: 0,
          items: {}
        };
      }
      
      // Acumular datos
      if (transaction.importe > 0) {
        itemsData[item].ingresos += transaction.importe;
        periodosData[periodoKey].ingresos += transaction.importe;
        
        if (!periodosData[periodoKey].items[item]) {
          periodosData[periodoKey].items[item] = { ingresos: 0, gastos: 0 };
        }
        periodosData[periodoKey].items[item].ingresos += transaction.importe;
      } else {
        const gasto = Math.abs(transaction.importe);
        itemsData[item].gastos += gasto;
        periodosData[periodoKey].gastos += gasto;
        
        if (!periodosData[periodoKey].items[item]) {
          periodosData[periodoKey].items[item] = { ingresos: 0, gastos: 0 };
        }
        periodosData[periodoKey].items[item].gastos += gasto;
      }
      
      itemsData[item].transacciones.push(transaction);
    });

    return {
      itemsData,
      periodosData,
      totalIngresos: Object.values(itemsData).reduce((sum, item) => sum + item.ingresos, 0),
      totalGastos: Object.values(itemsData).reduce((sum, item) => sum + item.gastos, 0),
      totalTransacciones: assignedTransactions.length,
      periodo: periodoSeleccionado
    };
  }, [transactions, periodoSeleccionado]);

  // Datos memoizados para mejor rendimiento
  const chartData = useMemo(() => getChartData(), [getChartData]);

  const value = {
    transactions,
    loading,
    error,
    periodoSeleccionado,
    setPeriodoSeleccionado,
    setLoading,
    setError,
    addTransaction,
    updateTransaction,
    removeTransaction,
    setTransactions,
    clearTransactions,
    getChartData,
    chartData // Datos memoizados
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