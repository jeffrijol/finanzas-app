import { Request, Response } from 'express';
import { ExcelParser } from '../utils/excelParser';
import { ApiResponseHelper } from '../utils/apiResponse';
import { uploadSchema } from '../utils/validators';
import prisma from '../lib/prisma';

export const uploadFile = async (req: Request, res: Response) => {
    // Validar con Zod
    const validation = uploadSchema.safeParse({ file: req.file });

    if (!validation.success) {
        return res.status(400).json(
            ApiResponseHelper.error('Archivo inválido', validation.error.issues)
        );
    }

    const file = req.file!;

    try {
        // Parsear el archivo Excel/CSV sin guardar en BD
        const result = ExcelParser.parse(file.buffer);

        if (result.transactions.length === 0) {
            return res.status(400).json(
                ApiResponseHelper.error('No se encontraron transacciones válidas en el archivo')
            );
        }

        // Crear registro en ExcelUpload
        const uploadRecord = await prisma.excelUpload.create({
            data: {
                filename: file.originalname,
                fileSize: file.size,
                totalRows: result.totalRows,
                processed: false,
                errors: null
            }
        });

        // Retornar transacciones parseadas para revisión en el frontend
        res.json(ApiResponseHelper.success(
            {
                id: uploadRecord.id,
                filename: file.originalname,
                fileSize: file.size,
                totalRows: result.totalRows,
                processed: false,
                transactions: result.transactions,
            },
            `Se procesaron ${result.transactions.length} transacciones. Revisa y confirma para guardar.`
        ));
    } catch (error: any) {
        console.error('Error procesando archivo:', error);
        res.status(500).json(
            ApiResponseHelper.error(`Error al procesar el archivo: ${error.message}`)
        );
    }
};

export const finalizeUpload = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const upload = await prisma.excelUpload.update({
            where: { id },
            data: { processed: true }
        });

        res.json(ApiResponseHelper.success(upload, 'Carga finalizada correctamente'));
    } catch (error: any) {
        console.error('Error finalizando carga:', error);
        res.status(500).json(
            ApiResponseHelper.error(`Error al finalizar la carga: ${error.message}`)
        );
    }
};

