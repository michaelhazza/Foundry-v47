import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { api } from './lib/api';
import ErrorBoundary from './lib/ErrorBoundary';

// Import all pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectPage from './pages/ProjectPage';
import NewProjectPage from './pages/NewProjectPage';
import ProjectSourcesPage from './pages/ProjectSourcesPage';
import SourceMappingPage from './pages/SourceMappingPage';
import SourcePreviewPage from './pages/SourcePreviewPage';
import ProjectProcessingPage from './pages/ProjectProcessingPage';
import DatasetExportPage from './pages/DatasetExportPage';
import DataSourcesPage from './pages/DataSourcesPage';
import NewDataSourcePage from './pages/NewDataSourcePage';
import SchemasPage from './pages/SchemasPage';
import ConnectorsPage from './pages/ConnectorsPage';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = api.isAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Layout Component with Navigation
function Layout({ children }: { children: React.ReactNode }) {
  const isAuthenticated = api.isAuthenticated();

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout', {});
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      api.clearToken();
      window.location.href = '/login';
    }
  };

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav style={{
        backgroundColor: '#2c3e50',
        color: 'white',
        padding: '15px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <a href="/" style={{ color: 'white', textDecoration: 'none', fontSize: '20px', fontWeight: 'bold' }}>
            Foundry
          </a>
          <a href="/projects" style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>
            Projects
          </a>
          <a href="/data-sources" style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>
            Data Sources
          </a>
          <a href="/schemas" style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>
            Schemas
          </a>
          <a href="/connectors" style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>
            Connectors
          </a>
          <a href="/admin/users" style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>
            Users
          </a>
        </div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <a href="/settings" style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>
            Settings
          </a>
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: '#e74c3c',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Logout
          </button>
        </div>
      </nav>
      <main style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects"
              element={
                <ProtectedRoute>
                  <ProjectsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects/new"
              element={
                <ProtectedRoute>
                  <NewProjectPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects/:projectId"
              element={
                <ProtectedRoute>
                  <ProjectPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects/:projectId/sources"
              element={
                <ProtectedRoute>
                  <ProjectSourcesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects/:projectId/sources/:dataSourceId/mapping"
              element={
                <ProtectedRoute>
                  <SourceMappingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects/:projectId/sources/:dataSourceId/preview"
              element={
                <ProtectedRoute>
                  <SourcePreviewPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects/:projectId/processing"
              element={
                <ProtectedRoute>
                  <ProjectProcessingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects/:projectId/datasets"
              element={
                <ProtectedRoute>
                  <DatasetExportPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/data-sources"
              element={
                <ProtectedRoute>
                  <DataSourcesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/data-sources/new"
              element={
                <ProtectedRoute>
                  <NewDataSourcePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/schemas"
              element={
                <ProtectedRoute>
                  <SchemasPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/connectors"
              element={
                <ProtectedRoute>
                  <ConnectorsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
