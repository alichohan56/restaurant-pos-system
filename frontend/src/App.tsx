import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LoadingScreen from './components/LoadingScreen';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { useAuth } from './context/useAuth';
import AdminLayout from './layouts/AdminLayout';
import CategoriesPage from './pages/CategoriesPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import PlaceholderPage from './pages/PlaceholderPage';

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />
        }
      />
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />
      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/pos" element={<PlaceholderPage title="POS" />} />
        <Route path="/orders" element={<PlaceholderPage title="Orders" />} />
        <Route path="/products" element={<PlaceholderPage title="Products" />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/inventory" element={<PlaceholderPage title="Inventory" />} />
        <Route path="/customers" element={<PlaceholderPage title="Customers" />} />
        <Route path="/employees" element={<PlaceholderPage title="Employees" />} />
        <Route path="/suppliers" element={<PlaceholderPage title="Suppliers" />} />
        <Route path="/expenses" element={<PlaceholderPage title="Expenses" />} />
        <Route path="/reports" element={<PlaceholderPage title="Reports" />} />
        <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
