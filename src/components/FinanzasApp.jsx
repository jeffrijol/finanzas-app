// src/components/FinanzasApp.jsx
import { TransactionsProvider } from '../context/TransactionsContext';
import FileUpload from './FileUpload.jsx';
import TransactionTable from './TransactionTable.jsx';
import ExportButtons from './ExportButtons.jsx';
import LoadingSpinner from './LoadingSpinner.jsx';
import ErrorMessage from './ErrorMessage.jsx';

export default function FinanzasApp() {
  return (
    <TransactionsProvider>
      <div className="space-y-6">
        <FileUpload />
        <LoadingSpinner />
        <ErrorMessage />
        <TransactionTable />
        <ExportButtons />
      </div>
    </TransactionsProvider>
  );
}