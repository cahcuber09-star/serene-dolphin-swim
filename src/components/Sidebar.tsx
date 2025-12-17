import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, CalendarCheck, FileText, History } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  icon: React.ElementType;
  label: string;
}

const navItems: NavItem[] = [
  { href: '/dashboard', icon: Home, label: 'Beranda' },
  { href: '/dashboard/students', icon: Users, label: 'Data Mahasiswa' },
  { href: '/dashboard/attendance', icon: CalendarCheck, label: 'Absensi' },
  { href: '/dashboard/recap', icon: FileText, label: 'Laporan Rekapitulasi' },
  { href: '/dashboard/history', icon: History, label: 'Riwayat Absensi' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar transition-transform duration-300 ease-in-out md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-center border-b border-sidebar-border p-4">
          <h1 className="text-xl font-bold text-sidebar-primary-foreground">
            Attendance App
          </h1>
        </div>
        <nav className="flex flex-col p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center p-3 rounded-lg transition-colors",
                  "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
                )}
              >
                <item.icon className="h-5 w-5 mr-3" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;