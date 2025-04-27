 
// src/components/shared/Navbar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Menu, X, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return pathname === path;
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--cosmic-blue)] border-b border-[var(--cosmic-accent)]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-[var(--cosmic-highlight)]" />
            <span className="text-xl font-bold bg-gradient-to-r from-[var(--cosmic-highlight)] to-purple-500 bg-clip-text text-transparent">
              CosmicDeploy
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={`text-sm ${
                isActive('/') ? 'text-[var(--cosmic-highlight)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Home
            </Link>
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className={`text-sm ${
                    pathname.startsWith('/dashboard') ? 'text-[var(--cosmic-highlight)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Dashboard
                </Link>
                {user.is_admin && (
                  <Link
                    href="/admin"
                    className={`text-sm ${
                      pathname.startsWith('/admin') ? 'text-[var(--cosmic-highlight)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    Admin
                  </Link>
                )}
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-[var(--text-secondary)]">
                    {user.full_name || user.email}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`text-sm ${
                    isActive('/login') ? 'text-[var(--cosmic-highlight)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="text-sm bg-[var(--cosmic-highlight)] hover:bg-[var(--cosmic-highlight-dark)] text-white py-2 px-4 rounded-lg"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-[var(--text-primary)] hover:text-[var(--cosmic-highlight)]"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[var(--cosmic-blue)] border-b border-[var(--cosmic-accent)] px-4 py-3">
          <div className="flex flex-col space-y-3">
            <Link
              href="/"
              className={`text-sm py-2 ${
                isActive('/') ? 'text-[var(--cosmic-highlight)]' : 'text-[var(--text-secondary)]'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className={`text-sm py-2 ${
                    pathname.startsWith('/dashboard') ? 'text-[var(--cosmic-highlight)]' : 'text-[var(--text-secondary)]'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                {user.is_admin && (
                  <Link
                    href="/admin"
                    className={`text-sm py-2 ${
                      pathname.startsWith('/admin') ? 'text-[var(--cosmic-highlight)]' : 'text-[var(--text-secondary)]'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                <div className="flex flex-col space-y-2 pt-2 border-t border-[var(--cosmic-accent)]">
                  <div className="flex items-center space-x-2 text-sm text-[var(--text-secondary)]">
                    <User className="h-4 w-4" />
                    <span>{user.full_name || user.email}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`text-sm py-2 ${
                    isActive('/login') ? 'text-[var(--cosmic-highlight)]' : 'text-[var(--text-secondary)]'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="text-sm py-2 bg-[var(--cosmic-highlight)] hover:bg-[var(--cosmic-highlight-dark)] text-white px-4 rounded-lg inline-block"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}