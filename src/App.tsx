import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { LoginPage } from './features/auth/LoginPage';
import { ProtectedRoute } from './app/router/ProtectedRoute';
import { Dashboard } from './features/dashboard/Dashboard';
import { QRScanner } from './features/qr-scanner/QRScanner';
import { QRConfig } from './features/qr-config/QRConfig';
import { BookMyShow } from './features/bookmyshow/BookMyShow';
import { PublicForm } from './features/qr-form-renderer/PublicForm';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/form" element={<PublicForm />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="scan" element={<QRScanner />} />
          <Route path="bookmyshow" element={<BookMyShow />} />
          
          <Route path="qr-config" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <QRConfig />
            </ProtectedRoute>
          } />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
