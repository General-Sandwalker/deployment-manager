// src/components/shared/Navbar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Rocket, Star, Globe, User, LogOut, LogIn, UserPlus } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isLoading } = useAuth();
  const pathname = usePathname();

  // Don't show navbar on auth pages
  if (pathname.startsWith('/login') || pathname.startsWith('/register')) return null;

  const navLinks = [
    { href: '/dashboard', icon: <Globe size={18} />, label: 'Websites' },
    { href: '/dashboard/reviews', icon: <Star size={18} />, label: 'Reviews' },
    ...(user?.is_admin ? [{ href: '/admin', icon: <User size={18} />, label: 'Admin' }] : []),
  ];

  return (
    <nav className="bg-[var(--cosmic-blue)] border-b border-[var(--cosmic-accent)] px-6 py-4 fixed top-0 w-full z-10">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href={user ? '/dashboard' : '/'} className="flex items-center space-x-2">
          <Rocket className="text-[var(--cosmic-highlight)]" size={20} />
          <span className="text-xl font-bold text-white">CosmicDeploy</span>
        </Link>
        
        {!isLoading && (
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      pathname.startsWith(link.href)
                        ? 'bg-[var(--cosmic-highlight)] text-white' 
                        : 'text-[var(--cosmic-highlight)] hover:bg-[var(--cosmic-light)]'
                    }`}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </Link>
                ))}
                <Button
                  onClick={logout}
                  variant="ghost"
                  className="text-[var(--cosmic-highlight)] hover:bg-[var(--cosmic-light)] hover:text-white"
                >
                  <LogOut size={18} className="mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <div className="flex gap-2">
                <Button asChild variant="outline" className="text-[var(--cosmic-highlight)] border-[var(--cosmic-accent)] hover:bg-[var(--cosmic-light)]">
                  <Link href="/login" className="flex items-center">
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </Link>
                </Button>
                <Button asChild className="bg-[var(--cosmic-highlight)] hover:bg-[var(--cosmic-highlight-dark)]">
                  <Link href="/register" className="flex items-center">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Register
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}