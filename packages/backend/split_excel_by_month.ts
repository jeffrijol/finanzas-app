import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

const sourcePath = path.resolve('..', '..', 'Movimientos_cuenta T1.xlsx');

console.log(`Reading from: ${sourcePath}`);

try {
    if (!fs.existsSync(sourcePath)) {
        console.error(`File not found: ${sourcePath}`);
        process.exit(1);
    }

    // Read file with cellDates: true to parse dates automatically
    const workbook = XLSX.readFile(sourcePath, { cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Get all data as array of arrays
    const data: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (data.length === 0) {
        console.error("Excel file is empty");
        process.exit(1);
    }

    let headerRowIndex = -1;
    let headers: any[] = [];

    // Search for the header row
    for (let i = 0; i < Math.min(data.length, 20); i++) {
        const row = data[i];
        if (row.some(cell => cell && cell.toString().trim().toUpperCase().includes('FECHA VALOR'))) {
            headerRowIndex = i;
            headers = row;
            break;
        }
    }

    if (headerRowIndex === -1) {
        console.error('Column "FECHA VALOR" not found in the first 20 rows.');
        // print first 5 rows to debug
        console.log('First 5 rows:', data.slice(0, 5));
        process.exit(1);
    }

    console.log(`Found headers at row index ${headerRowIndex}:`, headers);

    // Find "FECHA VALOR" index
    const dateColIndex = headers.findIndex((h: any) =>
        h && h.toString().trim().toUpperCase().includes('FECHA VALOR')
    );

    const rows = data.slice(headerRowIndex + 1);
    const rowsByMonth: Record<string, any[][]> = {};

    rows.forEach(row => {
        const dateCell = row[dateColIndex];
        let date: Date | null = null;

        if (dateCell instanceof Date) {
            date = dateCell;
        } else if (typeof dateCell === 'number') {
            // Excel serial date
            date = new Date((dateCell - (25567 + 2)) * 86400 * 1000);
        } else if (typeof dateCell === 'string') {
            date = new Date(dateCell);
        }

        if (date && !isNaN(date.getTime())) {
            // Format as MonthName
            const month = date.toLocaleString('es-ES', { month: 'long' });
            const key = month.charAt(0).toUpperCase() + month.slice(1); // Capitalize

            if (!rowsByMonth[key]) {
                rowsByMonth[key] = [];
            }
            rowsByMonth[key].push(row);
        }
    });

    // Create files
    Object.keys(rowsByMonth).forEach(monthName => {
        const monthRows = rowsByMonth[monthName];
        const newFileName = `Movimientos_cuenta_T1_${monthName}.xlsx`;
        const newFilePath = path.resolve('..', '..', newFileName);

        // Combine headers + rows
        const newData = [headers, ...monthRows];
        const newWorksheet = XLSX.utils.aoa_to_sheet(newData);
        const newWorkbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, sheetName);

        XLSX.writeFile(newWorkbook, newFilePath);
        console.log(`Created file: ${newFileName} with ${monthRows.length} rows.`);
    });

} catch (error) {
    console.error('Error processing file:', error);
}
