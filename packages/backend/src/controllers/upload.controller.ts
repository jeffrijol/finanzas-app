import { Request, Response } from 'express';
import { ExcelService } from '../services/excel.service';
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
    const result = await ExcelService.processExcelFile(
        file.buffer,
        file.originalname,
        file.size
    );

    if (!result.success) {
        res.status(400).json(ApiResponseHelper.error(result.message, result.errors));
        return;
    }

    res.json(ApiResponseHelper.success(
        {
            totalProcessed: result.totalProcessed,
            totalErrors: result.totalErrors,
            errors: result.errors
        },
        result.message
    ));
};
