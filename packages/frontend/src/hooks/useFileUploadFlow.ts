import { useState, useEffect, useRef, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

export type TransactionState = 'draft' | 'assigned' | 'synced';

export interface ReviewTransaction {
    tempId: string;
    id?: string;
    fechaValor: string;
    descripcion: string;
    importe: number;
    categoria: string;
    itemAsignadoId?: string | null;
    categoryId?: string | null;
    state: TransactionState;
    isDirty: boolean;
}

const STORAGE_KEY = 'finanzas_app_upload_session';

export function useFileUploadFlow() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Initialize state from localStorage if available
    const [uploadedTransactions, setUploadedTransactions] = useState<ReviewTransaction[]>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    });

    const [uploadId, setUploadId] = useState<string | null>(() => {
        return localStorage.getItem('finanzas_app_upload_id');
    });

    const [isReviewMode, setIsReviewMode] = useState<boolean>(() => {
        return uploadedTransactions.length > 0;
    });

    // Ref to track if user is interacting (for debounce auto-save)
    const lastInteractionRef = useRef<number>(Date.now());

    // Persist to localStorage whenever transactions change
    useEffect(() => {
        if (uploadedTransactions.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(uploadedTransactions));
            setIsReviewMode(true);
        } else {
            localStorage.removeItem(STORAGE_KEY);
            setIsReviewMode(false);
        }
    }, [uploadedTransactions]);

    // Cleanup valid/old sessions (optional logic could go here)

    // Mutation to process file
    const uploadMutation = useMutation({
        mutationFn: (file: File) => apiClient.uploadFile(file),
        onSuccess: (data) => {
            const transactions: ReviewTransaction[] = data.transactions?.map((t: any, index: number) => ({
                ...t,
                tempId: `temp-${Date.now()}-${index}`,
                itemAsignadoId: null,
                categoryId: null,
                state: 'draft',
                isDirty: false,
            })) || [];

            setUploadedTransactions(transactions);
            if (data.id) {
                setUploadId(data.id);
                localStorage.setItem('finanzas_app_upload_id', data.id);
            }
            toast({
                title: 'Archivo procesado',
                description: `Se cargaron ${data.totalRows || transactions.length} transacciones.`,
            });
        },
        onError: (error: Error) => {
            toast({
                title: 'Error al procesar archivo',
                description: error.message,
                variant: 'destructive',
            });
        },
    });

    // Mutation to save (upsert)
    const saveMutation = useMutation({
        mutationFn: async (transactions: ReviewTransaction[]) => {
            const promises = transactions.map(async (t) => {
                if (t.id) {
                    // Update existing
                    const updated = await apiClient.updateTransaction(t.id, {
                        itemAsignadoId: t.itemAsignadoId,
                        categoryId: t.categoryId,
                    });
                    return { ...updated, tempId: t.tempId };
                } else {
                    // Create new
                    const created = await apiClient.createTransaction({
                        fechaValor: t.fechaValor,
                        descripcion: t.descripcion,
                        importe: t.importe,
                        categoria: t.categoria,
                        itemAsignadoId: t.itemAsignadoId || null,
                        categoryId: t.categoryId || null,
                        // @ts-ignore - Valid prop now
                        excelUploadId: uploadId,
                    });
                    return { ...created, tempId: t.tempId };
                }
            });
            return Promise.all(promises);
        },
        onSuccess: (savedTransactions) => {
            // Update local state: mark synced and clean dirty flag
            setUploadedTransactions((prev) =>
                prev.map((t) => {
                    const saved = savedTransactions.find((st: any) => st.tempId === t.tempId);
                    if (saved) {
                        return {
                            ...t,
                            id: saved.id,
                            state: 'synced',
                            isDirty: false,
                        };
                    }
                    return t;
                })
            );

            // Refresh dashboard data
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
        },
        onError: (error: Error) => {
            console.error('Save error', error);
            // Optional: Toast error
        }
    });

    const handleFileUpload = (file: File) => {
        uploadMutation.mutate(file);
    };

    const handleUpdateDraftTransaction = (transactionId: string, updates: any) => {
        lastInteractionRef.current = Date.now();

        setUploadedTransactions((prev) =>
            prev.map((t) => {
                if (t.tempId !== transactionId) return t;

                let updatedT = { ...t };

                // Handle updates
                if (typeof updates === 'string' || updates === null) {
                    updatedT.itemAsignadoId = updates;
                } else {
                    updatedT = { ...updatedT, ...updates };
                }

                // Logic for state transition
                const hasItem = !!updatedT.itemAsignadoId;

                if (hasItem) {
                    // If we are just restoring a value that matches 'synced' state, ideally we check that
                    // But for now, any manual change marks it as assigned/dirty unless we do deep compare.
                    // Let's assume manual change = dirty.
                    updatedT.state = 'assigned';
                } else {
                    updatedT.state = 'draft';
                }

                updatedT.isDirty = true;

                return updatedT;
            })
        );
    };


    // Save Partial: Saves all 'assigned' (dirty) transactions
    const handleSavePartial = useCallback(async (silent = false) => {
        // We save anything that is dirty and has an item assigned
        // OR anything that is 'assigned' state (redundant but safe)
        const transactionsToSave = uploadedTransactions.filter(
            (t) => (t.isDirty || t.state === 'assigned') && t.itemAsignadoId
        );

        if (transactionsToSave.length === 0) {
            if (!silent) {
                toast({ title: 'Nada que guardar', description: 'No hay cambios pendientes confirmados.' });
            }
            return;
        }

        try {
            await saveMutation.mutateAsync(transactionsToSave);
            if (!silent) {
                toast({ title: 'Cambios guardados', description: `Se sincronizaron ${transactionsToSave.length} transacciones.` });
            }
        } catch (e) {
            if (!silent) throw e;
        }
    }, [uploadedTransactions, toast, saveMutation]);

    // Save with Feedback (Toast updates)
    const saveWithFeedback = async () => {
        const { id, update } = toast({
            title: '🔄 Guardando cambios...',
            description: 'Sincronizando con el servidor, por favor espera.',
            duration: Infinity, // Keep open until done
        });

        try {
            await handleSavePartial(true); // Run silent logic
            update({
                id, // Update existing toast
                title: '✅ Guardado exitoso',
                description: 'Todas las transacciones asignadas han sido sincronizadas.',
                duration: 2000,
                variant: 'default', // or specific success style if available
            });
        } catch (error) {
            update({
                id,
                title: '❌ Error al guardar',
                description: 'Hubo un problema al sincronizar. Intenta nuevamente.',
                variant: 'destructive',
                duration: 3000,
            });
        }
    };

    // Bulk Assign
    const handleBulkAssign = (transactionIds: string[], itemId: string) => {
        const timestamp = Date.now();
        lastInteractionRef.current = timestamp;

        setUploadedTransactions((prev) =>
            prev.map((t) => {
                if (transactionIds.includes(t.tempId)) {
                    return {
                        ...t,
                        itemAsignadoId: itemId,
                        state: 'assigned',
                        isDirty: true,
                    };
                }
                return t;
            })
        );

        toast({
            title: 'Asignación masiva aplicada',
            description: `Se actualizó el item para ${transactionIds.length} transacciones.`,
        });
    };

    // Export State
    const exportReviewState = () => {
        const data = {
            exportedAt: new Date().toISOString(),
            total: uploadedTransactions.length,
            transactions: uploadedTransactions
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `finanzas-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast({
            title: 'Respaldo exportado',
            description: 'El archivo JSON se ha descargado correctamente.',
        });
    };

    // Finalize: Clear everything
    const handleFinalizeQuarter = async () => {
        // Ensure everything is saved
        const unsaved = uploadedTransactions.filter((t) => t.state !== 'synced' && t.itemAsignadoId);

        if (unsaved.length > 0) {
            await handleSavePartial(true);
        }

        if (uploadId) {
            try {
                console.log('Finalizing upload with ID:', uploadId);
                await apiClient.finalizeUpload(uploadId);

                // Clear storage and state ONLY if successful
                localStorage.removeItem(STORAGE_KEY);
                localStorage.removeItem('finanzas_app_upload_id');
                setUploadedTransactions([]);
                setUploadId(null);
                setIsReviewMode(false);

                toast({ title: 'Trimestre finalizado', description: 'Todas las transacciones se han procesado exitosamente.' });
            } catch (e: any) {
                console.error('Error finalizing upload', e);
                toast({
                    title: 'Error al finalizar',
                    description: `No se pudo marcar como finalizado: ${e.message || 'Error desconocido'}`,
                    variant: 'destructive'
                });
            }
        } else {
            console.warn('No uploadId found to finalize.');
            // Still clear if there's no upload ID? Maybe just warn.
            // But if we want to reset UI:
            localStorage.removeItem(STORAGE_KEY);
            setUploadedTransactions([]);
            setIsReviewMode(false);
            toast({ title: 'Trimestre finalizado (Local)', description: 'Se limpiaron los datos locales, pero no se vinculó a una carga.' });
        }
    };

    const handleCancelReview = () => {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem('finanzas_app_upload_id');
        setUploadedTransactions([]);
        setUploadId(null);
        setIsReviewMode(false);
    };

    // Auto-Save Effect
    useEffect(() => {
        const intervalId = setInterval(() => {
            const timeSinceInteraction = Date.now() - lastInteractionRef.current;
            // Only auto-save if user hasn't interacted in last 2 seconds (debounce)
            // and there are dirty items
            if (timeSinceInteraction > 2000) {
                const dirtyCount = uploadedTransactions.filter(t => t.isDirty && t.itemAsignadoId).length;
                if (dirtyCount > 0 && !saveMutation.isPending) {
                    console.log('Auto-saving...', dirtyCount, 'items');
                    handleSavePartial(true);
                }
            }
        }, 60000); // Check every 60 seconds for more responsive auto-save

        return () => clearInterval(intervalId);
    }, [handleSavePartial, uploadedTransactions, saveMutation.isPending]);

    return {
        uploadedTransactions,
        isReviewMode,
        isUploading: uploadMutation.isPending,
        isSaving: saveMutation.isPending,
        handleFileUpload,
        handleUpdateDraftTransaction,
        handleSavePartial,
        saveWithFeedback,
        handleBulkAssign,
        exportReviewState,
        handleFinalizeQuarter,
        handleCancelReview,
    };
}
