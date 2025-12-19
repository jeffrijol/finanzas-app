import { ApiResponse } from '../types/api.types';

export class ApiResponseHelper {
    static success<T>(data: T, message?: string, meta?: any): ApiResponse<T> {
        return {
            success: true,
            data,
            message,
            meta,
            timestamp: new Date().toISOString(),
        };
    }

    static error(message: string, error?: any): ApiResponse {
        return {
            success: false,
            message,
            error: typeof error === 'string' ? error : (error?.message || message),
            meta: {
                details: error
            },
            timestamp: new Date().toISOString(),
        };
    }

    static paginated<T>(
        data: T[],
        total: number,
        page: number,
        limit: number
    ): ApiResponse<T[]> {
        const totalPages = Math.ceil(total / limit);
        return {
            success: true,
            data,
            meta: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
        };
    }
}
