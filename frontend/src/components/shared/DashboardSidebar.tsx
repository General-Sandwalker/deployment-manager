// components/shared/DashboardSidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Globe, 
  Users, 
  Star, 
  FileText,
  LayoutDashboard,
  Terminal,
  Database,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Avatar } from '@/components/ui/avatar';
import { format } from 'date-fns';

interface DashboardSidebarProps {
  isAdmin: boolean;
}

export const DashboardSidebar = ({ isAdmin }: DashboardSidebarProps) => {
  const pathname = usePathname();
  const { user } = useAuth();
  
  const getUserInitials = () => {
    if (!user?.full_name) return user?.email.charAt(0).toUpperCase() || 'U';
    const names = user.full_name.split(' ');
    return names.map(name => name[0]).join('').toUpperCase();
  };

  const navItems = [
    {
      href: '/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      label: 'Overview',
    },
    {
      href: '/dashboard/websites',
      icon: <Globe className="h-5 w-5" />,
      label: 'My Websites',
    },
    {
      href: '/dashboard/reviews',
      icon: <Star className="h-5 w-5" />,
      label: 'My Reviews',
    },
  ];

  const adminItems = [
    {
      href: '/dashboard/admin/users',
      icon: <Users className="h-5 w-5" />,
      label: 'User Management',
    },
    {
      href: '/dashboard/admin/websites',
      icon: <Database className="h-5 w-5" />,
      label: 'All Websites',
    },
    {
      href: '/dashboard/admin/reviews',
      icon: <FileText className="h-5 w-5" />,
      label: 'All Reviews',
    },
    {
      href: '/dashboard/admin/system',
      icon: <Terminal className="h-5 w-5" />,
      label: 'System Console',
    },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed border-r border-[var(--cosmic-accent)] bg-[var(--cosmic-blue)]">
      <div className="p-4 border-b border-[var(--cosmic-accent)]">
        <Link href="/" className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-[var(--cosmic-highlight)]" />
          <span className="text-xl font-bold bg-gradient-to-r from-[var(--cosmic-highlight)] to-purple-500 bg-clip-text text-transparent">
            CosmicDeploy
          </span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {/* Main Navigation */}
          <div className="space-y-2">
            <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
              Navigation
            </h3>
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors',
                    pathname === item.href
                      ? 'bg-[var(--cosmic-highlight)] text-white'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--cosmic-light)] hover:text-[var(--text-primary)]'
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Admin Navigation - Only shown if isAdmin is true */}
          {isAdmin && (
            <div className="space-y-2 pt-4">
              <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                Administration
              </h3>
              <div className="space-y-1">
                {adminItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors',
                      pathname.startsWith(item.href)
                        ? 'bg-[var(--cosmic-highlight)] text-white'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--cosmic-light)] hover:text-[var(--text-primary)]'
                    )}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    <span className="ml-auto px-2 py-0.5 text-xs rounded-full bg-[var(--cosmic-highlight)] text-white">
                      Admin
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-[var(--cosmic-accent)]">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <div className="bg-[var(--cosmic-highlight)] text-white flex items-center justify-center h-full w-full">
              {getUserInitials()}
            </div>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--text-primary)] truncate">
              {user?.full_name || user?.email}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--text-tertiary)]">
                {isAdmin ? 'Administrator' : 'Developer'}
              </span>
              {user?.plan_expires_at && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--cosmic-light)] text-[var(--text-secondary)]">
                  {format(new Date(user.plan_expires_at), 'MMM yyyy')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
