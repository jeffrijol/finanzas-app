import { useMemo } from 'preact/hooks';
import { useTransactions } from '../context/TransactionsContext';
import { ITEM_OPTIONS } from '../utils/constants';
import { formatCurrency } from '../utils/formatters';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/Table';

export default function SummaryTable() {
  const { transactions } = useTransactions();

  const summary = useMemo(() => {
    console.log('Calculando resumen para transacciones:', transactions);
    
    const result = {};
    
    // Inicializar todos los ítems con suma 0
    ITEM_OPTIONS.forEach(item => {
      result[item] = 0;
    });
    
    // Calcular sumas para transacciones que tienen item asignado
    transactions.forEach(transaction => {
      if (transaction.itemAsignado && ITEM_OPTIONS.includes(transaction.itemAsignado)) {
        result[transaction.itemAsignado] += transaction.importe;
      }
    });
    
    console.log('Resumen calculado:', result);
    return result;
  }, [transactions]);

  const total = useMemo(() => {
    const totalSum = Object.values(summary).reduce((sum, amount) => sum + amount, 0);
    console.log('Total calculado:', totalSum);
    return totalSum;
  }, [summary]);

  // Mostrar el resumen solo si hay transacciones
  if (transactions.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen por Item</CardTitle>
        <CardDescription>
          Resumen financiero organizado por categorías
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
        
        {/* Información adicional */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Nota:</strong> El resumen solo incluye transacciones que tienen un ítem asignado. 
            Transacciones sin ítem asignado no se incluyen en el cálculo.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}