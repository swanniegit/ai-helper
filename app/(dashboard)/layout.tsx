import React from 'react';
import Navigation from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex">
        <Navigation />
        <div className="flex-grow p-6 bg-white rounded-lg shadow-md animate-fadeIn">
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
} 