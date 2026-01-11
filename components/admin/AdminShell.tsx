import React from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  LogOut, 
  Settings, 
  Shield
} from 'lucide-react';
import { ViewState } from '../../types';

interface AdminShellProps {
  children: React.ReactNode;
  activeView: ViewState;
  onNavigate: (view: ViewState) => void;
  onLogout: () => void;
  title: string;
}

export const AdminShell: React.FC<AdminShellProps> = ({ 
  children, 
  activeView, 
  onNavigate, 
  onLogout,
  title 
}) => {
  const navItemClass = (view: ViewState) => 
    `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-200 group ${
      activeView === view 
        ? 'bg-gray-900 text-white shadow-md' 
        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
    }`;

  const iconClass = (view: ViewState) => 
    activeView === view ? 'text-blue-400' : 'text-gray-400 group-hover:text-gray-600';

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col fixed inset-y-0 z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="h-16 flex items-center px-6 border-b border-gray-100 bg-white/50 backdrop-blur-sm">
           <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-gray-900/20">
             <span className="text-white font-bold">Z</span>
           </div>
           <span className="font-bold text-lg tracking-tight">Admin Console</span>
        </div>

        <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto">
          <div className="px-2 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
            Overview
          </div>
          <button 
            onClick={() => onNavigate('ADMIN_DASHBOARD')}
            className={navItemClass('ADMIN_DASHBOARD')}
          >
            <LayoutDashboard size={18} className={iconClass('ADMIN_DASHBOARD')} />
            Dashboard
          </button>
          <button 
            onClick={() => onNavigate('ADMIN_CLINICS')}
            className={navItemClass('ADMIN_CLINICS')}
          >
            <Building2 size={18} className={iconClass('ADMIN_CLINICS')} />
            Clinics
          </button>
          <button 
            onClick={() => onNavigate('ADMIN_USERS')}
            className={navItemClass('ADMIN_USERS')}
          >
            <Users size={18} className={iconClass('ADMIN_USERS')} />
            Users
          </button>

          <div className="px-2 py-3 mt-6 text-xs font-bold text-gray-400 uppercase tracking-wider">
            System
          </div>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded-lg font-medium transition-colors group">
            <Settings size={18} className="text-gray-400 group-hover:text-gray-600" />
            Settings
          </button>
        </nav>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3 px-3 py-2.5 text-gray-400 text-sm">
            <Shield size={16} />
            <span>v1.0.4 Admin</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 md:ml-64 min-h-screen flex flex-col">
        {/* HEADER */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10 transition-shadow hover:shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-gray-100 border border-gray-200">
               <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-[10px] font-bold text-gray-600">
                 AD
               </div>
               <span className="text-sm font-medium text-gray-700">Administrator</span>
             </div>
             <div className="h-6 w-px bg-gray-300 mx-1"></div>
             <button 
                onClick={onLogout}
                className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-red-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
             >
                <LogOut size={16} />
                Logout
             </button>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="p-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in duration-500 flex-1">
            {children}
        </div>
      </main>
    </div>
  );
};