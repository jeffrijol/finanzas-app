
# Plan: UI Improvements for Transaction Review

## Objective
Enhance the user experience in the Transaction Review mode by preventing redundant actions and adding safeguards against accidental data loss.

## Changes

### 1. "Guardar Parcial" Button Logic
- **Current Behavior**: The button is enabled unless `isSaving` is true.
- **New Behavior**: The button should also be disabled when all transactions have been assigned (`assigned === total`). This encourages the user to use "Finalizar Trimestre" instead when the work is complete.
- **Implementation**: Update the `disabled` prop on the "Guardar Parcial" button in `HomePage.tsx`.

### 2. "Cancelar" Button Safeguard
- **Current Behavior**: Clicking "Cancelar" immediately executes `handleCancelReview`.
- **New Behavior**: Clicking "Cancelar" should trigger a confirmation dialog (AlertDialog) warning the user that unsaved progress might be lost or that the review session will be aborted.
- **Implementation**:
    - Build a new `AlertDialog` structure around the "Cancelar" button or use a state to control an open dialog.
    - Since `AlertDialog` is already imported and used for "Finalizar Trimestre", we can reuse these components.
    - The dialog should ask for confirmation before calling `handleCancelReview`.

## File: `packages/frontend/src/pages/HomePage.tsx`

```tsx
// 1. Guardar Parcial
<Button
    onClick={() => saveWithFeedback()}
    disabled={isSaving || assigned === total} // Added check
    // ...
>
    {/* ... */}
</Button>

// 2. Cancelar
<AlertDialog>
    <AlertDialogTrigger asChild>
        <Button
            variant="outline"
            size="sm"
            disabled={isSaving}
        >
            <XCircle className="w-4 h-4 mr-2" />
            Cancelar
        </Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
        <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar revisión?</AlertDialogTitle>
            <AlertDialogDescription>
                Si cancelas ahora, perderás el progreso no guardado de esta sesión de revisión. ¿Estás seguro de que deseas salir?
            </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
            <AlertDialogCancel>Continuar Revisando</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelReview} className="bg-red-600 hover:bg-red-700">
                Sí, Cancelar
            </AlertDialogAction>
        </AlertDialogFooter>
    </AlertDialogContent>
</AlertDialog>
```
