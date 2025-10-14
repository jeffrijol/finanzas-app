// src/utils/csvParser.js
export function parseCSV(csvContent) {
  const lines = csvContent.split('\n').filter(line => line.trim() !== '');
  
  // Verificar que hay al menos una línea de encabezado y una de datos
  if (lines.length < 2) {
    throw new Error('El archivo CSV está vacío o no tiene el formato correcto');
  }
  
  // Obtener encabezados
  const headers = lines[0].split(';').map(header => header.trim());
  
  // Procesar cada línea de datos
  const transactions = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const values = parseCSVLine(line);
    
    // Crear objeto de transacción
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
}

function parseCSVLine(line) {
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
  
  // Añadir el último campo
  result.push(current);
  
  return result;
}