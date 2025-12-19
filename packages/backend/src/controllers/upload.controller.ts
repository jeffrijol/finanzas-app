import { Request, Response } from 'express';
import { ExcelService } from '../services/excel.service';
import { ApiResponseHelper } from '../utils/apiResponse';

export const uploadFile = async (req: Request, res: Response) => {
    if (!req.file) {
        throw new Error('No file uploaded');
    }

    // Default 10MB limit check handled by multer/env usually, but explicit check good too
    // req.userId would come from auth middleware if we had it
    const result = await ExcelService.processExcelFile(
        req.file.buffer,
        req.file.originalname,
        req.file.size
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
