'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { key: 'progress', href: '/dashboard', label: 'My Progress' },
    { key: 'mentor', href: '/chat', label: 'AI Mentor' },
    { key: 'learning', href: '/learning-paths', label: 'Learning Paths' },
    { key: 'news', href: '/news-feed', label: 'News Feed' },
    { key: 'wellness', href: '/wellness-support', label: 'Wellness Support' },
    { key: 'mentor-linkup', href: '/mentor-linkup', label: 'Mentor Linkup' },
  ];

  return (
    <aside className="w-64 bg-white p-4 shadow-md rounded-lg mr-4 animate-slideInLeft">
      <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2 border-blue-200">Dashboard Menu</h2>
      <nav>
        <ul>
          {navItems.map((item) => {
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
    </aside>
  );
} 