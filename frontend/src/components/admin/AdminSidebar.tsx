'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  Globe, 
  Star, 
  Settings,
  ChevronRight
} from 'lucide-react';

const adminRoutes = [
  {
    label: 'Dashboard',
    icon: <LayoutDashboard className="mr-2 h-4 w-4" />,
    href: '/admin',
    pattern: /^\/admin$/,
  },
  {
    label: 'Users',
    icon: <Users className="mr-2 h-4 w-4" />,
    href: '/admin/users',
    pattern: /^\/admin\/users/,
  },
  {
    label: 'Websites',
    icon: <Globe className="mr-2 h-4 w-4" />,
    href: '/admin/websites',
    pattern: /^\/admin\/websites/,
  },
  {
    label: 'Reviews',
    icon: <Star className="mr-2 h-4 w-4" />,
    href: '/admin/reviews',
    pattern: /^\/admin\/reviews/,
  },
  {
    label: 'Settings',
    icon: <Settings className="mr-2 h-4 w-4" />,
    href: '/admin/settings',
    pattern: /^\/admin\/settings/,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="h-screen border-r border-[var(--cosmic-accent)] bg-[var(--cosmic-blue)] w-64 fixed top-0 left-0 pt-16">
      <div className="px-3 py-4">
        <h2 className="mb-4 px-4 text-lg font-semibold text-[var(--cosmic-highlight)]">
          Admin Control
        </h2>
        <div className="space-y-1 py-2">
          {adminRoutes.map((route) => (
            <Link 
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center justify-between py-2 px-4 text-sm font-medium rounded-md",
                route.pattern.test(pathname)
                  ? "bg-[var(--cosmic-light)] text-[var(--cosmic-highlight)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--cosmic-light)]/50"
              )}
            >
              <div className="flex items-center">
                {route.icon}
                {route.label}
              </div>
              {route.pattern.test(pathname) && (
                <ChevronRight className="h-4 w-4" />
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}