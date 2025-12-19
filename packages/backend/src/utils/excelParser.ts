import * as XLSX from 'xlsx';
import { ExcelProcessingResult, ExcelProcessingError } from '../types/excel.types';
import { ExcelTransaction } from '../types/transaction.types';
import { parseExcelDate } from './dateHelpers';

export class ExcelParser {
    private static readonly HEADER_MAPPING = {
        fechaValor: 'FECHA VALOR',
        categoria: 'CATEGORÍA',
        descripcion: 'DESCRIPCIÓN',
        importe: 'IMPORTE',
        saldo: 'SALDO',
        fechaContable: 'FECHA CONTABLE',
        clave: 'CLAVE',
        referencia: 'REFERENCIA',
        ref16: 'REF. 16',
        debe: 'DEBE',
        haber: 'HABER',
    };

    static parse(buffer: Buffer): ExcelProcessingResult {
        const workbook = XLSX.read(buffer, {
            type: 'buffer',
            cellDates: true,
            cellNF: false,
            cellText: false,
        });

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convertir a JSON manteniendo las celdas vacías
        const data: any[][] = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: '',
            blankrows: false,
        });

        // Encontrar la fila de encabezados
        const headerRowIndex = this.findHeaderRow(data);
        if (headerRowIndex === -1) {
            throw new Error('No se encontraron encabezados válidos en el archivo Excel');
        }

        const headers = data[headerRowIndex].map((cell: any) =>
            String(cell).trim().toUpperCase()
        );

        // Mapear índices de columnas
        const columnIndices = this.mapColumnIndices(headers);

        // Procesar filas de datos
        const transactions: ExcelTransaction[] = [];
        const errors: ExcelProcessingError[] = [];

        for (let i = headerRowIndex + 1; i < data.length; i++) {
            const row = data[i];

            // Saltar filas completamente vacías
            if (!row || row.length === 0 || row.every(cell => cell === '')) {
                continue;
            }

            try {
                const transaction = this.parseRow(row, columnIndices, i + 1);
                if (transaction) {
                    transactions.push(transaction);
                }
            } catch (error: any) {
                errors.push({
                    row: i + 1,
                    column: 'N/A',
                    value: JSON.stringify(row),
                    error: error.message,
                });
            }
        }

        return {
            totalRows: data.length - (headerRowIndex + 1),
            processedRows: transactions.length,
            errors,
            transactions,
        };
    }

    private static findHeaderRow(data: any[][]): number {
        // Buscar la fila que contiene "FECHA VALOR" (mayúsculas/minúsculas)
        for (let i = 0; i < Math.min(10, data.length); i++) {
            const row = data[i];
            if (row && Array.isArray(row)) {
                const hasFechaValor = row.some(cell =>
                    String(cell).toUpperCase().includes('FECHA VALOR')
                );
                if (hasFechaValor) {
                    return i;
                }
            }
        }
        return -1;
    }

    private static mapColumnIndices(headers: string[]): Record<string, number> {
        const indices: Record<string, number> = {};

        Object.entries(this.HEADER_MAPPING).forEach(([key, header]) => {
            const index = headers.findIndex(h =>
                h.toUpperCase() === header.toUpperCase()
            );
            if (index !== -1) {
                indices[key] = index;
            }
        });

        return indices;
    }

    private static parseRow(
        row: any[],
        columnIndices: Record<string, number>,
        rowNumber: number
    ): ExcelTransaction | null {
        // Obtener valores de las columnas mapeadas
        const fechaValor = columnIndices.fechaValor !== undefined ? row[columnIndices.fechaValor] : null;
        const categoria = columnIndices.categoria !== undefined ? row[columnIndices.categoria] : '';
        const descripcion = columnIndices.descripcion !== undefined ? row[columnIndices.descripcion] : '';
        const importe = columnIndices.importe !== undefined ? row[columnIndices.importe] : 0;
        const saldo = columnIndices.saldo !== undefined ? row[columnIndices.saldo] : 0;

        // Validaciones básicas
        if (!fechaValor) {
            throw new Error('Fecha valor es requerida');
        }

        if (!descripcion || descripcion.toString().trim() === '') {
            throw new Error('Descripción es requerida');
        }

        // Parsear fecha
        const parsedDate = parseExcelDate(fechaValor);
        if (!parsedDate) {
            throw new Error(`Fecha inválida: ${fechaValor}`);
        }

        // Convertir números
        const importeNum = this.parseNumber(importe);
        const saldoNum = this.parseNumber(saldo);

        // Construir transacción
        const transaction: ExcelTransaction = {
            fechaValor: parsedDate.toISOString(),
            categoria: categoria?.toString()?.trim() || 'Sin categoría',
            descripcion: descripcion?.toString()?.trim(),
            importe: importeNum,
            saldo: saldoNum,
        };

        // Agregar campos opcionales si existen
        if (columnIndices.fechaContable !== undefined && row[columnIndices.fechaContable]) {
            transaction.fechaContable = row[columnIndices.fechaContable]?.toString();
        }

        if (columnIndices.clave !== undefined && row[columnIndices.clave]) {
            transaction.clave = row[columnIndices.clave]?.toString();
        }

        if (columnIndices.referencia !== undefined && row[columnIndices.referencia]) {
            transaction.referencia = row[columnIndices.referencia]?.toString();
        }

        if (columnIndices.ref16 !== undefined && row[columnIndices.ref16]) {
            transaction.ref16 = row[columnIndices.ref16]?.toString();
        }

        if (columnIndices.debe !== undefined && row[columnIndices.debe] !== '') {
            transaction.debe = this.parseNumber(row[columnIndices.debe]);
        }

        if (columnIndices.haber !== undefined && row[columnIndices.haber] !== '') {
            transaction.haber = this.parseNumber(row[columnIndices.haber]);
        }

        return transaction;
    }

    private static parseNumber(value: any): number {
        if (value === null || value === undefined || value === '') {
            return 0;
        }

        // Si es string, limpiar y convertir
        if (typeof value === 'string') {
            // Remover puntos de mil y cambiar comas decimales
            const cleaned = value
                .replace(/\./g, '')  // Remover puntos de mil
                .replace(',', '.');  // Cambiar coma decimal por punto

            const num = parseFloat(cleaned);
            return isNaN(num) ? 0 : num;
        }

        // Si ya es número
        const num = parseFloat(value);
        return isNaN(num) ? 0 : num;
    }
}
