import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ConfigBanner from './components/common/ConfigBanner';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import CustomerMarketplacePage from './pages/CustomerMarketplacePage';
import BundleDetailPage from './pages/BundleDetailPage';
import MyReservationsPage from './pages/MyReservationsPage';
import EnvironmentalImpactPage from './pages/EnvironmentalImpactPage';
import MerchantDashboardPage from './pages/MerchantDashboardPage';
import MerchantListingsPage from './pages/MerchantListingsPage';
import CreateEditBundlePage from './pages/CreateEditBundlePage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <AuthProvider>
          <div className="min-h-screen flex flex-col bg-cream-50 font-sans text-slate-800">
            <ConfigBanner />
            <Navbar />
            
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/impact" element={<EnvironmentalImpactPage />} />
                <Route path="/bundle/:id" element={<BundleDetailPage />} />

                {/* Customer Marketplace & Features */}
                <Route path="/customer" element={<CustomerMarketplacePage />} />
                {/* Reservations (Available to any authenticated user) */}
                <Route
                  path="/reservations"
                  element={
                    <ProtectedRoute>
                      <MyReservationsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Merchant Protected Routes */}
                <Route
                  path="/merchant"
                  element={
                    <ProtectedRoute allowedRole="merchant">
                      <MerchantDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/merchant/listings"
                  element={
                    <ProtectedRoute allowedRole="merchant">
                      <MerchantListingsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/merchant/bundle/new"
                  element={
                    <ProtectedRoute allowedRole="merchant">
                      <CreateEditBundlePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/merchant/bundle/edit/:id"
                  element={
                    <ProtectedRoute allowedRole="merchant">
                      <CreateEditBundlePage />
                    </ProtectedRoute>
                  }
                />

                {/* 404 Not Found Route */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>

            <Footer />
          </div>
        </AuthProvider>
      </NotificationProvider>
    </BrowserRouter>
  );
}
