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

  console.log('TransactionTable - transacciones actuales:', transactions);

  const handleItemChange = useCallback((index, value) => {
    console.log('Cambiando item de transacción:', index, 'a:', value);
    updateTransaction(index, { itemAsignado: value });
  }, [updateTransaction]);

  const handleRemoveTransaction = useCallback((index) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta transacción?')) {
      removeTransaction(index);
    }
  }, [removeTransaction]);

  const formattedTransactions = useMemo(() => {
    console.log('Formateando transacciones para tabla');
    return transactions.map(transaction => ({
      ...transaction,
      formattedImporte: formatCurrency(transaction.importe)
    }));
  }, [transactions]);

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            <svg className="mx-auto h-12 w-12 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            No hay transacciones cargadas. Sube un archivo CSV para comenzar.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transacciones ({transactions.length})</CardTitle>
        <CardDescription>
          Gestiona y asigna items a tus transacciones financieras
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="text-right">Importe</TableHead>
              <TableHead>Item Asignado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {formattedTransactions.map((transaction, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{transaction.fecha}</TableCell>
                <TableCell>{transaction.categoria}</TableCell>
                <TableCell className="max-w-xs truncate">{transaction.descripcion}</TableCell>
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
                    <option value="">Seleccionar</option>
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
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <div className="mt-4">
          <Button onClick={addTransaction} variant="outline">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Agregar Transacción
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}