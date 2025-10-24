// src/components/SummaryTable.jsx
import { useMemo } from 'preact/hooks';
import { useTransactions } from '../context/TransactionsContext';
import { ITEM_OPTIONS } from '../utils/constants';
import { formatCurrency } from '../utils/formatters';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/Table';

export default function SummaryTable() {
  const { transactions } = useTransactions();

  const { summary, hasAssignedItems, assignedItemsCount } = useMemo(() => {
    console.log('Calculando resumen para transacciones:', transactions);
    
    const result = {};
    let assignedCount = 0;
    
    // Inicializar todos los ítems con suma 0
    ITEM_OPTIONS.forEach(item => {
      result[item] = 0;
    });
    
    // Calcular sumas para transacciones que tienen item asignado
    transactions.forEach(transaction => {
      if (transaction.itemAsignado && ITEM_OPTIONS.includes(transaction.itemAsignado)) {
        result[transaction.itemAsignado] += transaction.importe;
        assignedCount++;
      }
    });
    
    const hasItems = assignedCount > 0;
    
    console.log('Resumen calculado:', result, 'Tiene items asignados:', hasItems);
    return { 
      summary: result, 
      hasAssignedItems: hasItems,
      assignedItemsCount: assignedCount
    };
  }, [transactions]);

  const total = useMemo(() => {
    const totalSum = Object.values(summary).reduce((sum, amount) => sum + amount, 0);
    return totalSum;
  }, [summary]);

  // No mostrar el resumen si no hay transacciones con items asignados
  if (!hasAssignedItems) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen por Item</CardTitle>
        <CardDescription>
          {assignedItemsCount} transacciones asignadas • Total general: {formatCurrency(total)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead className="text-right">Sumatoria</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ITEM_OPTIONS.map(item => (
              <TableRow key={item}>
                <TableCell className="font-medium">{item}</TableCell>
                <TableCell className={`text-right font-medium ${
                  summary[item] < 0 ? 'text-destructive' : 'text-green-600'
                }`}>
                  {formatCurrency(summary[item])}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-muted/50 font-semibold">
              <TableCell>Total General</TableCell>
              <TableCell className={`text-right font-medium ${
                total < 0 ? 'text-destructive' : 'text-green-600'
              }`}>
                {formatCurrency(total)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}