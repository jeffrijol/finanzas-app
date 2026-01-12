import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from '@/pages/HomePage';
import { DashboardPage } from '@/pages/DashboardPage';
import { MaintenancePage } from '@/pages/MaintenancePage';
import { ReportsPage } from '@/pages/ReportsPage';
import { ExcelsPage } from '@/pages/ExcelsPage';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/mantenimiento" element={<MaintenancePage />} />
        <Route path="/reportes" element={<ReportsPage />} />
        <Route path="/excels" element={<ExcelsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
