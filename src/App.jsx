import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { UserProvider } from './context/UserContext';
import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
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
import IEOptimizer from './pages/IEOptimizer';
import Login from './pages/Login';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <AppProvider>
            <UserProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<AppLayout />}>
                      <Route index element={<Navigate to="/dashboard" replace />} />
                      <Route path="dashboard" element={<Dashboard />} />
                      <Route path="personel-listesi" element={<PersonelListesi />} />
                      <Route path="yeni-personel" element={<YeniCalisan />} />
                      <Route path="izin-takvimi" element={<LeaveCalendar />} />
                      <Route path="ise-alim" element={<Recruitment />} />
                      <Route path="performans" element={<Performance />} />
                      <Route path="operasyon-isg" element={<OperationsSafety />} />
                      <Route path="ie-optimizer" element={<IEOptimizer />} />
                      <Route path="demirbas" element={<AssetTracker />} />
                      <Route path="egitim" element={<TrainingMatrix />} />
                      <Route path="bordro" element={<PayrollAndDocs />} />
                      <Route path="ayarlar" element={<Settings />} />
                    </Route>
                  </Route>
                  <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
              </BrowserRouter>
            </UserProvider>
          </AppProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
