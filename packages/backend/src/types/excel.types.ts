import { ExcelTransaction } from "./transaction.types";

export interface ExcelProcessingResult {
    totalRows: number;
    processedRows: number;
    errors: ExcelProcessingError[];
    transactions: ExcelTransaction[];
}

export interface ExcelProcessingError {
    row: number;
    column: string;
    value: any;
    error: string;
}

export interface ExcelUploadResponse {
    success: boolean;
    message: string;
    totalProcessed: number;
    totalErrors: number;
    errors?: ExcelProcessingError[];
}