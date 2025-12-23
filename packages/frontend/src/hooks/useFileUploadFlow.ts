import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
    tempId?: string;
    id?: string;
    fechaValor: string;
    descripcion: string;
    importe: number;
    categoria: string;
    itemAsignadoId?: string | null;
    categoryId?: string | null;
}

export function useFileUploadFlow() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [uploadedTransactions, setUploadedTransactions] = useState<Transaction[]>([]);
    const [isReviewMode, setIsReviewMode] = useState(false);

    // Mutación para procesar el archivo (sin guardar en BD)
    const uploadMutation = useMutation({
        mutationFn: (file: File) => apiClient.uploadFile(file),
        onSuccess: (data) => {
            // Agregar tempId a cada transacción
            const transactionsWithTempId = data.transactions?.map((t: any, index: number) => ({
                ...t,
                tempId: `temp-${Date.now()}-${index}`,
                itemAsignadoId: null,
            })) || [];

            setUploadedTransactions(transactionsWithTempId);
            setIsReviewMode(true);

            toast({
                title: 'Archivo procesado',
                description: `Se cargaron ${data.totalRows || transactionsWithTempId.length} transacciones. Asigna los items y confirma para guardar.`,
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

    // Mutación para guardar todas las transacciones en BD
    const confirmMutation = useMutation({
        mutationFn: async (transactions: Transaction[]) => {
            // Guardar cada transacción individualmente
            const promises = transactions.map((t) =>
                apiClient.createTransaction({
                    fechaValor: t.fechaValor,
                    descripcion: t.descripcion,
                    importe: t.importe,
                    categoria: t.categoria,
                    itemAsignadoId: t.itemAsignadoId || null,
                    categoryId: t.categoryId || null,
                })
            );
            return Promise.all(promises);
        },
        onSuccess: (_, variables) => {
            toast({
                title: 'Transacciones guardadas',
                description: `Se guardaron ${variables.length} transacciones en la base de datos.`,
            });

            // Limpiar el estado
            setUploadedTransactions([]);
            setIsReviewMode(false);

            // Invalidar queries para actualizar datos
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
        },
        onError: (error: Error) => {
            toast({
                title: 'Error al guardar',
                description: error.message,
                variant: 'destructive',
            });
        },
    });

    const handleFileUpload = (file: File) => {
        uploadMutation.mutate(file);
    };

    const handleUpdateDraftTransaction = (transactionId: string, updates: any) => {
        setUploadedTransactions((prev) =>
            prev.map((t) => {
                if (t.tempId !== transactionId) return t;

                // Si 'updates' es un string/null (legacy) lo tratamos como itemId
                if (typeof updates === 'string' || updates === null) {
                    return { ...t, itemAsignadoId: updates };
                }

                // Si es objeto, hacemos merge
                return { ...t, ...updates };
            })
        );
    };

    const handleConfirmAssignments = () => {
        // Filtrar transacciones que tengan item asignado
        const transactionsToSave = uploadedTransactions.filter((t) => t.itemAsignadoId);

        if (transactionsToSave.length === 0) {
            toast({
                title: 'Sin transacciones asignadas',
                description: 'Debes asignar al menos un item antes de confirmar.',
                variant: 'destructive',
            });
            return;
        }

        confirmMutation.mutate(transactionsToSave);
    };

    const handleCancelReview = () => {
        setUploadedTransactions([]);
        setIsReviewMode(false);
    };

    return {
        uploadedTransactions,
        isReviewMode,
        isUploading: uploadMutation.isPending,
        isSaving: confirmMutation.isPending,
        handleFileUpload,
        handleUpdateDraftTransaction,
        handleConfirmAssignments,
        handleCancelReview,
    };
}
