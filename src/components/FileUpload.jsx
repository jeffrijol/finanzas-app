import { useRef } from 'preact/hooks';
import { useTransactions } from '../context/TransactionsContext';
import { Button } from './ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';

export default function FileUpload() {
  const { setTransactions, setLoading, setError } = useTransactions();
  const fileInputRef = useRef(null);
  const dropAreaRef = useRef(null);

  const parseCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ';' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current);
    return result;
  };

  const parseCSV = (csvContent) => {
    const lines = csvContent.split('\n').filter(line => line.trim() !== '');
    
    if (lines.length < 2) {
      throw new Error('El archivo CSV está vacío o no tiene el formato correcto');
    }
    
    const headers = lines[0].split(';').map(header => header.trim());
    const transactions = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const values = parseCSVLine(line);
      
      const transaction = {
        fecha: values[0] || '',
        categoria: values[2] || '',
        descripcion: values[3] || '',
        importe: parseFloat(values[4]?.replace(',', '.') || 0),
        saldo: parseFloat(values[5]?.replace(',', '.') || 0),
        itemAsignado: ''
      };
      
      transactions.push(transaction);
    }
    
    return transactions;
  };

  const handleFile = (file) => {
    if (!file) return;
    
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Por favor, selecciona un archivo CSV');
      return;
    }

    setLoading(true);
    setError(null);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        const parsedData = parseCSV(content);
        setTransactions(parsedData);
      } catch (error) {
        setError('Error al procesar el archivo: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    
    reader.onerror = () => {
      setError('Error al leer el archivo');
      setLoading(false);
    };
    
    reader.readAsText(file, 'UTF-8');
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    handleFile(file);
    // Reset input para permitir cargar el mismo archivo otra vez
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    dropAreaRef.current.classList.remove('border-primary/50', 'bg-muted/50');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    dropAreaRef.current.classList.add('border-primary/50', 'bg-muted/50');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    if (!dropAreaRef.current.contains(e.relatedTarget)) {
      dropAreaRef.current.classList.remove('border-primary/50', 'bg-muted/50');
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Importar Transacciones</CardTitle>
        <CardDescription>
          Arrastra y suelta tu archivo CSV o haz clic para seleccionar
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          ref={dropAreaRef}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center transition-colors duration-200 hover:border-primary/50 hover:bg-muted/50"
        >
          <svg className="mx-auto h-12 w-12 text-muted-foreground" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <p className="mt-2 text-sm text-muted-foreground">
            <span className="font-medium">Arrastra y suelta</span> tu archivo CSV aquí o
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
            accept=".csv"
            onChange={handleFileInput}
            className="hidden"
          />
          <p className="mt-4 text-xs text-muted-foreground">
            Formato esperado: CSV con separador ; y codificación UTF-8
          </p>
        </div>
      </CardContent>
    </Card>
  );
}