import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileUploadCardProps {
    onFileUpload: (file: File) => void;
    isUploading: boolean;
}

export function FileUploadCard({ onFileUpload, isUploading }: FileUploadCardProps) {
    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            if (acceptedFiles.length > 0) {
                onFileUpload(acceptedFiles[0]);
            }
        },
        [onFileUpload]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'text/csv': ['.csv'],
        },
        multiple: false,
        disabled: isUploading,
    });

    return (
        <Card
            {...getRootProps()}
            className={cn(
                'border-2 border-dashed transition-all cursor-pointer',
                isDragActive && 'border-emerald-500 bg-emerald-500/5',
                !isDragActive && 'border-slate-700 hover:border-emerald-500/50',
                isUploading && 'opacity-50 cursor-not-allowed'
            )}
        >
            <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <input {...getInputProps()} />

                <div className="mb-4">
                    {isUploading ? (
                        <Loader2 className="h-16 w-16 text-emerald-500 animate-spin" />
                    ) : (
                        <div className="relative">
                            <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />
                            <FileSpreadsheet className="h-16 w-16 text-emerald-500 relative z-10" />
                        </div>
                    )}
                </div>

                <h3 className="text-xl font-semibold mb-2">
                    {isUploading ? 'Subiendo archivo...' : 'Subir archivo Excel'}
                </h3>

                <p className="text-muted-foreground mb-6 max-w-md">
                    {isDragActive
                        ? '¡Suelta el archivo aquí!'
                        : 'Arrastra tu archivo aquí o haz click para buscar'}
                </p>

                {!isUploading && (
                    <>
                        <Button variant="outline" className="mb-4">
                            <Upload className="mr-2 h-4 w-4" />
                            Seleccionar archivo
                        </Button>

                        <p className="text-xs text-muted-foreground">
                            Formatos soportados: .xlsx, .csv
                        </p>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
