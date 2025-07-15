import React from 'react';
import Navigation from '@/components/Navigation';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <div className="flex-grow p-6 bg-white rounded-lg shadow-md animate-fadeIn">
        {children}
      </div>
    </div>
  );
} 