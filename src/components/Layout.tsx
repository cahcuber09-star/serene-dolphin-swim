import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Button } from '@/components/ui/button';
import { Menu, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { MadeWithDyad } from './made-with-dyad';
import { useIsMobile } from '@/hooks/use-mobile';

const Layout: React.FC = () => {
  const { logout } = useAuth();
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 md:ml-64 flex flex-col">
        {/* Header/Navbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-card px-4 md:px-6 shadow-sm">
          <div className="flex items-center">
            {isMobile && (
              <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-4">
                <Menu className="h-6 w-6" />
              </Button>
            )}
            <h1 className="text-xl font-semibold">Dashboard</h1>
          </div>
          <Button variant="outline" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4 hidden sm:inline" /> Logout
          </Button>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="border-t p-4">
          <MadeWithDyad />
        </footer>
      </div>
    </div>
  );
};

export default Layout;