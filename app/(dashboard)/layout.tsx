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
      <div className="min-h-screen bg-gradient-metro">
        <Navigation />
        {/* Main Content Area with Mobile Padding */}
        <div className="md:flex">
          {/* Content Container */}
          <main className="flex-grow pt-16 md:pt-0 animate-fadeIn">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
} 