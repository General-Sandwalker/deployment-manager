/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/shared/Navbar.tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Rocket, Star, Globe, User, LogOut, LogIn, UserPlus, LayoutDashboard, ShieldCheck, Settings } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function Navbar() {
  const { user, logout, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Don't show navbar on auth pages
  if (pathname.startsWith('/login') || pathname.startsWith('/register')) return null;

  const navLinks = [
    { href: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { href: '/dashboard/websites', icon: <Globe size={18} />, label: 'Websites' },
    { href: '/dashboard/reviews', icon: <Star size={18} />, label: 'Reviews' },
    ...(user?.is_admin ? [{ href: '/admin', icon: <ShieldCheck size={18} />, label: 'Admin' }] : []),
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <nav className="bg-[var(--cosmic-blue)] border-b border-[var(--cosmic-accent)] px-6 py-4 fixed top-0 w-full z-10">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Link href={user ? '/dashboard' : '/'} className="flex items-center space-x-2">
            <Rocket className="text-[var(--cosmic-highlight)]" size={24} />
            <span className="text-xl font-bold bg-gradient-to-r from-[var(--cosmic-highlight)] to-purple-500 bg-clip-text text-transparent hidden md:inline">
              CosmicDeploy
            </span>
          </Link>
        </div>

        {user && (
          <div className="flex items-center space-x-6">
            <div className="hidden md:flex space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center text-sm font-medium transition-colors ${
                    pathname.startsWith(link.href)
                      ? 'text-[var(--cosmic-highlight)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {link.icon}
                  <span className="ml-2">{link.label}</span>
                </Link>
              ))}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full border border-[var(--cosmic-accent)] bg-[var(--cosmic-light)]"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-[var(--cosmic-highlight)] text-white">
                      {user.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {user.is_admin && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[var(--cosmic-highlight)] flex items-center justify-center">
                      <ShieldCheck size={10} className="text-white" />
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-56 bg-[var(--cosmic-blue)] border-[var(--cosmic-accent)]"
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium text-[var(--text-primary)]">{user.full_name || user.email}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[var(--cosmic-accent)]" />
                <DropdownMenuItem asChild className="text-[var(--text-primary)] focus:bg-[var(--cosmic-light)] cursor-pointer">
                  <Link href="/dashboard">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                {user.is_admin && (
                  <DropdownMenuItem asChild className="text-[var(--text-primary)] focus:bg-[var(--cosmic-light)] cursor-pointer">
                    <Link href="/admin">
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild className="text-[var(--text-primary)] focus:bg-[var(--cosmic-light)] cursor-pointer">
                  <Link href="/dashboard/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[var(--cosmic-accent)]" />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-[var(--text-primary)] focus:bg-[var(--cosmic-light)] cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {!user && !isLoading && (
          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              Log in
            </Link>
            <Button asChild className="bg-[var(--cosmic-highlight)] hover:bg-[var(--cosmic-highlight-dark)]">
              <Link href="/register">Sign up</Link>
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}