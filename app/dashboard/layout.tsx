import React from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <aside className="w-64 bg-white p-4 shadow-md rounded-lg mr-4 animate-slideInLeft">
        <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2 border-blue-200">Dashboard Menu</h2>
        <nav>
          <ul>
            <li className="mb-2">
              <a href="/dashboard" className="block p-2 rounded-md text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition-all duration-200 transform hover:translate-x-1 bg-blue-100 text-blue-700">
                My Progress
              </a>
            </li>
            <li className="mb-2">
              <a href="/chat" className="block p-2 rounded-md text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition-all duration-200 transform hover:translate-x-1">
                AI Mentor
              </a>
            </li>
            <li className="mb-2">
              <a href="#" className="block p-2 rounded-md text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition-all duration-200 transform hover:translate-x-1">
                Learning Paths (Mock)
              </a>
            </li>
            <li className="mb-2">
              <a href="#" className="block p-2 rounded-md text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition-all duration-200 transform hover:translate-x-1">
                News Feed (Mock)
              </a>
            </li>
            <li className="mb-2">
              <a href="#" className="block p-2 rounded-md text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition-all duration-200 transform hover:translate-x-1">
                CBT Support (Mock)
              </a>
            </li>
            <li className="mb-2">
              <a href="#" className="block p-2 rounded-md text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition-all duration-200 transform hover:translate-x-1">
                Mentor Linkup (Mock)
              </a>
            </li>
          </ul>
        </nav>
      </aside>
      <div className="flex-grow p-6 bg-white rounded-lg shadow-md animate-fadeIn">
        {children}
      </div>
    </div>
  );
}