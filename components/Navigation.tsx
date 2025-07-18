'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
    <aside className="w-64 p-4 mr-4 animate-slideInLeft">
      <Card className="bg-card/80 backdrop-blur-sm border-primary/20 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-primary">
            Dashboard Menu
          </CardTitle>
          {user && (
            <CardDescription>
              <p className="font-medium text-card-foreground">{user.first_name || user.email}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-2">
          <nav>
            <ul className="space-y-1">
              {navItems.map(item => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      className={cn(
                        "block p-3 rounded-md transition-all duration-200 text-sm font-medium",
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="mt-6 pt-4 border-t border-border">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full bg-destructive/10 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
