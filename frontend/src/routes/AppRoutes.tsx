import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { ProtectedRoute, RoleGuard } from './ProtectedRoute';
import { Login } from '../pages/Login';
import { Dashboard } from '../pages/Dashboard';
import { Customers } from '../pages/Customers';
import { CustomerDetail } from '../pages/CustomerDetail';
import { Products } from '../pages/Products';
import { ProductDetail } from '../pages/ProductDetail';
import { Inventory } from '../pages/Inventory';
import { Challans } from '../pages/Challans';
import { ChallanCreate } from '../pages/ChallanCreate';
import { ChallanDetail } from '../pages/ChallanDetail';
import { Profile } from '../pages/Profile';
import { Unauthorized } from '../pages/Unauthorized';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Customers Module */}
          <Route element={<RoleGuard allowedRoles={['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']} />}>
            <Route path="/customers" element={<Customers />} />
            <Route path="/customers/:id" element={<CustomerDetail />} />
          </Route>

          {/* Products Module */}
          <Route element={<RoleGuard allowedRoles={['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']} />}>
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
          </Route>

          {/* Inventory Module */}
          <Route element={<RoleGuard allowedRoles={['ADMIN', 'WAREHOUSE', 'SALES', 'ACCOUNTS']} />}>
            <Route path="/inventory" element={<Inventory />} />
          </Route>

          {/* Challans Module */}
          <Route element={<RoleGuard allowedRoles={['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']} />}>
            <Route path="/challans" element={<Challans />} />
            <Route path="/challans/:id" element={<ChallanDetail />} />
          </Route>
          <Route element={<RoleGuard allowedRoles={['ADMIN', 'SALES']} />}>
            <Route path="/challans/new" element={<ChallanCreate />} />
          </Route>

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  );
};
