import { useMemo } from 'preact/hooks';
import { useTransactions } from '../context/TransactionsContext';
import { ITEM_OPTIONS } from '../utils/constants';
import { formatCurrency } from '../utils/formatters';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/Table';

export default function SummaryTable() {
  const { transactions } = useTransactions();

  // ... (mantener la lógica igual)

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
              <TableCell>Total</TableCell>
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