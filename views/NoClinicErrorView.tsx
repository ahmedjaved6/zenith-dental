import React from 'react';
import { ShieldAlert, LogOut } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

interface NoClinicErrorViewProps {
  onLogout: () => void;
}

export const NoClinicErrorView: React.FC<NoClinicErrorViewProps> = ({ onLogout }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-ios-bg">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 bg-red-50 text-ios-red rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
          <ShieldAlert size={32} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">No Clinic Assigned</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          This system has not been initialized yet. Please contact a Doctor or Administrator to set up the clinic workspace.
        </p>
        <Card padding="p-2">
            <Button variant="ghost" fullWidth onClick={onLogout} className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                <LogOut size={18} className="mr-2" />
                Return to Login
            </Button>
        </Card>
      </div>
    </div>
  );
};