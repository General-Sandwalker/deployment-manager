'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Globe, 
  Star, 
  Settings,
  ChevronRight
} from 'lucide-react';

const dashboardRoutes = [
  {
    label: 'Overview',
    icon: <LayoutDashboard className="mr-2 h-4 w-4" />,
    href: '/dashboard',
    pattern: /^\/dashboard$/,
  },
  {
    label: 'My Websites',
    icon: <Globe className="mr-2 h-4 w-4" />,
    href: '/dashboard/websites',
    pattern: /^\/dashboard\/websites/,
  },
  {
    label: 'My Reviews',
    icon: <Star className="mr-2 h-4 w-4" />,
    href: '/dashboard/reviews',
    pattern: /^\/dashboard\/reviews/,
  },
  {
    label: 'Account Settings',
    icon: <Settings className="mr-2 h-4 w-4" />,
    href: '/dashboard/settings',
    pattern: /^\/dashboard\/settings/,
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <div className="h-screen border-r border-[var(--cosmic-accent)] bg-[var(--cosmic-blue)] w-64 fixed top-0 left-0 pt-16 hidden md:block">
      <div className="px-3 py-4">
        <h2 className="mb-4 px-4 text-lg font-semibold text-[var(--cosmic-highlight)]">
          Dashboard
        </h2>
        <div className="space-y-1 py-2">
          {dashboardRoutes.map((route) => (
            <Link 
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center justify-between py-2 px-4 text-sm font-medium rounded-md transition-colors",
                route.pattern.test(pathname)
                  ? "bg-[var(--cosmic-highlight)] text-white shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--cosmic-light)] border border-[var(--cosmic-accent)]"
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