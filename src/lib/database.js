// src/lib/database.ts
import type { Transaction } from '../types/finanzas';

const DB_KEYS = {
  TRANSACTIONS: 'finanzas-transactions',
  ASSIGNED_ITEMS: 'finanzas-assigned-items'
};

export class TransactionDB {
  static saveTransactions(transactions: Transaction[]): boolean {
    try {
      const data = {
        transactions,
        lastUpdated: new Date().toISOString(),
        version: '1.0'
      };
      localStorage.setItem(DB_KEYS.TRANSACTIONS, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error guardando transacciones:', error);
      return false;
    }
  }

  static loadTransactions(): Transaction[] {
    try {
      const stored = localStorage.getItem(DB_KEYS.TRANSACTIONS);
      if (!stored) return [];
      
      const data = JSON.parse(stored);
      return data.transactions || [];
    } catch (error) {
      console.error('Error cargando transacciones:', error);
      return [];
    }
  }

  static getAssignedTransactions(): Transaction[] {
    const transactions = this.loadTransactions();
    return transactions.filter(t => t.itemAsignado);
  }

  static exportAssignedTransactions(): { 
    transactions: Transaction[]; 
    exportDate: string; 
    total: number; 
    periodo: string;
  } | null {
    const assigned = this.getAssignedTransactions();
    
    if (assigned.length === 0) return null;
    
    return {
      transactions: assigned,
      exportDate: new Date().toISOString(),
      total: assigned.length,
      periodo: this.detectPeriod(assigned)
    };
  }

  static detectPeriod(transactions: Transaction[]): string {
    if (transactions.length === 0) return 'desconocido';
    
    // Extraer meses de las transacciones
    const meses = transactions.map(t => {
      const [day, month, year] = t.fecha.split('/');
      return `${month}/${year}`;
    });
    
    const uniqueMeses = [...new Set(meses)];
    
    if (uniqueMeses.length === 1) {
      return `mes-${uniqueMeses[0].replace('/', '-')}`;
    } else if (uniqueMeses.length <= 3) {
      // Asumir que es un trimestre
      const mesesNumeros = uniqueMeses.map(m => parseInt(m.split('/')[0]));
      const minMes = Math.min(...mesesNumeros);
      const maxMes = Math.max(...mesesNumeros);
      const year = uniqueMeses[0].split('/')[1];
      
      if (minMes >= 1 && maxMes <= 3) return `trimestre-1-${year}`;
      if (minMes >= 4 && maxMes <= 6) return `trimestre-2-${year}`;
      if (minMes >= 7 && maxMes <= 9) return `trimestre-3-${year}`;
      if (minMes >= 10 && maxMes <= 12) return `trimestre-4-${year}`;
    }
    
    return 'multiple-periodos';
  }

  static clearTransactions(): void {
    localStorage.removeItem(DB_KEYS.TRANSACTIONS);
  }
}