import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from '@/pages/HomePage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ItemsPage } from '@/pages/ItemsPage';
import { ReportsPage } from '@/pages/ReportsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/items" element={<ItemsPage />} />
        <Route path="/reportes" element={<ReportsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
