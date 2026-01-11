import React, { useState } from 'react';
import { Clock, CheckCircle, MoreHorizontal, User, Play, Coffee, Zap, BarChart2, FileClock, Calendar, Loader2, CheckCircle2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Patient, PatientStatus, DoctorStatus } from '../types';

interface DoctorDashboardProps {
  patients: Patient[];
  onUpdateStatus: (id: string, status: PatientStatus) => void;
  doctorStatus: DoctorStatus;
  onToggleStatus: () => void;
  onViewStats: () => void;
  onViewCalendar: () => void;
  currentClinicId: string | null;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ 
  patients, 
  onUpdateStatus,
  doctorStatus,
  onToggleStatus,
  onViewStats,
  onViewCalendar,
  currentClinicId
}) => {
  const currentPatient = patients.find(p => p.status === 'IN_TREATMENT');
  const waitingPatients = patients.filter(p => p.status === 'IN_QUEUE' || p.status === 'BOOKED');
  const completedToday = patients.filter(p => p.status === 'COMPLETED');
  
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [startingId, setStartingId] = useState<string | null>(null);

  const contextData = {
    lastVisit: 'Sep 24, 2023',
    lastTreatment: 'General Check-up'
  };

  const formatName = (fullName: string) => {
    const parts = fullName.trim().split(' ');
    if (parts.length < 2) return fullName;
    const firstName = parts[0];
    const lastInitial = parts[parts.length - 1].charAt(0);
    return `${firstName} ${lastInitial}.`;
  };

  const handleCompleteSession = (id: string) => {
    setCompletingId(id);
    setTimeout(() => {
        onUpdateStatus(id, 'COMPLETED');
        setCompletingId(null);
    }, 400);
  };

  const handleStartSession = (id: string) => {
    if (currentPatient || doctorStatus !== 'READY') return;
    setStartingId(id);
    setTimeout(() => {
        onUpdateStatus(id, 'IN_TREATMENT');
        setStartingId(null);
    }, 300);
  };

  const renderCompleteButton = (isMobile: boolean) => (
      <Button 
        variant="primary" 
        className={`text-lg shadow-xl hover:scale-[1.01] transition-transform duration-200 rounded-2xl flex items-center justify-center font-medium ${
            isMobile 
            ? 'w-full h-14' 
            : 'w-auto h-16 px-10'
        } ${
            completingId 
            ? 'bg-green-500 text-white hover:bg-green-600 shadow-green-200' 
            : 'bg-gray-900 hover:bg-black text-white shadow-gray-200'
        }`}
        onClick={() => currentPatient && handleCompleteSession(currentPatient.id)}
        disabled={!!completingId}
      >
        {completingId ? (
            <>
                <Loader2 size={24} className="mr-3 animate-spin" />
                Updating Status...
            </>
        ) : (
            <>
                <CheckCircle size={24} className="mr-3" />
                Complete Session
            </>
        )}
      </Button>
  );

  return (
    <>
      <div className="max-w-[1400px] mx-auto p-6 animate-fade-in pb-32 sm:pb-12">
        
        {/* Top Action Bar */}
        <div className="flex justify-between items-center mb-10 px-2">
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight hidden sm:block opacity-0">Live Queue</h1> 
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end ml-auto">
             <button 
               onClick={onViewCalendar}
               className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center gap-2 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors min-h-[48px]"
             >
               <Calendar size={18} />
               <span>Schedule</span>
             </button>
             <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block"></div>
             <button 
               onClick={onViewStats}
               className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center gap-2 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors min-h-[48px]"
             >
               <BarChart2 size={18} />
               <span>Clinic Dashboard</span>
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* LEFT COLUMN - ACTIVE PATIENT */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between px-2">
               <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${completingId ? 'bg-gray-300' : 'bg-green-500 animate-pulse'}`}></span>
                  <h2 className="text-sm font-semibold text-green-600 uppercase tracking-widest">
                    {completingId ? 'Finishing...' : 'Now Treating'}
                  </h2>
               </div>
               
               {/* Status Toggle */}
               <div className="flex items-center bg-white rounded-full p-1.5 shadow-sm border border-gray-200">
                  <button
                     onClick={() => doctorStatus === 'ON_BREAK' && onToggleStatus()}
                     className={`px-5 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all duration-200 min-h-[40px] ${doctorStatus === 'READY' ? 'bg-green-50 text-green-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                     <Zap size={16} fill={doctorStatus === 'READY' ? "currentColor" : "none"} />
                     READY
                  </button>
                  <button
                     onClick={() => doctorStatus === 'READY' && onToggleStatus()}
                     className={`px-5 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all duration-200 min-h-[40px] ${doctorStatus === 'ON_BREAK' ? 'bg-orange-50 text-orange-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                     <Coffee size={16} />
                     BREAK
                  </button>
               </div>
            </div>

            <section>
              {currentPatient ? (
                <Card 
                  padding="p-0"
                  className="min-h-[600px] flex flex-col justify-between shadow-2xl shadow-green-900/5 ring-1 ring-green-500/10 relative overflow-hidden bg-white animate-scale-in"
                >
                  {/* Completion Overlay Feedback */}
                  <div 
                    className={`absolute inset-0 z-30 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center transition-opacity duration-200 pointer-events-none ${completingId === currentPatient.id ? 'opacity-100' : 'opacity-0'}`}
                  >
                       <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-4 transform scale-100">
                          <CheckCircle size={48} className="text-green-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Session Completed</h3>
                  </div>

                  {/* Break Overlay */}
                  {doctorStatus === 'ON_BREAK' && !completingId && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-8 transition-opacity duration-200">
                          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                              <Coffee size={40} className="text-orange-500" />
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900">You are on break</h3>
                          <p className="text-gray-500 mt-2 max-w-sm">
                              Finish your break to continue treatment with {formatName(currentPatient.name)}.
                          </p>
                          <Button onClick={onToggleStatus} className="mt-8 bg-orange-500 hover:bg-orange-600 text-white border-none">
                              Resume Work
                          </Button>
                      </div>
                  )}

                  {/* Main Content Container */}
                  <div className={`p-8 sm:p-12 flex-1 flex flex-col justify-between transition-all duration-150 ease-out ${completingId ? 'opacity-50 scale-[0.99] grayscale' : 'opacity-100 scale-100'}`}>
                    <div>
                      <div className="flex items-start justify-between mb-10">
                        <div className="flex flex-col sm:flex-row items-start gap-6 sm:gap-8 w-full">
                          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[2rem] flex items-center justify-center text-5xl sm:text-6xl font-semibold shadow-inner bg-blue-50 text-ios-blue shrink-0">
                            {currentPatient.name.charAt(0)}
                          </div>
                          <div className="pt-2 flex-1">
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight leading-[1.1]">
                                {formatName(currentPatient.name)}
                            </h1>
                            <div className="flex flex-col gap-3 mt-5">
                              <div className="flex items-center gap-3">
                                 <span className="text-xl text-gray-500 font-medium">
                                    {currentPatient.treatment}
                                 </span>
                                 <span className="text-gray-300">•</span>
                                 {currentPatient.appointmentType === 'WALK_IN' ? (
                                   <span className="px-3 py-1 rounded-md bg-blue-50 text-blue-600 text-xs font-semibold uppercase tracking-wider">Walk-in</span>
                                 ) : (
                                   <span className="px-3 py-1 rounded-md bg-purple-50 text-purple-600 text-xs font-semibold uppercase tracking-wider">
                                     {currentPatient.scheduledTime}
                                   </span>
                                 )}
                              </div>
                              <span className="font-mono text-gray-400 text-base tracking-wide">{currentPatient.phone}</span>
                            </div>
                          </div>
                        </div>
                        <button className="p-3 text-gray-300 hover:text-gray-600 rounded-full hover:bg-gray-50 transition-colors">
                          <MoreHorizontal size={28} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mt-12">
                        {/* Left: Stats */}
                        <div className="md:col-span-3 grid grid-cols-2 gap-4">
                            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col justify-center min-h-[110px]">
                              <div className="flex items-center gap-2 mb-2">
                                <Clock size={16} className="text-gray-400"/>
                                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Wait Time</span>
                              </div>
                              <p className="text-2xl font-semibold text-gray-900">{currentPatient.waitTimeMinutes}<span className="text-sm font-medium text-gray-400 ml-1">m</span></p>
                            </div>
                            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col justify-center min-h-[110px]">
                              <div className="flex items-center gap-2 mb-2">
                                <User size={16} className="text-gray-400"/>
                                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Type</span>
                              </div>
                              <p className="text-xl font-semibold text-gray-900">{currentPatient.appointmentType === 'WALK_IN' ? 'Walk-in' : 'Booked'}</p>
                            </div>
                        </div>

                        {/* Right: Patient Context Panel */}
                        <div className="md:col-span-2 bg-blue-50/50 rounded-2xl p-6 border border-blue-100/50 flex flex-col justify-between gap-4 min-h-[110px]">
                             <div className="flex items-center gap-2 text-blue-700/80 font-bold text-[11px] uppercase tracking-wider">
                                <FileClock size={16} />
                                <span>History</span>
                             </div>
                             
                             <div className="space-y-3 mt-1">
                                 <div className="flex justify-between items-baseline">
                                    <span className="text-xs text-gray-400 font-medium">Last Visit</span>
                                    <span className="text-sm font-semibold text-gray-700">{contextData.lastVisit}</span>
                                 </div>
                                 <div className="w-full h-px bg-blue-200/20"></div>
                                 <div className="flex justify-between items-baseline">
                                    <span className="text-xs text-gray-400 font-medium">Prev Tx</span>
                                    <span className="text-sm font-semibold text-gray-700 truncate max-w-[100px] text-right" title={contextData.lastTreatment}>{contextData.lastTreatment}</span>
                                 </div>
                             </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* DESKTOP BUTTON LOCATION */}
                  <div className="hidden sm:flex sm:justify-end sm:p-8 sm:pt-0 sm:mt-auto">
                     {renderCompleteButton(false)}
                  </div>
                </Card>
              ) : (
                // EMPTY STATE
                <Card className="min-h-[600px] flex flex-col items-center justify-center text-gray-400 border-dashed border-2 border-gray-200 shadow-none relative overflow-hidden bg-gray-50/50 animate-fade-in">
                   {doctorStatus === 'ON_BREAK' ? (
                       <>
                          <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-6 animate-scale-in">
                              <Coffee size={48} className="text-orange-400" />
                          </div>
                          <h3 className="text-2xl font-semibold text-gray-900">On Break</h3>
                          <p className="text-base mt-2 max-w-xs text-center text-gray-500">
                              Queue is paused. Toggle Ready to resume auto-seating.
                          </p>
                          <Button 
                              variant="secondary" 
                              className="mt-8 bg-orange-100 text-orange-700 hover:bg-orange-200 border-none h-14 font-medium"
                              onClick={onToggleStatus}
                          >
                              Resume Work
                          </Button>
                       </>
                  ) : (
                      <>
                          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                             <User size={48} className="opacity-20" />
                          </div>
                          <h3 className="text-2xl font-semibold text-gray-400">Chair Empty</h3>
                          <p className="text-base mt-2 text-center text-gray-400 max-w-xs">
                              {waitingPatients.filter(p => p.status === 'IN_QUEUE').length > 0 
                                  ? "Select a patient from the queue to start." 
                                  : "No patients currently waiting."}
                          </p>
                      </>
                  )}
                </Card>
              )}
            </section>
          </div>

          {/* RIGHT COLUMN - QUEUE & COMPLETED */}
          <div className="lg:col-span-4 flex flex-col h-full pt-2 gap-8">
            
            {/* UP NEXT SECTION */}
            <section>
                <div className="flex items-center justify-between mb-8 px-2">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                    Up Next
                </h2>
                <span className="bg-gray-100 text-gray-600 font-bold py-0.5 px-2.5 rounded-full text-xs">
                    {waitingPatients.filter(p => p.status === 'IN_QUEUE').length}
                </span>
                </div>
                
                <div className="space-y-5 max-h-[400px] overflow-y-auto no-scrollbar pb-2 relative">
                {/* Queue Break Overlay */}
                {doctorStatus === 'ON_BREAK' && waitingPatients.some(p => p.status === 'IN_QUEUE') && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 rounded-xl flex items-center justify-center animate-fade-in">
                        <div className="bg-white/90 px-4 py-3 rounded-xl shadow-sm border border-orange-100 text-orange-600 text-xs font-bold uppercase tracking-wider">
                            Queue Paused
                        </div>
                    </div>
                )}

                {waitingPatients.filter(p => p.status === 'IN_QUEUE').length > 0 ? (
                    waitingPatients.filter(p => p.status === 'IN_QUEUE').map((patient, index) => {
                    const isStarting = startingId === patient.id;
                    const canStart = !currentPatient && index === 0 && doctorStatus === 'READY';
                    
                    return (
                        <Card 
                        key={patient.id} 
                        padding="p-5 sm:p-6" 
                        className={`group transition-all duration-150 border-transparent hover:border-gray-200 cursor-pointer animate-slide-up ${
                            canStart 
                            ? 'ring-2 ring-blue-500/20 border-blue-500/30 bg-blue-50/30' 
                            : 'bg-white'
                        } ${isStarting ? 'scale-[0.98] opacity-80 bg-blue-50 ring-2 ring-blue-500' : 'hover:shadow-md'}`}
                        onClick={() => canStart && !isStarting && handleStartSession(patient.id)}
                        >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-5">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg transition-colors ${
                                canStart 
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                            }`}>
                                {isStarting ? <Loader2 size={20} className="animate-spin" /> : patient.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className={`font-medium text-lg leading-tight ${
                                    canStart ? 'text-blue-900' : 'text-gray-900'
                                }`}>
                                    {formatName(patient.name)}
                                    {patient.appointmentType === 'APPOINTMENT' && patient.scheduledTime && (
                                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-500 align-middle border border-gray-200/50">
                                        {patient.scheduledTime}
                                        </span>
                                    )}
                                </h3>
                                <p className="text-sm font-medium text-gray-500 mt-1.5">{patient.treatment}</p>
                            </div>
                            </div>
                            
                            {canStart && (
                            <div className="flex items-center gap-2 text-blue-600">
                                {isStarting ? (
                                    <span className="text-[10px] font-semibold uppercase tracking-wider animate-pulse">Starting...</span>
                                ) : (
                                    <>
                                        <span className="text-[10px] font-semibold uppercase tracking-wider">Start</span>
                                        <Play size={20} fill="currentColor" />
                                    </>
                                )}
                            </div>
                            )}
                        </div>
                        <div className="mt-5 pt-3 border-t border-gray-50 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 text-gray-400 font-medium">
                            <Clock size={14} />
                            <span>{patient.waitTimeMinutes}m wait</span>
                            </div>
                            <span className={`px-2.5 py-1 rounded-md font-semibold text-[11px] uppercase tracking-wide ${patient.appointmentType === 'WALK_IN' ? 'bg-gray-100 text-gray-500' : 'bg-purple-50 text-purple-600'}`}>
                            {patient.appointmentType === 'WALK_IN' ? 'Walk-in' : patient.scheduledTime || 'Appt'}
                            </span>
                        </div>
                        </Card>
                    );
                    })
                ) : (
                    <div className="text-center py-12 px-6 bg-white/50 rounded-2xl border border-dashed border-gray-200 animate-fade-in">
                    <p className="text-gray-400 font-medium text-sm">No patients waiting</p>
                    </div>
                )}
                </div>
            </section>

            {/* COMPLETED TODAY SECTION - Phase D3.1 */}
            <section>
                <div className="flex items-center justify-between mb-6 px-2">
                    <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                        Completed Today
                    </h2>
                    <span className="bg-green-50 text-green-600 font-bold py-0.5 px-2.5 rounded-full text-xs">
                        {completedToday.length}
                    </span>
                </div>

                <div className="space-y-3">
                    {completedToday.length > 0 ? (
                        completedToday.map((patient) => (
                            <div 
                                key={patient.id} 
                                className="flex items-center justify-between p-4 bg-white/40 border border-gray-100 rounded-xl opacity-75 hover:opacity-100 transition-opacity"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                                        <CheckCircle2 size={16} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900 leading-tight">{formatName(patient.name)}</h4>
                                        <p className="text-[11px] text-gray-500 font-medium mt-0.5">{patient.treatment}</p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Finished</span>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-6 border border-dashed border-gray-200 rounded-xl">
                            <p className="text-[11px] font-bold text-gray-300 uppercase tracking-widest">No sessions completed</p>
                        </div>
                    )}
                </div>
            </section>
          </div>

        </div>
      </div>

      {/* MOBILE BUTTON LOCATION */}
      {currentPatient && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-xl border-t border-gray-200 z-[100] pb-[calc(env(safe-area-inset-bottom)+1rem)] sm:hidden animate-none">
            {renderCompleteButton(true)}
        </div>
      )}
    </>
  );
};