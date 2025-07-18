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
      <div className="min-h-screen bg-gradient-metro flex">
        <Navigation />
        <div className="flex-grow animate-fadeIn">
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
} 