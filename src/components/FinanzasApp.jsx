// src/components/FinanzasApp.jsx
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
        Gestión Financiera Personal
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
}