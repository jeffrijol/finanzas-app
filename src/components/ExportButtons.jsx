// src/components/ExportButtons.jsx
import { useRef } from 'preact/hooks';
import { useTransactions } from '../context/TransactionsContext';
import { TransactionDB } from '../lib/database';
import { Button } from './ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';

export default function ExportButtons() {
  const { transactions } = useTransactions();

  const exportToCSV = () => {
    if (transactions.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const headers = ['Fecha', 'Categoría', 'Descripción', 'Importe', 'Item Asignado'];
    
    const csvData = transactions.map(t => [
      t.fecha,
      t.categoria,
      t.descripcion,
      t.importe.toFixed(2).replace('.', ','),
      t.itemAsignado
    ]);
    
    const csvContent = [
      headers.join(';'),
      ...csvData.map(row => row.join(';'))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'transacciones.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = async () => {
    if (transactions.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    try {
      const { jsPDF } = await import('jspdf');
      await import('jspdf-autotable');
      
      const doc = new jsPDF();
      
      doc.setFontSize(16);
      doc.text('Resumen de Transacciones', 14, 15);
      
      const tableData = transactions.map(t => [
        t.fecha,
        t.categoria,
        t.descripcion,
        t.importe.toFixed(2),
        t.itemAsignado
      ]);
      
      doc.autoTable({
        head: [['Fecha', 'Categoría', 'Descripción', 'Importe', 'Item Asignado']],
        body: tableData,
        startY: 25,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [22, 160, 133] }
      });
      
      doc.save('transacciones.pdf');
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF');
    }
  };

  const exportToJSON = () => {
    const data = TransactionDB.exportAssignedTransactions();
    if (!data || data.transactions.length === 0) {
      alert('No hay transacciones asignadas para exportar');
      return;
    }
    
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `transacciones-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  };

  if (transactions.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exportar Datos</CardTitle>
        <CardDescription>
          Descarga tus transacciones en diferentes formatos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4">
          <Button onClick={exportToCSV} variant="outline">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exportar a CSV
          </Button>
          <Button onClick={exportToPDF} variant="outline">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exportar a PDF
          </Button>
          <Button onClick={exportToJSON} variant="outline">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exportar a JSON
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}