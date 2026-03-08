import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  QrCode, 
  Settings, 
  Ticket, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';
import { useAppStore } from '../../app/store/useAppStore';
import { useAuthStore } from '../../app/store/useAuthStore';
import { cn } from '../../utils/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: QrCode, label: 'QR Scanner', path: '/scan' },
  { icon: Settings, label: 'QR Config', path: '/qr-config', roles: ['admin'] },
  { icon: Ticket, label: 'BookMyShow', path: '/bookmyshow' },
];

export const Sidebar: React.FC = () => {
  const { sidebarOpen, toggleSidebar } = useAppStore();
  const { user } = useAuthStore();

  const filteredNavItems = navItems.filter(item => 
    !item.roles || (user && item.roles.includes(user.role))
  );

  return (
    <aside 
      className={cn(
        "h-screen bg-card border-r border-border transition-all duration-300 flex flex-col",
        sidebarOpen ? "w-64" : "w-20"
      )}
    >
      <div className="p-6 flex items-center justify-between">
        {sidebarOpen && <span className="text-xl font-bold text-primary">Antigravity</span>}
        <button 
          onClick={toggleSidebar}
          className="p-2 hover:bg-accent rounded-md transition-colors"
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center p-3 rounded-lg transition-colors gap-3",
              isActive 
                ? "bg-primary text-primary-foreground" 
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <item.icon size={20} />
            {sidebarOpen && <span className="font-medium">{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
