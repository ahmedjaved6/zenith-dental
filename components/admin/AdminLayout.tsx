import React from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  LogOut, 
  ArrowLeft,
  Settings
} from 'lucide-react';
import { ViewState } from '../../types';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeView: ViewState;
  onNavigate: (view: ViewState) => void;
  onLogout: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children, 
  activeView, 
  onNavigate, 
  onLogout
}) => {
  
  const navItems = [
    { id: 'ADMIN_DASHBOARD', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'ADMIN_CLINICS', label: 'Clinics', icon: Building2 },
    { id: 'ADMIN_USERS', label: 'Users', icon: Users },
  ];

  const getPageTitle = () => {
    switch (activeView) {
      case 'ADMIN_DASHBOARD': return 'System Overview';
      case 'ADMIN_CLINICS': return 'Clinics Management';
      case 'ADMIN_USERS': return 'User Directory';
      default: return 'Admin Console';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
      
      {/* TOP NAVIGATION BAR - Always Visible */}
      <nav className="h-16 bg-white/90 backdrop-blur-md border-b border-gray-200 fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-6 shadow-sm transition-all">
        
        {/* LEFT: Branding */}
        <div className="flex items-center gap-3 md:w-48 shrink-0">
           <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white font-bold font-mono shadow-md">A</div>
           <span className="font-bold text-lg tracking-tight text-gray-900 hidden sm:block">Admin Console</span>
        </div>

        {/* CENTER: Navigation Links (Segmented Control Style) */}
        <div className="flex items-center bg-gray-100/80 p-1 rounded-xl border border-gray-200/50 mx-2 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as ViewState)}
                className={`flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  isActive 
                    ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                }`}
              >
                <item.icon size={16} className={isActive ? 'text-blue-500' : 'text-gray-400'} />
                <span className="hidden sm:inline">{item.label}</span>
                {/* Icon-only on very small screens if needed, but keeping text for clarity usually better */}
              </button>
            )
          })}
        </div>

        {/* RIGHT: Actions */}
        <div className="flex items-center justify-end gap-2 md:gap-3 md:w-48 shrink-0">
          <button 
             onClick={() => onNavigate('LOGIN')}
             className="text-xs md:text-sm font-medium text-gray-500 hover:text-gray-900 px-2 md:px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
             Back to App
          </button>
          
          <div className="h-4 w-px bg-gray-300 hidden sm:block"></div>

          <button 
             onClick={onLogout}
             className="flex items-center gap-2 text-xs md:text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors border border-red-100"
             title="Logout"
          >
             <LogOut size={16} />
             <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT WRAPPER */}
      <main className="flex-1 pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
         {/* Page Header */}
         <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{getPageTitle()}</h1>
              <p className="text-sm text-gray-500 mt-1">Manage your clinic system settings and users.</p>
            </div>
            
            <div className="flex items-center gap-2 text-xs font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
               <Settings size={12} />
               <span>SYSTEM STATUS: ONLINE</span>
            </div>
         </div>
         
         {children}
      </main>
    </div>
  );
};