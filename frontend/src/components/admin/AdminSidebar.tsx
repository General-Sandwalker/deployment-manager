'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Globe, Star, Users, Settings } from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();
  
  const links = [
    { href: '/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { href: '/admin/websites', icon: <Globe size={20} />, label: 'Websites' },
    { href: '/admin/reviews', icon: <Star size={20} />, label: 'Reviews' },
    { href: '/admin/users', icon: <Users size={20} />, label: 'Users' },
    { href: '/admin/settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  return (
    <div className="w-64 bg-cosmic-blue h-screen fixed left-0 top-0 pt-20 border-r border-cosmic-accent">
      <div className="p-4 space-y-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
              pathname === link.href 
                ? 'bg-cosmic-highlight text-white' 
                : 'text-cosmic-highlight hover:bg-cosmic-light'
            }`}
          >
            {link.icon}
            <span>{link.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}