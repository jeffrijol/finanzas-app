import React from 'react';
import { Button } from '@/components/ui/button';
import { usePDFExport } from '@/hooks/usePDFExport';
import { FileText, Loader2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface DownloadReportButtonProps {
    variant?: 'default' | 'outline' | 'secondary' | 'ghost';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    className?: string;
}

export const DownloadReportButton: React.FC<DownloadReportButtonProps> = ({
    variant = 'outline',
    size = 'default',
    className
}) => {
    const { generateDashboardPDF, isGenerating } = usePDFExport();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant={variant}
                    size={size}
                    disabled={isGenerating}
                    className={`gap-2 ${className}`}
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="hidden sm:inline">Generando...</span>
                        </>
                    ) : (
                        <>
                            <FileText className="h-4 w-4" />
                            <span className="hidden sm:inline">Reporte PDF</span>
                        </>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-xs text-gray-500 font-medium">
                    Exportar Dashboard Actual
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    onClick={() => generateDashboardPDF()}
                    disabled={isGenerating}
                    className="cursor-pointer py-3"
                >
                    <div className="flex flex-col gap-1">
                        <span className="font-medium">Reporte Completo</span>
                        <span className="text-xs text-gray-500">
                            Incluye gráficos, resumen y ultimas transacciones filtradas.
                        </span>
                    </div>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <div className="px-2 py-1.5 text-xs text-gray-400 italic">
                    El PDF respetará todos los filtros activos (Año, Trimestre, Búsqueda, etc.)
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
