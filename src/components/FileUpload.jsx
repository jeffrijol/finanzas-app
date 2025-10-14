// src/components/FileUpload.jsx
import { useRef } from 'preact/hooks';

export default function FileUpload({ setTransactions }) {
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
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      try {
        const parsedData = parseCSV(content);
        setTransactions(parsedData);
      } catch (error) {
        alert('Error al procesar el archivo: ' + error.message);
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    dropAreaRef.current.classList.remove('border-blue-400', 'bg-blue-50');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    dropAreaRef.current.classList.add('border-blue-400', 'bg-blue-50');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    if (!dropAreaRef.current.contains(e.relatedTarget)) {
      dropAreaRef.current.classList.remove('border-blue-400', 'bg-blue-50');
    }
  };

  return (
    <div class="w-full max-w-2xl mx-auto">
      <div
        ref={dropAreaRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition-colors duration-200"
      >
        
        <p class="mt-2 text-sm text-gray-600">
          <span class="font-medium">Arrastra y suelta</span> tu archivo CSV aquí o
        </p>
        <button
          type="button"
          onClick={() => fileInputRef.current.click()}
          class="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Seleccionar archivo
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileInput}
          class="hidden"
        />
        <p class="mt-1 text-xs text-gray-500">
          Formato esperado: CSV con separador ; y codificación UTF-8
        </p>
      </div>
    </div>
  );
}