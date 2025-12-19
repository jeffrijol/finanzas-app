import { Request, Response } from 'express';
import { excelService } from '../services/excel.service';

export const uploadFile = async (req: Request, res: Response) => {
    if (!req.file) {
        throw new Error('No file uploaded');
    }

    const result = await excelService.processUpload(req.file);

    res.json({
        success: true,
        data: result
    });
};
