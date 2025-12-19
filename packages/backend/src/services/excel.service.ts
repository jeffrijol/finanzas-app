import * as xlsx from 'xlsx';
import prisma from '../prisma';
import { ExcelTransaction, ExcelProcessingResult } from '../types';

export class ExcelService {
    async parseExcel(buffer: Buffer): Promise<ExcelTransaction[]> {
        const workbook = xlsx.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Parse with header: 1 to get array of arrays, or empty to get list of objects.
        // Using Objects for ease if headers match.
        const rawData = xlsx.utils.sheet_to_json<any>(sheet);

        return rawData.map(row => {
            // Helper to safe parse numbers
            // Assuming the Excel file might return numbers or formatted strings
            const parseNumber = (val: any): number => {
                if (typeof val === 'number') return val;
                if (!val) return 0;
                // Remove currency symbol, spaces, and handle potentially European format if string
                // But xlsx usually parses numbers if the cell is numeric. 
                // If it's text "1.200,50", we need care.
                // Let's assume standard parsing for now, user can refine if format issues arise.
                return parseFloat(val);
            };

            return {
                fechaValor: row['FECHA VALOR'] || new Date().toISOString(), // Fallback or throw?
                categoria: row['CATEGORÍA'] || 'Sin Categoría',
                descripcion: row['DESCRIPCIÓN'] || '',
                importe: parseNumber(row['IMPORTE']),
                saldo: parseNumber(row['SALDO']),
                fechaContable: row['FECHA CONTABLE'],
                clave: row['CLAVE'],
                referencia: row['REFERENCIA'],
                ref16: row['REF. 16'],
                debe: row['DEBE'] ? parseNumber(row['DEBE']) : undefined,
                haber: row['HABER'] ? parseNumber(row['HABER']) : undefined,
            };
        }).filter(t => t.descripcion !== ''); // basic filter
    }

    async processUpload(file: Express.Multer.File, userId?: string): Promise<ExcelProcessingResult> {
        const transactions = await this.parseExcel(file.buffer);

        // Create Upload Record
        const upload = await prisma.excelUpload.create({
            data: {
                filename: file.originalname,
                fileSize: file.size,
                totalRows: transactions.length,
                processed: false,
                userId: userId,
                transactions: {
                    create: transactions.map(t => ({
                        // Map ExcelTransaction to Prisma Transaction Create Input
                        fechaValor: new Date(t.fechaValor), // Ensure date object
                        categoria: t.categoria,
                        descripcion: t.descripcion,
                        importe: t.importe,
                        saldo: t.saldo,
                        metadata: JSON.stringify({
                            fechaContable: t.fechaContable,
                            clave: t.clave,
                            referencia: t.referencia,
                            ref16: t.ref16,
                            debe: t.debe,
                            haber: t.haber
                        })
                    }))
                }
            },
            include: {
                transactions: true
            }
        });

        // Mark as processed (if we had async queues, we'd do this later)
        await prisma.excelUpload.update({
            where: { id: upload.id },
            data: { processed: true }
        });

        return {
            totalRows: transactions.length,
            processedRows: transactions.length,
            errors: [],
            transactions: transactions
        };
    }
}

export const excelService = new ExcelService();
