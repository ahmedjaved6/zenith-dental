import React from 'react';
import { ArrowLeft, Users, Clock, Zap, Calendar, Award, CheckCircle2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

interface ClinicDashboardViewProps {
  onBack: () => void;
  onViewSubscription: () => void;
}

export const ClinicDashboardView: React.FC<ClinicDashboardViewProps> = ({ onBack, onViewSubscription }) => {
  return (
    <div className="max-w-5xl mx-auto p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Clinic Performance</h1>
          <p className="text-gray-500 mt-1">Daily overview and subscription status</p>
        </div>
        <Button 
          variant="primary" 
          onClick={onBack}
          className="shadow-ios-sm font-medium"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Live Queue
        </Button>
      </div>

      <div className="space-y-8">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Patients Today */}
          <Card padding="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Users size={20} />
              </div>
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">+12%</span>
            </div>
            <div>
              <div className="text-3xl font-semibold text-gray-900">24</div>
              <div className="text-sm font-medium text-gray-500 mt-1">Patients Today</div>
            </div>
          </Card>

          {/* Patients This Week */}
          <Card padding="p-6">
             <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                <Calendar size={20} />
              </div>
            </div>
            <div>
              <div className="text-3xl font-semibold text-gray-900">142</div>
              <div className="text-sm font-medium text-gray-500 mt-1">Visits This Week</div>
            </div>
          </Card>

          {/* Average Wait */}
          <Card padding="p-6">
             <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                <Clock size={20} />
              </div>
              <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-1 rounded-full">Target &lt;15m</span>
            </div>
            <div>
              <div className="text-3xl font-semibold text-gray-900">12<span className="text-lg font-medium text-gray-400 ml-1">min</span></div>
              <div className="text-sm font-medium text-gray-500 mt-1">Avg. Wait Time</div>
            </div>
          </Card>

          {/* Peak Hour */}
          <Card padding="p-6">
             <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600">
                <Zap size={20} />
              </div>
            </div>
            <div>
              <div className="text-xl font-semibold text-gray-900 pt-1">10<span className="text-sm font-normal text-gray-500">am</span> - 11<span className="text-sm font-normal text-gray-500">am</span></div>
              <div className="text-sm font-medium text-gray-500 mt-2">Peak Activity</div>
            </div>
          </Card>
        </div>

        {/* Subscription & System Status */}
        <Card padding="p-8" className="relative overflow-hidden border-blue-100 bg-gradient-to-br from-white to-blue-50/30">
           <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-start gap-4 flex-1">
                  <div className="w-14 h-14 rounded-2xl bg-gray-900 text-white flex items-center justify-center shadow-lg shadow-gray-200">
                      <Award size={28} />
                  </div>
                  <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-lg font-bold text-gray-900">Professional Plan</h2>
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200 uppercase tracking-wide">Active</span>
                      </div>
                      <p className="text-gray-500 mt-1 max-w-md">
                        Your clinic is running on the Professional tier. All features are enabled, including priority support.
                      </p>
                  </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-6 w-full md:w-auto border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-8">
                  <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                        <CheckCircle2 size={16} className="text-green-500" />
                        <span>Next Billing: Oct 24, 2024</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                        <CheckCircle2 size={16} className="text-green-500" />
                        <span>5 User Licenses</span>
                      </div>
                  </div>
                  
                  <Button variant="secondary" onClick={onViewSubscription} className="bg-white border border-gray-200 hover:bg-gray-50 text-sm h-10 font-medium">
                    Manage Plan
                  </Button>
              </div>
           </div>
        </Card>

        {/* Quiet footer */}
        <div className="text-center pt-8 pb-4">
            <p className="text-xs text-gray-400 font-medium">Zenith System v1.2 • Data updated just now</p>
        </div>
      </div>
    </div>
  );
};