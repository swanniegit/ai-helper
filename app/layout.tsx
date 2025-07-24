import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../lib/auth/AuthContext';
import PWAInstaller from '../components/PWAInstaller';

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '600', '700'] });

export const metadata: Metadata = {
  title: 'DevPath Chronicles - AI Career Mentor',
  description: 'AI-powered career mentor with gamified learning paths, interactive quests, and personalized skill development',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover'
  },
  themeColor: '#22c55e',
  colorScheme: 'light dark',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'DevPath Chronicles'
  },
  formatDetection: {
    telephone: false
  },
  openGraph: {
    title: 'DevPath Chronicles - AI Career Mentor',
    description: 'Level up your career with gamified learning paths and AI-powered mentorship',
    type: 'website',
    siteName: 'DevPath Chronicles'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="DevPath Chronicles" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <meta name="msapplication-TileColor" content="#22c55e" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className={`${poppins.className} bg-background text-foreground min-h-screen touch-manipulation`}>
        <AuthProvider>
          {children}
          <PWAInstaller />
        </AuthProvider>
      </body>
    </html>
  );
}