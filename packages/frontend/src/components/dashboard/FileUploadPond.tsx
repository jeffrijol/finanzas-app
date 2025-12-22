import { FilePond, registerPlugin } from 'react-filepond';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import 'filepond/dist/filepond.min.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Registrar plugin
registerPlugin(FilePondPluginFileValidateType);

interface FileUploadPondProps {
    onFileSelect: (file: File) => void;
    isUploading: boolean;
}

export function FileUploadPond({ onFileSelect, isUploading }: FileUploadPondProps) {
    return (
        <Card className="border-gray-200 shadow-sm">
            <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-800">
                    Cargar Extracto Bancario
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                    Sube un archivo Excel o CSV con tus transacciones para revisarlas y asignarles un ítem
                </p>
            </CardHeader>
            <CardContent>
                <FilePond
                    allowMultiple={false}
                    maxFiles={1}
                    disabled={isUploading}
                    acceptedFileTypes={[
                        'application/vnd.ms-excel',
                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        'text/csv',
                    ]}
                    labelIdle='<div class="filepond-label-wrapper"><span class="filepond-label-main">Arrastra tu archivo aquí</span><span class="filepond-label-sub">o haz clic para buscar (Excel o CSV)</span></div>'
                    labelFileProcessing="Procesando archivo..."
                    labelFileProcessingComplete="Archivo procesado"
                    labelTapToCancel="toca para cancelar"
                    labelTapToRetry="toca para reintentar"
                    credits={false}
                    onaddfile={(error, file) => {
                        if (!error && file.file) {
                            onFileSelect(file.file as File);
                        }
                    }}
                />
            </CardContent>
        </Card>
    );
}
