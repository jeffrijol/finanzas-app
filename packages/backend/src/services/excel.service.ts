import { ExcelParser } from '../utils/excelParser';
import { ExcelProcessingResult, ExcelUploadResponse } from '../types/excel.types';
import prisma from '../lib/prisma';

export class ExcelService {
    static async processExcelFile(
        buffer: Buffer,
        filename: string,
        fileSize: number,
        userId?: string
    ): Promise<ExcelUploadResponse> {
        try {
            // Parsear el archivo Excel
            const result: ExcelProcessingResult = ExcelParser.parse(buffer);

            if (result.transactions.length === 0) {
                return {
                    success: false,
                    message: 'No se encontraron transacciones válidas en el archivo',
                    totalProcessed: 0,
                    totalErrors: result.errors.length,
                    errors: result.errors,
                };
            }

            // 1. Crear registro de Upload Record
            const upload = await prisma.excelUpload.create({
                data: {
                    filename,
                    fileSize,
                    totalRows: result.totalRows,
                    processed: true, // Optimistamente procesado si el parseo funciono
                    userId: userId,
                    errors: result.errors.length > 0 ? JSON.stringify(result.errors) : null,
                }
            });

            // 2. Preparar transacciones para la base de datos
            const transactionsToCreate = result.transactions.map(t => ({
                fechaValor: new Date(t.fechaValor),
                categoria: t.categoria,
                descripcion: t.descripcion,
                importe: t.importe,
                saldo: t.saldo,
                excelUploadId: upload.id, // Link to upload
                metadata: JSON.stringify({ // Stringify for SQLite
                    fechaContable: t.fechaContable,
                    clave: t.clave,
                    referencia: t.referencia,
                    ref16: t.ref16,
                    debe: t.debe,
                    haber: t.haber,
                    filename,
                    processedAt: new Date().toISOString(),
                }),
            }));

            // 3. Insertar transacciones en batch
            // SQLite tiene limite de variables en placeholders, asi que mejor hacerlo en chunks o secuencial dentro de una transaccion
            await prisma.$transaction(async (tx) => {
                for (const transaction of transactionsToCreate) {
                    await tx.transaction.create({
                        data: transaction,
                    });
                }
            });

            return {
                success: true,
                message: `Archivo procesado exitosamente. ${transactionsToCreate.length} transacciones importadas.`,
                totalProcessed: transactionsToCreate.length,
                totalErrors: result.errors.length,
                errors: result.errors.length > 0 ? result.errors : undefined,
            };
        } catch (error: any) {
            console.error('Error procesando archivo Excel:', error);
            throw new Error(`Error al procesar el archivo Excel: ${error.message}`);
        }
    }

    static async validateExcelFile(buffer: Buffer): Promise<ExcelProcessingResult> {
        return ExcelParser.parse(buffer);
    }
}
