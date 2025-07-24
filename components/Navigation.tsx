'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { Menu, X, Home, Trophy, Scroll, TreePine, User, BookOpen, MessageCircle, GraduationCap, Newspaper, Heart, Users } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen, isMobile]);

  const navItems = [
    { key: 'progress', href: '/dashboard', label: 'My Progress', icon: Home, badge: null },
    { key: 'gamification', href: '/gamification', label: 'DevPath Chronicles', icon: Trophy, badge: 'RPG' },
    { key: 'quests', href: '/quests', label: 'Quest Log', icon: Scroll, badge: null },
    { key: 'skill-trees', href: '/skill-trees', label: 'Skill Trees', icon: TreePine, badge: null },
    { key: 'avatar', href: '/avatar', label: 'My Avatar', icon: User, badge: null },
    { key: 'quiz', href: '/quiz', label: 'Quiz Center', icon: BookOpen, badge: 'Hot' },
    { key: 'mentor', href: '/mentor-chat', label: 'AI Mentor', icon: MessageCircle, badge: null },
    { key: 'learning', href: '/learning-paths', label: 'Learning Paths', icon: GraduationCap, badge: null },
    { key: 'news', href: '/news-feed', label: 'News Feed', icon: Newspaper, badge: null },
    { key: 'wellness', href: '/wellness-support', label: 'Wellness Support', icon: Heart, badge: null },
    { key: 'mentor-linkup', href: '/mentor-linkup', label: 'Mentor Linkup', icon: Users, badge: null },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Mobile Header with Hamburger Menu
  const MobileHeader = () => (
    <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Image 
            src="/images/ai-mentor-logo.svg" 
            alt="AI Mentor" 
            width={32}
            height={24}
            className="w-8 h-6 rounded-md"
          />
          <h1 className="text-lg font-bold text-primary">AI Mentor</h1>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>
      </div>
    </header>
  );

  // Mobile Overlay Menu
  const MobileOverlayMenu = () => (
    <>
      {/* Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 z-50 bg-black/20 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Slide-down Menu */}
      <div className={cn(
        "md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-border shadow-2xl transform transition-transform duration-300 ease-out",
        isMobileMenuOpen ? "translate-y-0" : "-translate-y-full"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-metro text-white">
          <div className="flex items-center gap-3">
            <Image 
              src="/images/ai-mentor-logo.svg" 
              alt="AI Mentor" 
              width={32}
              height={24}
              className="w-8 h-6 rounded-md"
            />
            <div>
              <h1 className="text-lg font-bold">AI Mentor</h1>
              {user && (
                <p className="text-xs text-white/80">{user.first_name || user.email}</p>
              )}
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 text-white hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="max-h-[70vh] overflow-y-auto">
          <ul className="p-2">
            {navItems.map(item => {
              const isActive = pathname === item.href;
              const IconComponent = item.icon;
              
              return (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-lg transition-all duration-200 text-sm font-medium relative",
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-primary hover:bg-primary/5 active:bg-primary/10'
                    )}
                  >
                    <IconComponent className="h-5 w-5 flex-shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className={cn(
                        "px-2 py-1 text-xs font-semibold rounded-full",
                        item.badge === 'RPG' && "bg-purple-100 text-purple-700",
                        item.badge === 'Hot' && "bg-red-100 text-red-700"
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/30">
          <Button
            onClick={() => {
              handleLogout();
              setIsMobileMenuOpen(false);
            }}
            variant="outline"
            className="w-full bg-destructive/10 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            Sign Out
          </Button>
        </div>
      </div>
    </>
  );

  // Desktop Sidebar (existing design)
  const DesktopSidebar = () => (
    <aside className="hidden md:block w-64 p-4 mr-4 animate-slideInLeft">
      <Card className="bg-card/80 backdrop-blur-sm border-primary/20 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <Image 
              src="/images/ai-mentor-logo.svg" 
              alt="AI Mentor" 
              width={40}
              height={32}
              className="w-10 h-8 rounded-md"
            />
            <CardTitle className="text-xl font-bold text-primary">
              AI Mentor
            </CardTitle>
          </div>
          {user && (
            <CardDescription>
              <span className="font-medium text-card-foreground block">{user.first_name || user.email}</span>
              <span className="text-xs text-muted-foreground block">{user.email}</span>
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-2">
          <nav>
            <ul className="space-y-1">
              {navItems.map(item => {
                const isActive = pathname === item.href;
                const IconComponent = item.icon;
                
                return (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-md transition-all duration-200 text-sm font-medium relative",
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                      )}
                    >
                      <IconComponent className="h-4 w-4 flex-shrink-0" />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className={cn(
                          "px-2 py-1 text-xs font-semibold rounded-full",
                          item.badge === 'RPG' && "bg-purple-100 text-purple-700",
                          item.badge === 'Hot' && "bg-red-100 text-red-700"
                        )}>
                          {item.badge}
                        </span>
                      )}
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

  return (
    <>
      <MobileHeader />
      <MobileOverlayMenu />
      <DesktopSidebar />
    </>
  );
}
