import React, { useState } from 'react';
import { Building2, Users, ArrowRight, ArrowLeft, LogOut } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

interface ClinicSetupViewProps {
  onCreateNew: () => void;
  onLogout: () => void;
}

export const ClinicSetupView: React.FC<ClinicSetupViewProps> = ({ onCreateNew, onLogout }) => {
  const [showJoinPlaceholder, setShowJoinPlaceholder] = useState(false);

  if (showJoinPlaceholder) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-ios-bg animate-fade-in">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-blue-50 text-ios-blue rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Users size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Join Existing Clinic</h1>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Clinic joining will be enabled by admin invitation. Please contact your clinic administrator to be added to the organization.
          </p>
          <Card padding="p-2">
            <Button variant="secondary" fullWidth onClick={() => setShowJoinPlaceholder(false)} className="text-gray-900">
              <ArrowLeft size={18} className="mr-2" />
              Back
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-ios-bg">
      <div className="w-full max-w-2xl animate-fade-in">
        
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Set up your clinic</h1>
          <p className="text-gray-500 text-lg">Choose how you want to continue</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Option 1: Create New */}
          <Card 
            padding="p-8" 
            className="flex flex-col items-center text-center hover:scale-[1.02] transition-transform duration-300 border border-gray-100 hover:border-blue-200 shadow-ios-md cursor-pointer h-full"
            onClick={onCreateNew}
          >
            <div className="w-16 h-16 bg-blue-50 text-ios-blue rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <Building2 size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Create a new clinic</h2>
            <p className="text-gray-500 text-sm mb-8 flex-1">
              For doctors starting or managing their own clinical workspace
            </p>
            <Button fullWidth onClick={(e) => { e.stopPropagation(); onCreateNew(); }}>
              <span>Create Clinic</span>
              <ArrowRight size={18} className="ml-2" />
            </Button>
          </Card>

          {/* Option 2: Join Existing */}
          <Card 
            padding="p-8" 
            className="flex flex-col items-center text-center hover:scale-[1.02] transition-transform duration-300 border border-gray-100 hover:border-purple-200 shadow-ios-md cursor-pointer h-full"
            onClick={() => setShowJoinPlaceholder(true)}
          >
            <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <Users size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Join existing clinic</h2>
            <p className="text-gray-500 text-sm mb-8 flex-1">
              For doctors joining a clinic team they already work with
            </p>
            <Button 
              variant="secondary" 
              fullWidth 
              onClick={(e) => { e.stopPropagation(); setShowJoinPlaceholder(true); }}
              className="bg-gray-50 hover:bg-gray-100 border border-gray-200"
            >
              <span>Join Clinic</span>
              <ArrowRight size={18} className="ml-2" />
            </Button>
          </Card>
        </div>

        <div className="mt-12 text-center">
           <button 
             onClick={onLogout}
             className="text-sm font-medium text-gray-400 hover:text-gray-600 flex items-center justify-center gap-2 mx-auto px-4 py-2 rounded-lg hover:bg-gray-100/50 transition-colors"
           >
              <LogOut size={14} />
              Sign out
           </button>
        </div>

      </div>
    </div>
  );
};