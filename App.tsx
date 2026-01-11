import React, { useState, useEffect } from 'react';
import { Role, ViewState, Patient, PatientStatus, TREATMENTS, DoctorStatus } from './types';
import { Header } from './components/Header';
import { LoginView } from './views/LoginView';
import { CreateClinicView } from './views/CreateClinicView';
import { ClinicSetupView } from './views/ClinicSetupView';
import { NoClinicErrorView } from './views/NoClinicErrorView';
import { AssistantDashboard } from './views/AssistantDashboard';
import { DoctorDashboard } from './views/DoctorDashboard';
import { ClinicDashboardView } from './views/ClinicDashboardView';
import { CalendarView } from './views/CalendarView';
import { SubscriptionView } from './views/SubscriptionView';
import { AdminDashboard } from './views/admin/AdminDashboard';
import { AdminClinicsView } from './views/admin/AdminClinicsView';
import { AdminUsersView } from './views/admin/AdminUsersView';
import { AdminLayout } from './components/admin/AdminLayout';
import { UnauthorizedView } from './views/UnauthorizedView';
import { supabase } from './lib/supabase';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  // Application State
  const [userRole, setUserRole] = useState<Role>(null);
  const [clinicName, setClinicName] = useState<string>(''); 
  const [currentClinicId, setCurrentClinicId] = useState<string | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]); // Initialized as empty array
  const [doctorStatus, setDoctorStatus] = useState<DoctorStatus>('READY');
  const [view, setView] = useState<ViewState>('LOGIN');
  const [isSessionLoading, setIsSessionLoading] = useState(true);

  // --- DERIVED STATE (GLOBAL VIEW LOCK) ---
  let effectiveView = view;
  
  if (userRole === 'ADMIN') {
    if (!view.startsWith('ADMIN_')) {
       effectiveView = 'ADMIN_DASHBOARD';
    }
  }

  // --- Auth & Session Logic ---

  useEffect(() => {
    let mounted = true;

    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (mounted) {
        if (session) {
          console.log("INITIAL SESSION FOUND", session.user.id);
          hydrateUser(session.user.id);
        } else {
          setIsSessionLoading(false);
          setView('LOGIN');
        }
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      
      if (userRole === 'ADMIN') return;

      if (!session) {
        setUserRole(null);
        setClinicName('');
        setCurrentClinicId(null);
        setPatients([]); // Clear patients on logout
        setView('LOGIN');
        setIsSessionLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [userRole]);

  const fetchPatients = async (clinicId: string) => {
    try {
      // Phase D3.1: Fetch patients only for the current day
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      const { data: fetchedData, error: fetchError } = await supabase
        .from('patients')
        .select('*')
        .eq('clinic_id', clinicId)
        .gte('created_at', todayISO)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      const mapped = (fetchedData || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        phone: p.phone,
        treatment: p.treatment,
        appointmentType: p.appointment_type,
        scheduledTime: p.scheduled_time,
        status: p.status,
        arrivalTime: p.arrival_time ? new Date(p.arrival_time) : undefined,
        waitTimeMinutes: p.wait_time_minutes || 0,
      })) as Patient[];

      console.log('HYDRATION: Patients synced from Supabase:', mapped.length);
      const completedCount = mapped.filter(p => p.status === 'COMPLETED').length;
      console.log(`RETENTION CHECK: ${completedCount} completed patients retained in state.`);
      
      setPatients(mapped);
    } catch (err) {
      console.error('Fetch patients failed:', err);
      setPatients([]);
    }
  };

  const hydrateUser = async (userId: string) => {
    if (view === 'LOGIN') {
        setIsSessionLoading(true);
    }
    
    try {
      const { data: userProfile, error } = await supabase
        .from('app_users')
        .select('role, clinic_id')
        .eq('id', userId)
        .single();

      if (error || !userProfile) {
        console.error('Error fetching user profile:', error);
        await supabase.auth.signOut();
        return;
      }

      const rawRole = userProfile.role || '';
      const role = rawRole.toUpperCase() as Role;
      const clinicId = userProfile.clinic_id;

      setUserRole(role);
      setCurrentClinicId(clinicId);

      if (role === 'ADMIN') {
        setView('ADMIN_DASHBOARD');
        return;
      }
      
      if (clinicId) {
         setClinicName('Apple Dental Studio'); 
         // Phase D2.3.3: Explicit state hydration from source of truth
         await fetchPatients(clinicId);
      } else {
        setPatients([]);
      }

      if (role === 'DOCTOR') {
        setView(clinicId ? 'DASHBOARD' : 'CREATE_CLINIC');
        return;
      }

      if (role === 'ASSISTANT') {
        setView(clinicId ? 'DASHBOARD' : 'NO_CLINIC_ERROR');
        return;
      }

      setView('UNAUTHORIZED');

    } catch (err) {
      console.error('Hydration failed', err);
      await supabase.auth.signOut();
    } finally {
      setIsSessionLoading(false);
    }
  };

  const handleManualLogin = async (email: string, pass: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass
    });

    if (error) throw error;
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("User retrieval failed.");

    await hydrateUser(user.id);
  };

  const handleLogout = async () => {
    setIsSessionLoading(true);
    await supabase.auth.signOut();
    setUserRole(null);
    setClinicName('');
    setCurrentClinicId(null);
    setPatients([]);
    setView('LOGIN');
    setIsSessionLoading(false);
  };

  const handleClinicCreate = (name: string) => {
    if (userRole === 'ADMIN') return;
    setClinicName(name);
    setView('DASHBOARD');
  };

  const handleAdminNavigate = (newView: ViewState) => {
    setView(newView);
  }

  const addPatient = async (newPatient: Partial<Patient>) => {
    if (userRole === 'ADMIN' || !currentClinicId) return;

    const isWalkIn = newPatient.appointmentType === 'WALK_IN';
    let initialStatus: PatientStatus = isWalkIn ? 'IN_QUEUE' : 'BOOKED';
    
    if (isWalkIn && doctorStatus === 'READY') {
        const chairOccupied = patients.some(p => p.status === 'IN_TREATMENT');
        const queueOccupied = patients.some(p => p.status === 'IN_QUEUE');
        
        if (!chairOccupied && !queueOccupied) {
            initialStatus = 'IN_TREATMENT';
        }
    }
    
    try {
      const payload = {
        name: newPatient.name || 'Unknown',
        phone: newPatient.phone || '',
        treatment: newPatient.treatment || TREATMENTS[0],
        appointment_type: newPatient.appointmentType || 'WALK_IN',
        scheduled_time: newPatient.scheduledTime,
        status: initialStatus,
        clinic_id: currentClinicId,
        arrival_time: (initialStatus === 'IN_QUEUE' || initialStatus === 'IN_TREATMENT') ? new Date().toISOString() : null
      };

      const { error: insertError } = await supabase
        .from('patients')
        .insert(payload);

      if (insertError) throw insertError;
      console.log("PATIENT INSERT SUCCESS");
      
      await fetchPatients(currentClinicId);
      
    } catch (err: any) {
      console.error('Failed to create patient record:', err.message || err);
    }
  };

  const updateStatus = async (id: string, status: PatientStatus) => {
    if (userRole === 'ADMIN' || !currentClinicId) return;

    let effectiveStatus = status;

    if (status === 'IN_QUEUE' && doctorStatus === 'READY') {
         const chairOccupied = patients.some(p => p.status === 'IN_TREATMENT');
         const queueOccupied = patients.some(p => p.status === 'IN_QUEUE' && p.id !== id);
         
         if (!chairOccupied && !queueOccupied) {
             effectiveStatus = 'IN_TREATMENT';
         }
    }

    try {
      const updates: any = { status: effectiveStatus };
      
      // If moving to queue/treatment for first time, set arrival
      const p = patients.find(pat => pat.id === id);
      if (p && (effectiveStatus === 'IN_QUEUE' || effectiveStatus === 'IN_TREATMENT') && !p.arrivalTime) {
        updates.arrival_time = new Date().toISOString();
        updates.wait_time_minutes = 0;
      }

      const { error } = await supabase
        .from('patients')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      // Handle auto-seating logic if someone completed
      if (effectiveStatus === 'COMPLETED' && doctorStatus === 'READY') {
        const nextInLine = patients
          .filter(pat => pat.status === 'IN_QUEUE' && pat.id !== id)
          .sort((a, b) => (b.waitTimeMinutes || 0) - (a.waitTimeMinutes || 0))[0];
        
        if (nextInLine) {
          await supabase
            .from('patients')
            .update({ status: 'IN_TREATMENT' })
            .eq('id', nextInLine.id);
        }
      }

      await fetchPatients(currentClinicId);
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

  const toggleDoctorStatus = () => {
    if (userRole === 'ADMIN') return;
    const nextStatus = doctorStatus === 'READY' ? 'ON_BREAK' : 'READY';
    setDoctorStatus(nextStatus);
    
    if (nextStatus === 'READY') {
       const chairOccupied = patients.some(p => p.status === 'IN_TREATMENT');
       if (!chairOccupied) {
           const queue = patients.filter(p => p.status === 'IN_QUEUE')
                                      .sort((a, b) => b.waitTimeMinutes - a.waitTimeMinutes);
           
           if (queue.length > 0) {
               updateStatus(queue[0].id, 'IN_TREATMENT');
           }
       }
    }
  };

  if (isSessionLoading) {
    return (
      <div className="min-h-screen bg-ios-bg flex items-center justify-center">
        <Loader2 size={32} className="text-ios-blue animate-spin" />
      </div>
    );
  }

  if (['ADMIN_DASHBOARD', 'ADMIN_CLINICS', 'ADMIN_USERS'].includes(effectiveView)) {
      if (userRole !== 'ADMIN') {
          return <UnauthorizedView onReturn={handleLogout} />;
      }

      return (
        <AdminLayout 
           activeView={effectiveView} 
           onNavigate={handleAdminNavigate} 
           onLogout={handleLogout}
        >
            <div key={effectiveView} className="animate-fade-in w-full">
                {effectiveView === 'ADMIN_DASHBOARD' && <AdminDashboard onNavigate={handleAdminNavigate} />}
                {effectiveView === 'ADMIN_CLINICS' && <AdminClinicsView />}
                {effectiveView === 'ADMIN_USERS' && <AdminUsersView />}
            </div>
        </AdminLayout>
      );
  }
  
  if (effectiveView === 'LOGIN' || effectiveView === 'ADMIN_LOGIN') {
    return <LoginView onLogin={handleManualLogin} />;
  }

  if (effectiveView === 'CLINIC_SETUP') {
    return (
      <ClinicSetupView 
        onCreateNew={() => setView('CREATE_CLINIC')} 
        onLogout={handleLogout}
      />
    );
  }

  if (effectiveView === 'CREATE_CLINIC') {
    return (
      <CreateClinicView 
        onComplete={handleClinicCreate} 
        onBack={() => setView('CLINIC_SETUP')}
      />
    );
  }

  if (effectiveView === 'NO_CLINIC_ERROR') {
    return <NoClinicErrorView onLogout={handleLogout} />;
  }
  
  if (effectiveView === 'UNAUTHORIZED') {
      return <UnauthorizedView onReturn={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-ios-bg text-gray-900 font-sans selection:bg-ios-blue/20">
      <Header 
        clinicName={clinicName} 
        role={userRole} 
        onLogout={handleLogout} 
      />
      
      <main className="pt-6 pb-20">
        <div key={effectiveView} className="animate-fade-in">
            {userRole === 'ASSISTANT' && (
              <AssistantDashboard 
                patients={patients} 
                onAddPatient={addPatient}
                onUpdateStatus={updateStatus}
                doctorStatus={doctorStatus}
                currentClinicId={currentClinicId}
              />
            )}
            
            {userRole === 'DOCTOR' && effectiveView === 'DASHBOARD' && (
              <DoctorDashboard 
                patients={patients} 
                onUpdateStatus={updateStatus}
                doctorStatus={doctorStatus}
                onToggleStatus={toggleDoctorStatus}
                onViewStats={() => setView('CLINIC_DASHBOARD')}
                onViewCalendar={() => setView('CALENDAR')}
                currentClinicId={currentClinicId}
              />
            )}

            {userRole === 'DOCTOR' && effectiveView === 'CLINIC_DASHBOARD' && (
                <ClinicDashboardView 
                  onBack={() => setView('DASHBOARD')} 
                  onViewSubscription={() => setView('SUBSCRIPTION')}
                />
            )}

            {userRole === 'DOCTOR' && effectiveView === 'SUBSCRIPTION' && (
                <SubscriptionView 
                  onBack={() => setView('CLINIC_DASHBOARD')}
                />
            )}

            {userRole === 'DOCTOR' && effectiveView === 'CALENDAR' && (
                <CalendarView 
                    patients={patients} 
                    onBack={() => setView('DASHBOARD')} 
                />
            )}
        </div>
      </main>
    </div>
  );
};

export default App;