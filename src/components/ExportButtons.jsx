/* // src/components/ExportButtons.jsx
import { useRef } from 'preact/hooks';

export default function ExportButtons({ transactions }) {
  const exportToCSV = () => {
    if (transactions.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    // Encabezados
    const headers = ['Fecha', 'Categoría', 'Descripción', 'Importe', 'Item Asignado'];
    
    // Datos
    const csvData = transactions.map(t => [
      t.fecha,
      t.categoria,
      t.descripcion,
      t.importe.toFixed(2).replace('.', ','),
      t.itemAsignado
    ]);
    
    // Crear contenido CSV
    const csvContent = [
      headers.join(';'),
      ...csvData.map(row => row.join(';'))
    ].join('\n');
    
    // Descargar archivo
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
      // Importación dinámica para reducir el bundle inicial
      const { jsPDF } = await import('jspdf');
      await import('jspdf-autotable');
      
      const doc = new jsPDF();
      
      // Título
      doc.setFontSize(16);
      doc.text('Resumen de Transacciones', 14, 15);
      
      // Tabla de transacciones
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
      
      // Guardar PDF
      doc.save('transacciones.pdf');
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF');
    }
  };

  return (
    <div class="flex flex-wrap gap-4 justify-center">
      <button
        onClick={exportToCSV}
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
      >
        Exportar a CSV
      </button>
      <button
        onClick={exportToPDF}
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      >
        Exportar a PDF
      </button>
    </div>
  );
} */

  // src/components/ExportButtons.jsx
import { useRef } from 'preact/hooks';
import { useTransactions } from '../context/TransactionsContext';

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

  if (transactions.length === 0) {
    return null;
  }

  return (
    <div class="flex flex-wrap gap-4 justify-center">
      <button
        onClick={exportToCSV}
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Exportar a CSV
      </button>
      <button
        onClick={exportToPDF}
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Exportar a PDF
      </button>
    </div>
  );
}