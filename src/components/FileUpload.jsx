// src/components/FileUpload.jsx
import { useRef } from 'preact/hooks';
import { useTransactions } from '../context/TransactionsContext';
import { Button } from './ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';

export default function FileUpload() {
  const { setTransactions, setLoading, setError, clearTransactions } = useTransactions();
  const fileInputRef = useRef(null);
  const dropAreaRef = useRef(null);

  const parseXLSX = async (file) => {
    // Importación dinámica para reducir el bundle inicial
    const XLSX = await import('xlsx');
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Obtener la primera hoja (puedes ajustar el nombre si es necesario)
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Convertir a JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          console.log('Datos crudos del Excel:', jsonData);
          
          // Encontrar la fila de encabezados y procesar datos
          const transactions = processExcelData(jsonData);
          resolve(transactions);
          
        } catch (error) {
          reject(new Error('Error al procesar el archivo Excel: ' + error.message));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error al leer el archivo'));
      };
      
      reader.readAsArrayBuffer(file);
    });
  };

  const processExcelData = (excelData) => {
    // Buscar la fila que contiene los encabezados
    let headerRowIndex = -1;
    const headers = ['FECHA CONTABLE', 'FECHA VALOR', 'CATEGORÍA', 'DESCRIPCIÓN', 'IMPORTE', 'SALDO'];
    
    for (let i = 0; i < excelData.length; i++) {
      const row = excelData[i];
      if (row.some(cell => headers.includes(String(cell).toUpperCase()))) {
        headerRowIndex = i;
        break;
      }
    }
    
    if (headerRowIndex === -1) {
      throw new Error('No se encontraron los encabezados esperados en el archivo Excel');
    }
    
    const transactions = [];
    
    // Procesar filas de datos (empezando desde headerRowIndex + 1)
    for (let i = headerRowIndex + 1; i < excelData.length; i++) {
      const row = excelData[i];
      
      // Saltar filas vacías o con muy pocos datos
      if (!row || row.length < 6 || !row[0]) continue;
      
      try {
        const transaction = {
          fecha: formatExcelDate(row[0]), // FECHA CONTABLE
          fechaValor: formatExcelDate(row[1]), // FECHA VALOR
          categoria: String(row[4] || '').trim(), // CATEGORÍA
          descripcion: String(row[5] || '').trim(), // DESCRIPCIÓN
          importe: parseFloat(String(row[9] || 0).replace(',', '.')), // IMPORTE (columna J)
          saldo: parseFloat(String(row[10] || 0).replace(',', '.')), // SALDO (columna K)
          itemAsignado: ''
        };
        
        // Validar que tenga los datos mínimos
        if (transaction.fecha && !isNaN(transaction.importe)) {
          transactions.push(transaction);
        }
        
      } catch (error) {
        console.warn('Error procesando fila', i, ':', error);
      }
    }
    
    console.log('Transacciones procesadas:', transactions);
    return transactions;
  };

  const formatExcelDate = (excelDate) => {
    if (!excelDate) return '';
    
    // Si es una fecha de Excel (número)
    if (typeof excelDate === 'number') {
      const date = new Date((excelDate - 25569) * 86400 * 1000);
      return date.toLocaleDateString('es-ES');
    }
    
    // Si ya es una cadena de fecha
    const dateStr = String(excelDate);
    
    // Formato YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
      const [datePart] = dateStr.split(' ');
      const [year, month, day] = datePart.split('-');
      return `${day}/${month}/${year}`;
    }
    
    // Formato DD/MM/YYYY
    if (/^\d{2}\/\d{2}\/\d{4}/.test(dateStr)) {
      return dateStr.split(' ')[0];
    }
    
    return dateStr;
  };

  const handleFile = async (file) => {
    if (!file) return;
    
    // Validar tipo de archivo
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/vnd.ms-excel.sheet.macroEnabled.12'
    ];
    
    if (!validTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.xlsx')) {
      setError('Por favor, selecciona un archivo Excel (.xlsx)');
      return;
    }

    // Limpiar transacciones anteriores
    clearTransactions();
    setLoading(true);
    setError(null);
    
    try {
      const parsedData = await parseXLSX(file);
      
      if (parsedData.length > 0) {
        setTransactions(parsedData);
      } else {
        setError('No se encontraron transacciones válidas en el archivo Excel');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    handleFile(file);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    dropAreaRef.current.classList.remove('border-primary/50', 'bg-blue-50');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    dropAreaRef.current.classList.add('border-primary/50', 'bg-blue-50');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    if (!dropAreaRef.current.contains(e.relatedTarget)) {
      dropAreaRef.current.classList.remove('border-primary/50', 'bg-blue-50');
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Importar Transacciones</CardTitle>
        <CardDescription>
          Arrastra y suelta tu archivo Excel (.xlsx) o haz clic para seleccionar
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          ref={dropAreaRef}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center transition-colors duration-200 hover:border-primary/50 hover:bg-blue-50"
        >
          <svg className="mx-auto h-12 w-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="mt-2 text-sm text-muted-foreground">
            <span className="font-medium">Arrastra y suelta</span> tu archivo Excel aquí o
          </p>
          <Button
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="mt-4"
          >
            Seleccionar archivo
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileInput}
            className="hidden"
          />
          <p className="mt-4 text-xs text-muted-foreground">
            Formato esperado: Excel (.xlsx) con columnas estándar de extracto bancario
          </p>
        </div>
      </CardContent>
    </Card>
  );
}