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

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { FileUploadPond } from '@/components/dashboard/FileUploadPond';
import { TransactionReviewTable } from '@/components/dashboard/TransactionReviewTable';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFileUploadFlow } from '@/hooks/useFileUploadFlow';
import { Link } from 'react-router-dom';
import { CheckCircle2, XCircle, BarChart3, TrendingUp, Save, CheckCheck } from 'lucide-react';
import { AnnualStatsChart } from '@/components/charts/AnnualStatsChart';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function HomePage() {
    const {
        uploadedTransactions,
        isReviewMode,
        isUploading,
        isSaving,
        handleFileUpload,
        handleUpdateDraftTransaction,
        handleSavePartial,
        handleFinalizeQuarter,
        handleCancelReview,
    } = useFileUploadFlow();

    // Filtro para mostrar/ocultar sincronizados
    const [hideSynced, setHideSynced] = useState(false);

    // Fetch items
    const { data: items = [] } = useQuery({
        queryKey: ['items'],
        queryFn: () => apiClient.getItems(),
    });

    const { data: stats } = useQuery({
        queryKey: ['stats-home-chart'],
        queryFn: () => apiClient.getStats({ startDate: '2025-01-01', endDate: '2025-12-31' }),
    });

    // Cálculos de progreso
    const total = uploadedTransactions.length;
    const assigned = uploadedTransactions.filter(t => t.itemAsignadoId).length;
    const synced = uploadedTransactions.filter(t => t.state === 'synced' && !t.isDirty).length;

    const assignedPercent = total > 0 ? (assigned / total) * 100 : 0;
    const syncedPercent = total > 0 ? (synced / total) * 100 : 0;

    // Filtrado visual
    const visibleTransactions = hideSynced
        ? uploadedTransactions.filter(t => t.state !== 'synced' || t.isDirty)
        : uploadedTransactions;

    const canFinalize = total > 0 && assigned === total && synced === total;

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

                <div className={`grid grid-cols-1 gap-8 ${!isReviewMode ? 'lg:grid-cols-3' : ''}`}>
                    {/* Left Column (2/3): Upload & Work Area */}
                    <div className={!isReviewMode ? 'lg:col-span-2 space-y-6' : 'space-y-6'}>
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
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                    Revisión de Transacciones
                                                </CardTitle>
                                                <p className="text-sm text-slate-500 mt-1">
                                                    Progreso del trimestre
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setHideSynced(!hideSynced)}
                                                    className="text-xs"
                                                >
                                                    {hideSynced ? 'Mostrar Todo' : 'Ocultar Sincronizados'}
                                                </Button>
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
                                                    onClick={() => handleSavePartial(false)}
                                                    disabled={isSaving}
                                                    size="sm"
                                                    variant="secondary"
                                                    className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                                                >
                                                    {isSaving ? 'Guardando...' : (
                                                        <>
                                                            <Save className="w-4 h-4 mr-2" />
                                                            Guardar Parcial
                                                        </>
                                                    )}
                                                </Button>

                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            size="sm"
                                                            className="bg-slate-900 hover:bg-slate-800 text-white"
                                                            disabled={assigned < total || isSaving}
                                                        >
                                                            <CheckCheck className="w-4 h-4 mr-2" />
                                                            Finalizar Trimestre
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>¿Confirmar cierre de trimestre?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Has asignado {assigned} de {total} transacciones.
                                                                Esto limpiará la mesa de trabajo y guardará todos los cambios pendientes.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                            <AlertDialogAction onClick={handleFinalizeQuarter}>
                                                                Confirmar y Finalizar
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </div>

                                        {/* Progress Stats */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs text-slate-500 font-medium">
                                                <span>Asignadas: {assigned}/{total}</span>
                                                <span>Sincronizadas: {synced}/{total}</span>
                                            </div>
                                            {/* Custom Progress Bar since component install failed */}
                                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden flex">
                                                <div
                                                    className="h-full bg-green-500 transition-all duration-500 ease-out"
                                                    style={{ width: `${syncedPercent}%` }}
                                                />
                                                <div
                                                    className="h-full bg-blue-400 transition-all duration-500 ease-out"
                                                    style={{ width: `${assignedPercent - syncedPercent}%` }}
                                                />
                                            </div>
                                            <div className="flex gap-4 text-xs">
                                                <div className="flex items-center gap-1">
                                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                                    <span className="text-slate-600">Sincronizado</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                                                    <span className="text-slate-600">Asignado (No guardado)</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <div className="w-2 h-2 rounded-full bg-gray-200" />
                                                    <span className="text-slate-400">Pendiente</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="p-4">
                                        <TransactionReviewTable
                                            transactions={visibleTransactions}
                                            items={items}
                                            onUpdateTransaction={handleUpdateDraftTransaction}
                                        />
                                    </div>

                                    {assigned < total && (
                                        <div className="bg-amber-50 border-t border-amber-100 p-3 flex justify-center">
                                            <p className="text-sm text-amber-800 font-medium">
                                                ⚠️ Faltan {total - assigned} transacciones por asignar.
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column (1/3): Charts & Actions */}
                    {!isReviewMode && (
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
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
