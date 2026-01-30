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
        const organizationId = (req as any).organizationId;
        const userId = (req as any).user.id;
        
        const uploadRecord = await prisma.excelUpload.create({
            data: {
                filename: file.originalname,
                fileSize: file.size,
                totalRows: result.totalRows,
                processed: false,
                errors: null,
                organizationId,
                userId
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
    console.log(`[finalizeUpload] Request received for ID: ${id}`);

    try {
        const userId = (req as any).user.id;
        const exists = await prisma.excelUpload.findFirst({ where: { id, userId } });
        if (!exists) {
             return res.status(404).json(ApiResponseHelper.error("Not found or access denied"));
        }

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

export const listProcessedUploads = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const uploads = await prisma.excelUpload.findMany({
            where: { processed: true, userId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                filename: true,
                totalRows: true,
                createdAt: true
            }
        });
        res.json(ApiResponseHelper.success(uploads));
    } catch (error: any) {
        console.error('Error listando archivos procesados:', error);
        res.status(500).json(
            ApiResponseHelper.error(`Error al listar archivos: ${error.message}`)
        );
    }
};

export const getUploadDetails = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const userId = (req as any).user.id;
        const upload = await prisma.excelUpload.findFirst({
            where: { id, userId },
            include: {
                _count: {
                    select: { transactions: true }
                }
            }
        });

        if (!upload) {
            return res.status(404).json(
                ApiResponseHelper.error('Archivo no encontrado')
            );
        }

        // Obtener rango de fechas de las transacciones asociadas
        const stats = await prisma.transaction.aggregate({
            where: { excelUploadId: id },
            _min: { fechaValor: true },
            _max: { fechaValor: true },
            _sum: { importe: true }
        });

        res.json(ApiResponseHelper.success({
            ...upload,
            stats: {
                minDate: stats._min.fechaValor,
                maxDate: stats._max.fechaValor,
                totalImporte: stats._sum.importe || 0
            }
        }));
    } catch (error: any) {
        console.error('Error obteniendo detalles del archivo:', error);
        res.status(500).json(
            ApiResponseHelper.error(`Error al obtener detalles: ${error.message}`)
        );
    }
};
