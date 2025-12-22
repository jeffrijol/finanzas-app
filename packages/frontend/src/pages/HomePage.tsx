import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { FileUploadPond } from '@/components/dashboard/FileUploadPond';
import { TransactionReviewTable } from '@/components/dashboard/TransactionReviewTable';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFileUploadFlow } from '@/hooks/useFileUploadFlow';
import { Link } from 'react-router-dom';
import { CheckCircle2, XCircle, BarChart3, TrendingUp } from 'lucide-react';
import { AnnualStatsChart } from '@/components/charts/AnnualStatsChart';

export function HomePage() {
    const {
        uploadedTransactions,
        isReviewMode,
        isUploading,
        isSaving,
        handleFileUpload,
        handleUpdateDraftTransaction,
        handleConfirmAssignments,
        handleCancelReview,
    } = useFileUploadFlow();

    // Fetch items
    const { data: items = [] } = useQuery({
        queryKey: ['items'],
        queryFn: () => apiClient.getItems(),
    });

    // Fetch Stats for Chart (Year 2025)
    // Nota: Usamos getStats sin filtro de fecha para el total anual, o especificamos 
    // fechas si es necesario. El servicio ahora retorna 'porTipoItem'.
    const { data: stats } = useQuery({
        queryKey: ['stats-home-chart'],
        queryFn: () => apiClient.getStats({ startDate: '2025-01-01', endDate: '2025-12-31' }),
    });

    const assignedCount = uploadedTransactions.filter((t) => t.itemAsignadoId).length;
    const allAssigned = assignedCount === uploadedTransactions.length && uploadedTransactions.length > 0;

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Área de Trabajo</h1>
                        <p className="text-slate-500 mt-2 text-lg">
                            Gestión centralizada de tus finanzas e inversiones.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column (2/3): Upload & Work Area */}
                    <div className="lg:col-span-2 space-y-6">
                        {!isReviewMode ? (
                            <Card className="border-dashed border-2 border-slate-200 shadow-none bg-slate-50/50">
                                <CardHeader>
                                    <CardTitle>Cargar Documentos</CardTitle>
                                    <CardDescription>Sube extractos bancarios en formato Excel o CSV</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <FileUploadPond onFileSelect={handleFileUpload} isUploading={isUploading} />
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="border-gray-200 shadow-sm animate-in fade-in slide-in-from-bottom-4">
                                <CardHeader className="bg-slate-50/50 border-b border-gray-100 pb-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                Revisión de Transacciones
                                            </CardTitle>
                                            <p className="text-sm text-slate-500 mt-1">
                                                Asigna categorías antes de sincronizar
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleCancelReview}
                                                disabled={isSaving}
                                            >
                                                <XCircle className="w-4 h-4 mr-2" />
                                                Cancelar
                                            </Button>
                                            <Button
                                                onClick={handleConfirmAssignments}
                                                disabled={isSaving || assignedCount === 0}
                                                size="sm"
                                                className="bg-slate-900 hover:bg-slate-800 text-white"
                                            >
                                                {isSaving ? (
                                                    <>Guardando...</>
                                                ) : (
                                                    <>
                                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                                        Sincronizar {assignedCount > 0 ? `(${assignedCount})` : ''}
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="p-4">
                                        <TransactionReviewTable
                                            transactions={uploadedTransactions}
                                            items={items}
                                            onUpdateTransaction={handleUpdateDraftTransaction}
                                        />
                                    </div>

                                    {!allAssigned && assignedCount > 0 && (
                                        <div className="bg-amber-50 border-t border-amber-100 p-3 flex justify-center">
                                            <p className="text-sm text-amber-800 font-medium">
                                                ⚠️ Solo se guardarán las {assignedCount} transacciones asignadas.
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column (1/3): Charts & Actions */}
                    <div className="space-y-6">
                        {/* Stats Chart - Compact View */}
                        {stats?.porTipoItem ? (
                            <AnnualStatsChart data={stats.porTipoItem} year={2025} />
                        ) : (
                            <Card className="shadow-sm border-slate-200">
                                <CardContent className="h-[200px] flex items-center justify-center text-slate-400">
                                    Cargando estadísticas...
                                </CardContent>
                            </Card>
                        )}

                        <Card className="border-slate-200 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-base font-semibold text-slate-900">Acciones Rápidas</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Link to="/reportes">
                                    <Button variant="outline" className="w-full justify-start hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors">
                                        <TrendingUp className="w-4 h-4 mr-2" />
                                        Ver Reportes Detallados
                                    </Button>
                                </Link>
                                <Link to="/dashboard">
                                    <Button variant="outline" className="w-full justify-start hover:bg-slate-50">
                                        <BarChart3 className="w-4 h-4 mr-2" />
                                        Ir al Histórico
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
