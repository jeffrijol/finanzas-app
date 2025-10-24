// src/components/TransactionTable.jsx
import { useCallback, useMemo } from 'preact/hooks';
import { useTransactions } from '../context/TransactionsContext';
import { ITEM_OPTIONS } from '../utils/constants';
import { formatCurrency } from '../utils/formatters';
import { Button } from './ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/Table';

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
      formattedImporte: formatCurrency(transaction.importe),
      // Mostrar fecha valor si existe, sino fecha contable
      displayDate: transaction.fechaValor || transaction.fecha
    }));
  }, [transactions]);

  // Calcular estadísticas
  const stats = useMemo(() => {
    const withItems = transactions.filter(t => t.itemAsignado).length;
    const withoutItems = transactions.length - withItems;
    const totalImporte = transactions.reduce((sum, t) => sum + t.importe, 0);
    
    return { withItems, withoutItems, totalImporte };
  }, [transactions]);

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            <svg className="mx-auto h-12 w-12 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            No hay transacciones cargadas. Sube un archivo Excel para comenzar.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transacciones</CardTitle>
        <CardDescription>
          {transactions.length} transacciones totales • {stats.withItems} asignadas • {stats.withoutItems} pendientes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha Valor</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="text-right">Importe</TableHead>
              <TableHead>Item Asignado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {formattedTransactions.map((transaction, index) => (
              <TableRow 
                key={index} 
                className={!transaction.itemAsignado ? 'bg-yellow-50 hover:bg-yellow-100' : ''}
              >
                <TableCell className="font-medium">
                  {transaction.displayDate}
                  {transaction.fechaValor && transaction.fechaValor !== transaction.fecha && (
                    <div className="text-xs text-muted-foreground">
                      Contable: {transaction.fecha}
                    </div>
                  )}
                </TableCell>
                <TableCell>{transaction.categoria}</TableCell>
                <TableCell className="max-w-xs truncate" title={transaction.descripcion}>
                  {transaction.descripcion}
                </TableCell>
                <TableCell className={`text-right font-medium ${
                  transaction.importe < 0 ? 'text-destructive' : 'text-green-600'
                }`}>
                  {transaction.formattedImporte}
                </TableCell>
                <TableCell>
                  <select
                    value={transaction.itemAsignado}
                    onChange={(e) => handleItemChange(index, e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="">Seleccionar item...</option>
                    {ITEM_OPTIONS.map(item => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    onClick={() => handleRemoveTransaction(index)}
                    variant="destructive"
                    size="sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <div className="mt-4 flex justify-between items-center">
          <Button onClick={addTransaction} variant="outline" size="sm">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Agregar Transacción
          </Button>
          
          {stats.withoutItems > 0 && (
            <div className="text-sm text-muted-foreground flex items-center">
              <div className="w-3 h-3 bg-yellow-400 rounded mr-2"></div>
              {stats.withoutItems} transacciones sin item asignado
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}