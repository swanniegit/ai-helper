'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth/AuthContext';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const navItems = [
    { key: 'progress', href: '/dashboard', label: 'My Progress' },
    { key: 'quiz', href: '/quiz', label: 'Quiz Center' },
    { key: 'mentor', href: '/mentor-chat', label: 'AI Mentor' },
    { key: 'learning', href: '/learning-paths', label: 'Learning Paths' },
    { key: 'news', href: '/news-feed', label: 'News Feed' },
    { key: 'wellness', href: '/wellness-support', label: 'Wellness Support' },
    { key: 'mentor-linkup', href: '/mentor-linkup', label: 'Mentor Linkup' },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <aside className="w-64 bg-white p-4 shadow-md rounded-lg mr-4 animate-slideInLeft">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2 text-gray-800 border-b pb-2 border-blue-200">
          Dashboard Menu
        </h2>
        {user && (
          <div className="text-sm text-gray-600">
            <p className="font-medium">{user.first_name || user.email}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        )}
      </div>
      
      <nav>
        <ul>
          {navItems.map(item => {
            const isActive = pathname === item.href;
            return (
              <li key={item.key} className="mb-2">
                <Link
                  href={item.href}
                  className={`block p-2 rounded-md transition-all duration-200 transform hover:translate-x-1 ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-blue-100 hover:text-blue-700'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full p-2 text-left text-red-600 hover:bg-red-50 rounded-md transition-all duration-200"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
