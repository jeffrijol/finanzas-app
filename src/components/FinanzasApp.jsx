/* // src/components/FinanzasApp.jsx
import { useState } from 'preact/hooks';
import FileUpload from './FileUpload.jsx';
import TransactionTable from './TransactionTable.jsx';
import SummaryTable from './SummaryTable.jsx';
import ExportButtons from './ExportButtons.jsx';

export default function FinanzasApp() {
  const [transactions, setTransactions] = useState([]);

  return (
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-center mb-8 text-blue-600">
        Gestión Financiera Avance
      </h1>
      
      <FileUpload setTransactions={setTransactions} />
      
      <div class="mt-8">
        <TransactionTable 
          transactions={transactions} 
          setTransactions={setTransactions} 
        />
      </div>
      
      <div class="mt-8">
        <SummaryTable transactions={transactions} />
      </div>
      
      <div class="mt-8">
        <ExportButtons transactions={transactions} />
      </div>
    </div>
  );
} */

  // src/components/FinanzasApp.jsx
import { TransactionsProvider } from '../context/TransactionsContext';
import FileUpload from './FileUpload.jsx';
import TransactionTable from './TransactionTable.jsx';
import SummaryTable from './SummaryTable.jsx';
import ExportButtons from './ExportButtons.jsx';
import LoadingSpinner from './LoadingSpinner.jsx';
import ErrorMessage from './ErrorMessage.jsx';

export default function FinanzasApp() {
  return (
    <TransactionsProvider>
      <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold text-center mb-8 text-blue-600">
          Gestión Financiera Personal
        </h1>
        
        <FileUpload />
        <LoadingSpinner />
        <ErrorMessage />
        
        <div class="mt-8">
          <TransactionTable />
        </div>
        
        <div class="mt-8">
          <SummaryTable />
        </div>
        
        <div class="mt-8">
          <ExportButtons />
        </div>
      </div>
    </TransactionsProvider>
  );
}