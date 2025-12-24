# Implementation Plan - Fixes Round 2

Address reported issues with Maintenance buttons, Dashboard reliability, and Excel Upload layout.

## User Review Required

> [!IMPORTANT]
> **Maintenance Buttons**: The reported "broken" state might be a Z-Index conflict with the Sidebar or issue with the Dialog Portal. I will update the Z-index of the Dialog and Sidebar to ensure the modal appears on top. I will also verify the `Dialog` component file itself.

## Proposed Changes

### 1. Dashboard Logic
#### [MODIFY] [DashboardPage.tsx](file:///d:/desarrollo/finanzas-app/packages/frontend/src/pages/DashboardPage.tsx)
-   **Invalidate Queries**: Add `queryClient.invalidateQueries` to `handleAssignItem` and `handleAssignCategory` to ensure the table and stats refresh immediately after an assignment.

### 2. Excel Upload & Review Layout
#### [MODIFY] [TransactionReviewTable.tsx](file:///d:/desarrollo/finanzas-app/packages/frontend/src/components/dashboard/TransactionReviewTable.tsx)
-   **Column Widths**: Increase `min-w` for Item and Category columns to `250px` to allow combos to fit comfortably.
-   **Logic**: Simplify `itemTypes` check to ensure it doesn't crash if data is loading.

### 3. Maintenance - Buttons & Dialogs
#### [MODIFY] [ItemForm.tsx](file:///d:/desarrollo/finanzas-app/packages/frontend/src/components/items/ItemForm.tsx) & [CategoryForm.tsx](file:///d:/desarrollo/finanzas-app/packages/frontend/src/components/items/CategoryForm.tsx)
-   **Verification**: Ensure strictly correct usage of `Dialog`.

#### [VIEW/MODIFY] [dialog.tsx](file:///d:/desarrollo/finanzas-app/packages/frontend/src/components/ui/dialog.tsx)
-   **Z-Index**: Check if the z-index of the overlay/content is sufficient to overlap the Sidebar (z-50). Bump to z-100 or higher if needed.

## Verification Plan

### Manual Verification
1.  **Dashboard**: Assign an item to a transaction. Verify the row updates and stats refresh automatically without page reload.
2.  **Excel Upload**: Check that the category column is visible and wide enough. Assign "Retenciones" and verify categories appear.
3.  **Maintenance**:
    -   Click "Nuevo Item". Verify Modal opens *over* the sidebar.
    -   Click "Nueva Categoría". Verify Modal opens.
