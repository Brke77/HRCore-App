import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { UserProvider } from './context/UserContext';
import AppLayout from './layouts/AppLayout';
import Dashboard from './pages/Dashboard';
import PersonelListesi from './pages/PersonelListesi';
import YeniCalisan from './pages/YeniCalisan';
import LeaveCalendar from './pages/LeaveCalendar';
import Performance from './pages/Performance';
import PayrollAndDocs from './pages/PayrollAndDocs';
import Settings from './pages/Settings';
import Recruitment from './pages/Recruitment';
import OperationsSafety from './pages/OperationsSafety';
import AssetTracker from './pages/AssetTracker';
import TrainingMatrix from './pages/TrainingMatrix';

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AppProvider>
          <UserProvider>
            <BrowserRouter>
            <Routes>
              <Route path="/" element={<AppLayout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="personel-listesi" element={<PersonelListesi />} />
                <Route path="yeni-personel" element={<YeniCalisan />} />
                <Route path="izin-takvimi" element={<LeaveCalendar />} />
                <Route path="ise-alim" element={<Recruitment />} />
                <Route path="performans" element={<Performance />} />
                <Route path="operasyon-isg" element={<OperationsSafety />} />
                <Route path="demirbas" element={<AssetTracker />} />
                <Route path="egitim" element={<TrainingMatrix />} />
                <Route path="bordro" element={<PayrollAndDocs />} />
                <Route path="ayarlar" element={<Settings />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
          </UserProvider>
        </AppProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
