import { Request, Response } from 'express';
import { ExcelParser } from '../utils/excelParser';
import { ApiResponseHelper } from '../utils/apiResponse';
import { uploadSchema } from '../utils/validators';

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

        // Retornar transacciones parseadas para revisión en el frontend
        res.json(ApiResponseHelper.success(
            {
                filename: file.originalname,
                fileSize: file.size,
                totalRows: result.totalRows,
                processed: true,
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

