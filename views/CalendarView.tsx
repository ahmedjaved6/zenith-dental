import React from 'react';
import { ArrowLeft, Clock, Calendar as CalendarIcon, MoreHorizontal } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Patient } from '../types';

interface CalendarViewProps {
  patients: Patient[];
  onBack: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ patients, onBack }) => {
  // Generate time slots from 8:00 to 18:00
  const hours = Array.from({ length: 11 }, (_, i) => i + 8); // 8 to 18

  // Filter only appointments and parse times
  const appointments = patients.filter(p => p.appointmentType === 'APPOINTMENT' && p.scheduledTime);

  const getAppointmentsForHour = (hour: number) => {
    return appointments.filter(p => {
      if (!p.scheduledTime) return false;
      const [h] = p.scheduledTime.split(':').map(Number);
      return h === hour;
    }).sort((a, b) => {
       const minA = parseInt(a.scheduledTime!.split(':')[1]);
       const minB = parseInt(b.scheduledTime!.split(':')[1]);
       return minA - minB;
    });
  };

  const formatHour = (hour: number) => {
    return hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`;
  };

  const isCurrentHour = (hour: number) => {
    const currentHour = new Date().getHours();
    return hour === currentHour;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-screen flex flex-col">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-50 text-ios-blue rounded-xl flex items-center justify-center">
            <CalendarIcon size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Today's Schedule</h1>
            <p className="text-gray-500 text-sm font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
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

      {/* Calendar Grid */}
      <Card padding="p-0" className="flex-1 overflow-hidden flex flex-col border border-gray-200 shadow-sm bg-white">
        <div className="overflow-y-auto flex-1 p-4 relative no-scrollbar">
            
            {/* Current Time Indicator Line (Mock position) */}
            <div className="absolute left-16 right-4 top-[320px] z-10 flex items-center pointer-events-none opacity-50">
                <div className="w-2 h-2 rounded-full bg-red-500 -ml-1"></div>
                <div className="h-px bg-red-500 flex-1"></div>
            </div>

            <div className="space-y-6">
                {hours.map((hour) => {
                    const hourApps = getAppointmentsForHour(hour);
                    const isNow = isCurrentHour(hour);

                    return (
                        <div key={hour} className="flex group min-h-[80px]">
                            {/* Time Column */}
                            <div className="w-16 flex-shrink-0 text-right pr-4 pt-2">
                                <span className={`text-xs font-semibold ${isNow ? 'text-blue-600' : 'text-gray-400'}`}>
                                    {formatHour(hour)}
                                </span>
                            </div>

                            {/* Slot Content */}
                            <div className="flex-1 border-t border-gray-100 pt-2 relative pb-4">
                                {hourApps.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {hourApps.map(app => (
                                            <div 
                                                key={app.id} 
                                                className={`p-4 rounded-xl border flex items-start justify-between transition-all hover:shadow-md cursor-default
                                                    ${app.status === 'COMPLETED' ? 'bg-gray-50 border-gray-200 opacity-60' : 
                                                      app.status === 'IN_TREATMENT' ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-100' : 
                                                      'bg-white border-gray-200 hover:border-blue-300'}`}
                                            >
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1.5">
                                                        <Clock size={12} className={app.status === 'IN_TREATMENT' ? 'text-blue-500' : 'text-gray-400'} />
                                                        <span className="text-xs font-bold text-gray-900">{app.scheduledTime}</span>
                                                        {app.status === 'IN_TREATMENT' && (
                                                            <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase">Now</span>
                                                        )}
                                                    </div>
                                                    <h3 className="text-sm font-semibold text-gray-900 leading-tight">
                                                        {app.name}
                                                    </h3>
                                                    <p className="text-xs text-gray-500 mt-1 font-medium">{app.treatment}</p>
                                                </div>
                                                {app.status !== 'COMPLETED' && (
                                                    <button className="text-gray-300 hover:text-gray-500">
                                                        <MoreHorizontal size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    // Empty Slot Visualization
                                    <div className="h-full w-full rounded-lg hover:bg-gray-50/50 transition-colors -mt-2"></div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      </Card>
    </div>
  );
};