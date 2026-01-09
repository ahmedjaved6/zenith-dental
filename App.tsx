import React, { useState, useEffect } from 'react';
import { Role, ViewState, Patient, PatientStatus, TREATMENTS, DoctorStatus } from './types';
import { INITIAL_PATIENTS } from './constants';
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
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [doctorStatus, setDoctorStatus] = useState<DoctorStatus>('READY');
  const [view, setView] = useState<ViewState>('LOGIN');
  const [isSessionLoading, setIsSessionLoading] = useState(true);

  // --- DERIVED STATE (GLOBAL VIEW LOCK) ---
  let effectiveView = view;
  
  if (userRole === 'ADMIN') {
    if (!view.startsWith('ADMIN_')) {
       effectiveView = 'ADMIN_DASHBOARD';
    }
    console.log('GLOBAL ADMIN VIEW LOCK ACTIVE');
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
        console.log("SESSION CLEARED");
        setUserRole(null);
        setClinicName('');
        setCurrentClinicId(null);
        setView('LOGIN');
        setIsSessionLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [userRole]);

  const hydrateUser = async (userId: string) => {
    console.log("HYDRATING USER...", userId);
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

      console.log('ROLE:', role);
      console.log('CLINIC:', clinicId);

      setUserRole(role);
      setCurrentClinicId(clinicId);
      
      if (clinicId) {
         setClinicName('Apple Dental Studio'); 
      }

      if (role === 'ADMIN') {
        console.log('ADMIN DETECTED - FORCING DASHBOARD');
        setView('ADMIN_DASHBOARD');
        return;
      }

      if (role === 'DOCTOR') {
        if (clinicId) {
          setView('DASHBOARD');
        } else {
          setView('CREATE_CLINIC');
        }
        return;
      }

      if (role === 'ASSISTANT') {
        if (clinicId) {
          setView('DASHBOARD');
        } else {
          setView('NO_CLINIC_ERROR');
        }
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
    setView('LOGIN');
    setIsSessionLoading(false);
  };

  const handleClinicCreate = (name: string) => {
    if (userRole === 'ADMIN') return;
    setClinicName(name);
    // Note: clinic_id will be hydrated on next cycle or should be set if available
    setView('DASHBOARD');
  };

  const handleAdminNavigate = (newView: ViewState) => {
    setView(newView);
  }

  const addPatient = (newPatient: Partial<Patient>) => {
    if (userRole === 'ADMIN') return;

    const isWalkIn = newPatient.appointmentType === 'WALK_IN';
    let initialStatus: PatientStatus = isWalkIn ? 'IN_QUEUE' : 'BOOKED';
    
    if (isWalkIn && doctorStatus === 'READY') {
        const chairOccupied = patients.some(p => p.status === 'IN_TREATMENT');
        const queueOccupied = patients.some(p => p.status === 'IN_QUEUE');
        
        if (!chairOccupied && !queueOccupied) {
            initialStatus = 'IN_TREATMENT';
        }
    }
    
    const p: Patient = {
      id: Math.random().toString(36).substr(2, 9),
      name: newPatient.name || 'Unknown',
      phone: newPatient.phone || '',
      treatment: newPatient.treatment || TREATMENTS[0],
      appointmentType: newPatient.appointmentType || 'WALK_IN',
      scheduledTime: newPatient.scheduledTime,
      status: initialStatus,
      arrivalTime: (initialStatus === 'IN_QUEUE' || initialStatus === 'IN_TREATMENT') ? new Date() : undefined,
      waitTimeMinutes: 0,
    };
    setPatients([...patients, p]);
  };

  const updateStatus = (id: string, status: PatientStatus) => {
    if (userRole === 'ADMIN') return;

    let effectiveStatus = status;

    if (status === 'IN_QUEUE' && doctorStatus === 'READY') {
         const chairOccupied = patients.some(p => p.status === 'IN_TREATMENT');
         const queueOccupied = patients.some(p => p.status === 'IN_QUEUE' && p.id !== id);
         
         if (!chairOccupied && !queueOccupied) {
             effectiveStatus = 'IN_TREATMENT';
         }
    }

    let updatedPatients = patients.map(p => {
      if (p.id === id) {
        const updates: Partial<Patient> = { status: effectiveStatus };
        if ((effectiveStatus === 'IN_QUEUE' || effectiveStatus === 'IN_TREATMENT') && !p.arrivalTime) {
          updates.arrivalTime = new Date();
          updates.waitTimeMinutes = 0;
        }
        return { ...p, ...updates };
      }
      return p;
    });

    if (effectiveStatus === 'COMPLETED') {
        if (doctorStatus === 'READY') {
            const activePatient = updatedPatients.find(p => p.status === 'IN_TREATMENT' && p.id !== id);
            
            if (!activePatient) {
                const queue = updatedPatients.filter(p => p.status === 'IN_QUEUE');
                queue.sort((a, b) => b.waitTimeMinutes - a.waitTimeMinutes);
                
                if (queue.length > 0) {
                    const nextPatient = queue[0];
                    updatedPatients = updatedPatients.map(p => 
                        p.id === nextPatient.id ? { ...p, status: 'IN_TREATMENT' } : p
                    );
                }
            }
        }
    }

    setPatients(updatedPatients);
  };

  const toggleDoctorStatus = () => {
    if (userRole === 'ADMIN') return;
    const nextStatus = doctorStatus === 'READY' ? 'ON_BREAK' : 'READY';
    setDoctorStatus(nextStatus);
    
    if (nextStatus === 'READY') {
       setPatients(currentPatients => {
            const chairOccupied = currentPatients.some(p => p.status === 'IN_TREATMENT');
            if (!chairOccupied) {
                const queue = currentPatients.filter(p => p.status === 'IN_QUEUE')
                                           .sort((a, b) => b.waitTimeMinutes - a.waitTimeMinutes);
                
                if (queue.length > 0) {
                    const nextId = queue[0].id;
                    return currentPatients.map(p => 
                        p.id === nextId ? { ...p, status: 'IN_TREATMENT' } : p
                    );
                }
            }
            return currentPatients;
       });
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