import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import React, { useEffect } from 'react';
import { useAuthStore } from './store/authStore';

import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Admins from './pages/Admins';
import Nomina from './pages/Nomina';
import NotFound from './pages/NotFound';
import ErrorBoundary from './components/ErrorBoundary';

// Route Protection Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const token = useAuthStore((state) => state.token);

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return <Layout>{children}</Layout>;
};

const SuperAdminRoute = ({ children }: { children: React.ReactNode }) => {
    const { token, user } = useAuthStore((state) => state);

    if (!token) return <Navigate to="/login" replace />;
    if (user?.role !== 'SUPERADMIN') return <Navigate to="/" replace />;

    return <Layout>{children}</Layout>;
};

function App() {
    // Add dark mode by default if user likes it, or hardcode it
    useEffect(() => {
        document.documentElement.classList.add('dark');
    }, []);

    return (
        <ErrorBoundary>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    {/* Protected Routes */}
                    <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

                    <Route path="/employees" element={
                        <ProtectedRoute>
                            <Employees />
                        </ProtectedRoute>
                    } />

                    <Route path="/nomina" element={
                        <ProtectedRoute>
                            <Nomina />
                        </ProtectedRoute>
                    } />

                    <Route path="/admins" element={
                        <SuperAdminRoute>
                            <Admins />
                        </SuperAdminRoute>
                    } />

                    <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter>
        </ErrorBoundary>
    );
}

export default App;
