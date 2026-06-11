import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";

import PrivateRoute from "./components/PrivateRoute.jsx";
import ProviderDashboard from "./components/chef/ProviderDashboard.jsx";
import AddFood from "./components/AddFood/AddFood.jsx";

import HomePage from "./pages/public/HomePage.jsx";
import SearchProviders from "./pages/public/SearchProviders.jsx";
import ProviderProfile from "./pages/public/ProviderProfile.jsx";
import FoodPage from "./pages/public/FoodPage.jsx";
import FoodDetail from "./pages/public/FoodDetail.jsx";
import Login from "./pages/public/AuthPage.jsx";
import ChefSignup from "./pages/ChefSignup.jsx";
import CustomerDash from "./pages/CustomerDash.jsx";
import AdminDash from "./pages/AdminDash.jsx";
import VerificationStatus from "./pages/VerificationStatus.jsx";
import AboutPage from "./pages/about/AboutPage";
import BlogPage from "./pages/blog/BlogPage";
import ContactPage from "./pages/contact/ContactPage";

import PublicLayout from "./layouts/PublicLayout.jsx";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/search" element={<SearchProviders />} />
          <Route path="/provider/:id" element={<ProviderProfile />} />
          <Route path="/food" element={<FoodPage />} />
          <Route path="/food/:id" element={<FoodDetail />} />
          <Route path="/chef-signup" element={<ChefSignup />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>

        <Route
          path="/chef/dashboard"
          element={
            <PrivateRoute requiredRole="chef">
              <ProviderDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/chef/verification-status"
          element={
            <PrivateRoute requiredRole="chef" bypassApprovalCheck={true}>
              <VerificationStatus />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute requiredRole="ADMIN">
              <AdminDash />
            </PrivateRoute>
          }
        />

        <Route
          path="/chef/dashboard/add-food"
          element={
            <PrivateRoute requiredRole="chef">
              <AddFood onBack={() => window.history.back()} />
            </PrivateRoute>
          }
        />

        <Route
          path="/customer/dashboard"
          element={
            <PrivateRoute requiredRole="CUSTOMER">
              <CustomerDash />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;