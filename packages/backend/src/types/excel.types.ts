import { ExcelTransaction } from "./transaction.types";

export interface ExcelHeaderMapping {
    fechaValor: string;
    categoria: string;
    descripcion: string;
    importe: string;
    saldo: string;
    [key: string]: string;
}

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

export interface ExcelUploadRequest {
    filename: string;
    fileSize: number;
    userId?: string;
}