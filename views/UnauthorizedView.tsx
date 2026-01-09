import React from 'react';
import { Lock, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

interface UnauthorizedViewProps {
  onReturn: () => void;
}

export const UnauthorizedView: React.FC<UnauthorizedViewProps> = ({ onReturn }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-ios-bg">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock size={32} className="text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Unauthorized Access</h1>
        <p className="text-gray-500 mb-8">
          You do not have permission to view this page. This area is restricted to administrators only.
        </p>
        <Button onClick={onReturn} variant="secondary" fullWidth>
          <ArrowLeft size={18} className="mr-2" />
          Return to Application
        </Button>
      </div>
    </div>
  );
};