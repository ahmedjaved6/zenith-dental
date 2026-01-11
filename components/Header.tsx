import React from 'react';
import { LogOut } from 'lucide-react';
import { Role } from '../types';

interface HeaderProps {
  clinicName: string;
  role: Role;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ clinicName, role, onLogout }) => {
  return (
    <header className="sticky top-0 z-10 w-full bg-ios-bg/80 backdrop-blur-xl border-b border-gray-200/50 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-ios-blue flex items-center justify-center shadow-sm">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">{clinicName}</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="px-3 py-1 rounded-full bg-white border border-gray-200 shadow-sm">
          <span className="text-sm font-medium text-gray-500 uppercase tracking-wider text-[11px]">
            {role === 'DOCTOR' ? 'Dr. Smith' : 'Assistant'}
          </span>
        </div>
        <button 
          onClick={onLogout}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-200/50"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};