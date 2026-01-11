import React, { useState } from 'react';
import { Plus, UserCheck, Clock, ArrowRight, Megaphone, User, Coffee } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Patient, PatientStatus, TREATMENTS, Treatment, AppointmentType, DoctorStatus } from '../types';

interface AssistantDashboardProps {
  patients: Patient[];
  onAddPatient: (p: Partial<Patient>) => Promise<void>;
  onUpdateStatus: (id: string, status: PatientStatus) => void;
  doctorStatus: DoctorStatus;
  currentClinicId: string | null;
}

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00'
];

export const AssistantDashboard: React.FC<AssistantDashboardProps> = ({ 
  patients, 
  onAddPatient,
  onUpdateStatus,
  doctorStatus,
  currentClinicId
}) => {
  const [newPatient, setNewPatient] = useState({ 
    name: '', 
    phone: '', 
    treatment: TREATMENTS[0] as Treatment,
    appointmentType: 'WALK_IN' as AppointmentType,
    scheduledTime: ''
  });

  const [acknowledgedPatients, setAcknowledgedPatients] = useState<Set<string>>(new Set());

  // Calculate booked slots for "Today" (Mock logic assumes single day view)
  const bookedSlots = new Set(
    patients
      .filter(p => p.appointmentType === 'APPOINTMENT' && p.status !== 'CANCELLED' && p.status !== 'COMPLETED' && p.scheduledTime)
      .map(p => p.scheduledTime)
  );

  const activePatient = patients.find(p => p.status === 'IN_TREATMENT');
  const showCallBanner = activePatient && !acknowledgedPatients.has(activePatient.id);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // --- START OBSERVABILITY LOGS ---
    console.log("REGISTER HANDLER CALLED");
    console.log("Patient payload being constructed:", newPatient);
    console.log("Current Clinic ID in Dashboard Context:", currentClinicId);
    // --- END OBSERVABILITY LOGS ---
    
    if (newPatient.name && newPatient.phone) {
      // Phase D2.3.2: Write-through persistence
      await onAddPatient({
        ...newPatient,
      });
      
      setNewPatient({ 
        name: '', 
        phone: '', 
        treatment: TREATMENTS[0],
        appointmentType: 'WALK_IN',
        scheduledTime: ''
      });
    }
  };

  const handleAcknowledgeCall = (id: string) => {
    setAcknowledgedPatients(prev => new Set(prev).add(id));
  };

  const getAction = (patient: Patient) => {
    if (patient.status === 'BOOKED') {
      return (
        <Button 
          variant="secondary" 
          onClick={() => onUpdateStatus(patient.id, 'IN_QUEUE')}
          className="text-xs py-2 px-4 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 min-h-[48px] md:min-h-[40px] font-medium"
        >
          <UserCheck size={16} className="mr-2" />
          Mark Arrived
        </Button>
      );
    }
    
    if (patient.status === 'IN_QUEUE') {
      return (
        <span className="text-sm font-medium text-gray-400 flex items-center min-h-[48px] md:min-h-[40px]">
          <Clock size={16} className="mr-2" /> Waiting
        </span>
      );
    }
    
    if (patient.status === 'IN_TREATMENT') {
        if (!acknowledgedPatients.has(patient.id)) {
            return (
                <Button 
                variant="primary" 
                onClick={() => handleAcknowledgeCall(patient.id)}
                className="text-xs py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200/50 animate-pulse min-h-[48px] md:min-h-[40px] font-medium"
              >
                <ArrowRight size={16} className="mr-2" />
                Send In
              </Button>
            )
        }
        return (
            <span className="text-sm font-medium text-blue-600 flex items-center min-h-[48px] md:min-h-[40px]">
              <User size={16} className="mr-2" /> With Doctor
            </span>
        );
    }
    return <div className="min-h-[48px] md:min-h-[40px]" />; 
  };

  const sortedPatients = [...patients].sort((a, b) => {
    const statusOrder = { 
      IN_TREATMENT: 0,
      IN_QUEUE: 1, 
      BOOKED: 2, 
      COMPLETED: 3, 
      CANCELLED: 4 
    };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  const isFormValid = newPatient.name && newPatient.phone && 
    (newPatient.appointmentType === 'WALK_IN' || newPatient.scheduledTime);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-10 animate-fade-in pb-24">
      
      {/* STATUS BANNERS */}
      <div className="space-y-4 sticky top-24 z-20">
        
        {/* Break Indicator */}
        {doctorStatus === 'ON_BREAK' && (
            <div className="w-full bg-orange-100 text-orange-800 border border-orange-200 p-5 rounded-2xl shadow-sm flex items-center gap-4 animate-slide-up">
                 <div className="w-12 h-12 bg-orange-200 rounded-xl flex items-center justify-center">
                    <Coffee size={24} className="text-orange-700" />
                 </div>
                 <div>
                    <h3 className="font-bold text-base">Doctor is on break</h3>
                    <p className="text-orange-700/80 text-sm">Patients will remain in queue until doctor returns.</p>
                 </div>
            </div>
        )}

        {/* Call Indicator */}
        {showCallBanner && activePatient && (
            <div className="w-full bg-blue-600 text-white p-5 rounded-2xl shadow-ios-md flex flex-col sm:flex-row items-center justify-between gap-4 animate-slide-up">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm shrink-0">
                        <Megaphone size={24} className="text-white animate-bounce" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg leading-tight">Calling: {activePatient.name}</h3>
                        <p className="text-blue-100 text-sm">Send to clinic room</p>
                    </div>
                </div>
                <Button 
                    className="bg-white text-blue-600 hover:bg-blue-50 border-none shadow-none w-full sm:w-auto min-h-[48px]"
                    onClick={() => handleAcknowledgeCall(activePatient.id)}
                >
                    Confirm Sent
                </Button>
            </div>
        )}
      </div>

      {/* Registration Area */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-6 px-1">New Registration</h2>
        <Card className="overflow-hidden" padding="p-6 sm:p-8">
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left: Patient Details */}
              <div className="flex-1 space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input 
                    label="Phone Number" 
                    placeholder="(555) 000-0000" 
                    value={newPatient.phone}
                    onChange={e => setNewPatient({...newPatient, phone: e.target.value})}
                  />
                  <Input 
                    label="Full Name" 
                    placeholder="Patient Name"
                    value={newPatient.name}
                    onChange={e => setNewPatient({...newPatient, name: e.target.value})}
                  />
                 </div>
                 
                 <div className="w-full">
                   <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                     Treatment
                   </label>
                   <select 
                     className="w-full bg-gray-50/50 border border-gray-200 text-gray-900 text-[17px] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ios-blue/20 focus:border-ios-blue transition-all min-h-[48px]"
                     value={newPatient.treatment}
                     onChange={e => setNewPatient({...newPatient, treatment: e.target.value as Treatment})}
                   >
                     {TREATMENTS.map(t => (
                       <option key={t} value={t}>{t}</option>
                     ))}
                   </select>
                 </div>
              </div>

              {/* Right: Appointment Type */}
              <div className="lg:w-80 bg-gray-50 rounded-xl p-6 border border-gray-100 flex flex-col justify-between gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Appointment Type
                  </label>
                  <div className="flex bg-gray-200/50 p-1.5 rounded-xl mb-4">
                    <button
                      type="button"
                      onClick={() => setNewPatient({...newPatient, appointmentType: 'WALK_IN', scheduledTime: ''})}
                      className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all min-h-[44px] ${newPatient.appointmentType === 'WALK_IN' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      Walk-in
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewPatient({...newPatient, appointmentType: 'APPOINTMENT'})}
                      className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all min-h-[44px] ${newPatient.appointmentType === 'APPOINTMENT' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      Booked
                    </button>
                  </div>

                  {newPatient.appointmentType === 'APPOINTMENT' && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                            Select Time Slot
                        </label>
                        <div className="grid grid-cols-3 gap-2 h-48 overflow-y-auto no-scrollbar pr-1">
                            {TIME_SLOTS.map(slot => {
                                const isBooked = bookedSlots.has(slot);
                                const isSelected = newPatient.scheduledTime === slot;
                                return (
                                    <button
                                        key={slot}
                                        type="button"
                                        disabled={isBooked}
                                        onClick={() => setNewPatient({...newPatient, scheduledTime: slot})}
                                        className={`py-2 text-xs font-bold rounded-lg transition-all border ${
                                            isSelected 
                                            ? 'bg-ios-blue text-white border-blue-600 shadow-md scale-[1.02]'
                                            : isBooked
                                                ? 'bg-gray-100 text-gray-300 border-transparent cursor-not-allowed'
                                                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600'
                                        }`}
                                    >
                                        {slot}
                                    </button>
                                );
                            })}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2 text-center font-medium">
                           {newPatient.scheduledTime ? `Selected: ${newPatient.scheduledTime}` : '* Select an available time'}
                        </p>
                    </div>
                  )}

                  {newPatient.appointmentType === 'WALK_IN' && (
                    <div className="text-xs text-gray-400 p-2 text-center leading-relaxed font-medium">
                      {doctorStatus === 'READY' 
                         ? "Might be seated immediately if chair is empty." 
                         : "Doctor is on break. Patient will be queued."}
                    </div>
                  )}
                </div>

                <Button type="submit" fullWidth disabled={!isFormValid} className="h-12 text-base font-medium">
                  <Plus size={20} className="mr-2" />
                  {newPatient.appointmentType === 'WALK_IN' ? 'Register' : 'Book Appointment'}
                </Button>
              </div>
            </div>
          </form>
        </Card>
      </section>

      {/* Patient List */}
      <section>
        <div className="flex items-center justify-between mb-6 px-1">
          <h2 className="text-xl font-semibold text-gray-900">Patient Status</h2>
          <span className="text-sm text-gray-500 font-medium">{patients.length} Total</span>
        </div>
        
        <div className="space-y-5">
          {sortedPatients.map((patient) => (
            <Card key={patient.id} padding="p-6" className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all animate-slide-up ${patient.status === 'IN_TREATMENT' ? 'ring-2 ring-blue-500 shadow-md' : ''}`}>
              <div className="flex items-center gap-5 w-full md:w-auto">
                <div className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center font-bold text-sm
                  ${patient.appointmentType === 'WALK_IN' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}
                >
                  {patient.appointmentType === 'WALK_IN' ? 'W' : 'A'}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-gray-900 text-lg">{patient.name}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                     <span className="text-sm font-medium text-gray-700">{patient.treatment}</span>
                     <span className="text-gray-300 text-xs hidden sm:inline">•</span>
                     <span className="text-sm text-gray-500 font-mono hidden sm:inline">{patient.phone}</span>
                     {patient.scheduledTime && (
                       <>
                        <span className="text-gray-300 text-xs hidden sm:inline">•</span>
                        <span className="text-xs flex items-center text-gray-500 font-medium">
                          <Clock size={12} className="mr-1" /> {patient.scheduledTime}
                        </span>
                       </>
                     )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t border-gray-100 md:border-none pt-4 md:pt-0 mt-2 md:mt-0">
                <Badge status={patient.status} />
                <div className="flex-shrink-0">
                  {getAction(patient)}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};