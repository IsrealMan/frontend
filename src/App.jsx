import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import ProductionHealth from './pages/ProductionHealth';
import QualityControl from './pages/QualityControl';
import Settings from './pages/Settings';
import ProductionMetrics from './pages/ProductionMetrics';
import Rules from './pages/Rules';
import Login from './pages/Login';
import Register from './pages/Register';

function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-[220px]">
        <Topbar />
        <main className="p-6 mt-16">{children}</main>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <NotificationProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout><Dashboard /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/production-health"
            element={
              <ProtectedRoute>
                <AppLayout><ProductionHealth /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/production-metrics"
            element={
              <ProtectedRoute>
                <AppLayout><ProductionMetrics /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/quality-control"
            element={
              <ProtectedRoute>
                <AppLayout><QualityControl /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <AppLayout><div className="text-gray-500">Chat - Coming Soon</div></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/anomalies"
            element={
              <ProtectedRoute>
                <AppLayout><div className="text-gray-500">Anomalies - Coming Soon</div></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/rules"
            element={
              <ProtectedRoute>
                <AppLayout><Rules /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <AppLayout><Settings /></AppLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
