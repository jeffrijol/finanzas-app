// src/types/finanzas.ts
export interface Transaction {
  id?: string;
  fecha: string;
  fechaValor: string;
  categoria: string;
  descripcion: string;
  importe: number;
  saldo: number;
  itemAsignado: string;
}

export interface HistoricalData {
  periodo: string;
  rango: string;
  transacciones: Transaction[];
  resumen?: {
    [key: string]: {
      ingresos: number;
      gastos: number;
    };
  };
}

export interface ChartData {
  itemsData: {
    [key: string]: {
      ingresos: number;
      gastos: number;
      count: number;
    };
  };
  filteredData: Transaction[];
}

export interface PeriodData {
  [key: string]: {
    transacciones: Transaction[];
    label: string;
  };
}

// Extender la interfaz Window para incluir nuestra función global
declare global {
  interface Window {
    getHistoricalData: () => HistoricalData[];
  }
}