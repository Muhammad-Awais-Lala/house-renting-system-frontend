import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RecommendationPage from './pages/RecommendationPage';
import ChatPage from './pages/ChatPage';
import LandlordDashboard from './pages/LandlordDashboard';
import PropertyDetailsPage from './pages/PropertyDetailsPage';
import AdminDashboard from './pages/AdminDashboard';
import LandlordPropertiesPage from './pages/LandlordPropertiesPage';
import MapView from './pages/MapView';
import TenantBookingsPage from './pages/TenantBookingsPage';
import LandlordBookingsPage from './pages/LandlordBookingsPage';
import ProfilePage from './pages/ProfilePage';

// Mock placeholders for missing pages
const Placeholder = ({ name }: { name: string }) => (
  <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200">
    <h1 className="text-2xl font-bold text-slate-800">{name}</h1>
    <p className="text-slate-500 mt-2 italic">This page is under construction as part of the intelligent renting system prototype.</p>
  </div>
);

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div className="h-screen flex items-center justify-center font-black text-indigo-600 animate-pulse">Loading HouseIntel...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  
  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        {/* Tenant Routes */}
        <Route index element={<HomePage />} />
        <Route path="map" element={<MapView />} />
        <Route path="properties/:id" element={<PropertyDetailsPage />} />
        <Route path="recommendations" element={<RecommendationPage />} />
        <Route path="bookings" element={<TenantBookingsPage />} />
        <Route path="messages" element={<ChatPage />} />
        <Route path="reviews" element={<Placeholder name="My Reviews" />} />
        <Route path="profile" element={<ProfilePage />} />

        {/* Landlord Routes */}
        <Route path="landlord/dashboard" element={<ProtectedRoute allowedRoles={['landlord']}><LandlordDashboard /></ProtectedRoute>} />
        <Route path="landlord/properties" element={<ProtectedRoute allowedRoles={['landlord']}><LandlordPropertiesPage /></ProtectedRoute>} />
        <Route path="landlord/bookings" element={<ProtectedRoute allowedRoles={['landlord']}><LandlordBookingsPage /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="admin/users" element={<ProtectedRoute allowedRoles={['admin']}><Placeholder name="User Management" /></ProtectedRoute>} />
        <Route path="admin/properties" element={<ProtectedRoute allowedRoles={['admin']}><Placeholder name="Property Monitoring" /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
