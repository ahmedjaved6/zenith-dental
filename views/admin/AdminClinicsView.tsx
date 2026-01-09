import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  MapPin, 
  Users, 
  Activity, 
  CreditCard, 
  MoreHorizontal,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Building2
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { supabase } from '../../lib/supabase';

// Local Types for Clinic Management
type SubscriptionTier = 'BASIC' | 'PRO' | 'ENTERPRISE';
type BillingCycle = 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
type ClinicStatus = 'ACTIVE' | 'INACTIVE';

interface Clinic {
  id: string;
  name: string;
  city: string;
  status: ClinicStatus;
  stats: {
    doctors: number;
    assistants: number;
    patientsToday: number;
  };
  subscription: {
    tier: SubscriptionTier;
    billing: BillingCycle;
    isTrial: boolean;
  };
}

const TIER_PRICING = {
  BASIC: '₹299',
  PRO: '₹499',
  ENTERPRISE: '₹999'
};

export const AdminClinicsView: React.FC = () => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [availableDoctors, setAvailableDoctors] = useState<{id: string, name: string, email: string}[]>([]);
  
  // Form State
  const [newClinicName, setNewClinicName] = useState('');
  const [newClinicCity, setNewClinicCity] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Fetch Clinics on Mount
  useEffect(() => {
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        // Map DB data to UI model (mocking stats/sub for now as they might not exist in DB yet)
        const mapped: Clinic[] = data.map((c: any) => ({
          id: c.id,
          name: c.name,
          city: c.city || 'Unknown',
          status: 'ACTIVE', 
          stats: { doctors: 1, assistants: 0, patientsToday: 0 },
          subscription: { tier: 'PRO', billing: 'ANNUAL', isTrial: false }
        }));
        setClinics(mapped);
      }
    } catch (err) {
      console.error('Failed to fetch clinics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = async () => {
    setShowModal(true);
    setFormError(null);
    setFormSuccess(null);
    setNewClinicName('');
    setNewClinicCity('');
    setSelectedDoctor('');
    
    // Fetch doctors who don't have a clinic assigned
    const { data } = await supabase
      .from('app_users')
      .select('id, name, email')
      .ilike('role', 'doctor')
      .is('clinic_id', null);
    
    if (data) {
      setAvailableDoctors(data);
    }
  };

  const handleCreateClinic = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newClinicName || !newClinicCity || !selectedDoctor) {
      setFormError("All fields are required.");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      // 1. Safety Check: Verify doctor isn't already assigned (double check)
      const { data: docCheck } = await supabase
        .from('app_users')
        .select('clinic_id')
        .eq('id', selectedDoctor)
        .single();

      if (docCheck?.clinic_id) {
        throw new Error("Selected doctor already owns a clinic.");
      }

      // 2. Create Clinic Row
      const { data: clinic, error: createError } = await supabase
        .from('clinics')
        .insert({
          name: newClinicName,
          city: newClinicCity,
          owner_id: selectedDoctor,
          primary_doctor_id: selectedDoctor
        })
        .select()
        .single();

      if (createError) throw createError;
      if (!clinic) throw new Error("Clinic creation failed.");

      // 3. Link Doctor to Clinic (Update app_users)
      const { error: updateUserError } = await supabase
        .from('app_users')
        .update({ clinic_id: clinic.id })
        .eq('id', selectedDoctor);

      if (updateUserError) throw updateUserError;

      // 4. Create Membership (Insert clinic_users)
      const { error: linkUserError } = await supabase
        .from('clinic_users')
        .insert({
          clinic_id: clinic.id,
          user_id: selectedDoctor,
          role: 'OWNER',
          active: true
        });

      if (linkUserError) throw linkUserError;

      // Success
      setFormSuccess("Clinic created and doctor linked successfully.");
      
      // Refresh list
      await fetchClinics();

      // Close after delay
      setTimeout(() => {
        setShowModal(false);
      }, 1500);

    } catch (err: any) {
      console.error(err);
      
      // SAFE ERROR SANITIZATION
      let displayMsg = 'Failed to onboard clinic.';
      if (typeof err === 'string') {
          displayMsg = err;
      } else if (err?.message && typeof err.message === 'string') {
          displayMsg = err.message;
      } else if (err && typeof err === 'object') {
          displayMsg = JSON.stringify(err);
      }
      
      setFormError(
        typeof displayMsg === 'string'
          ? displayMsg
          : JSON.stringify(displayMsg, null, 2)
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Registered Clinics</h2>
            <p className="text-gray-500 text-sm">Manage subscriptions, access control, and clinic details.</p>
          </div>
          <Button 
            onClick={handleOpenModal}
            className="h-10 px-4 text-sm bg-gray-900 hover:bg-black text-white shadow-lg shadow-gray-200"
          >
              <Plus size={16} className="mr-2" />
              Onboard Clinic
          </Button>
      </div>

      {/* Main Table Card */}
      <Card padding="p-0" className="overflow-hidden border border-gray-200 shadow-sm min-h-[300px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 size={32} className="text-gray-300 animate-spin" />
            <p className="text-gray-400 text-sm mt-3">Loading clinics...</p>
          </div>
        ) : clinics.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50/50 text-gray-500 font-semibold uppercase text-[11px] tracking-wider border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Clinic Details</th>
                  <th className="px-6 py-4">Usage Stats</th>
                  <th className="px-6 py-4">Subscription Plan</th>
                  <th className="px-6 py-4">Billing Cycle</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {clinics.map((clinic) => (
                  <tr 
                    key={clinic.id} 
                    className={`group transition-all duration-200 hover:bg-blue-50/30 ${clinic.status === 'INACTIVE' ? 'opacity-60 grayscale-[0.5] hover:grayscale-0 hover:opacity-100' : ''}`}
                  >
                    {/* Clinic Details */}
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold shadow-sm ${clinic.status === 'ACTIVE' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                          {clinic.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                            {clinic.name}
                          </div>
                          <div className="flex items-center text-xs text-gray-500 mt-0.5">
                            <MapPin size={10} className="mr-1" />
                            {clinic.city}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Stats */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Users size={12} className="text-gray-400" />
                          <span className="font-medium">{clinic.stats.doctors}</span> Drs, 
                          <span className="font-medium ml-1">{clinic.stats.assistants}</span> Asst
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Activity size={12} className="text-gray-400" />
                          <span>{clinic.stats.patientsToday} patients today</span>
                        </div>
                      </div>
                    </td>

                    {/* Subscription Tier */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-medium text-gray-700">
                           {clinic.subscription.tier} ({TIER_PRICING[clinic.subscription.tier]})
                        </span>
                         {clinic.subscription.isTrial && (
                           <span className="inline-flex items-center text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100 w-fit">
                             <AlertCircle size={10} className="mr-1" /> TRIAL
                           </span>
                         )}
                      </div>
                    </td>

                    {/* Billing Cycle */}
                    <td className="px-6 py-4">
                      <span className="text-xs text-gray-600">{clinic.subscription.billing}</span>
                      <div className="text-[10px] text-gray-400 mt-1 flex items-center">
                        <CreditCard size={10} className="mr-1" />
                        Active
                      </div>
                    </td>

                    {/* Status Toggle */}
                    <td className="px-6 py-4 text-center">
                      <button 
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${clinic.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-200'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${clinic.status === 'ACTIVE' ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              }
              </tbody>
            </table>
          </div>
        ) : (
           <div className="flex flex-col items-center justify-center h-64 text-center p-6">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                 <Building2 size={24} className="text-gray-400" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">No clinics found</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-xs">Start by onboarding a new clinic using the button above.</p>
           </div>
        )}
        
        {/* Table Footer */}
        <div className="bg-gray-50 border-t border-gray-200 p-4 flex items-center justify-between text-xs text-gray-500">
           <span>Showing {clinics.length} clinics</span>
           <div className="flex gap-2">
             <button className="px-3 py-1 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-50" disabled>Previous</button>
             <button className="px-3 py-1 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-50" disabled>Next</button>
           </div>
        </div>
      </Card>

      {/* ONBOARDING MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
           <div 
             className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in slide-in-from-bottom-4 zoom-in-95 duration-200"
             onClick={(e) => e.stopPropagation()}
           >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                 <div>
                    <h3 className="font-bold text-gray-900">Onboard New Clinic</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Initialize workspace and assign ownership.</p>
                 </div>
                 <button 
                   onClick={() => setShowModal(false)}
                   className="p-1 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
                 >
                   <X size={20} />
                 </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                 {formSuccess ? (
                   <div className="flex flex-col items-center justify-center py-6 text-center animate-in fade-in zoom-in">
                      <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                         <CheckCircle2 size={32} />
                      </div>
                      <h4 className="text-lg font-bold text-gray-900">Success!</h4>
                      <p className="text-sm text-gray-500 mt-2">{formSuccess}</p>
                   </div>
                 ) : (
                   <form onSubmit={handleCreateClinic} className="space-y-4">
                      {formError && (
                        <div className="p-3 rounded-lg bg-red-50 text-red-600 text-xs font-medium flex items-start gap-2 border border-red-100">
                           <AlertCircle size={16} className="shrink-0 mt-0.5" />
                           <p>
                             {typeof formError === 'string'
                               ? formError
                               : JSON.stringify(formError, null, 2)}
                           </p>
                        </div>
                      )}

                      <Input 
                        label="Clinic Name"
                        placeholder="e.g. Apple Dental Studio"
                        value={newClinicName}
                        onChange={(e) => setNewClinicName(e.target.value)}
                        disabled={isSubmitting}
                        autoFocus
                      />
                      
                      <Input 
                        label="City / Location"
                        placeholder="e.g. New York, NY"
                        value={newClinicCity}
                        onChange={(e) => setNewClinicCity(e.target.value)}
                        disabled={isSubmitting}
                      />

                      <div>
                         <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                             Assign Owner (Doctor)
                         </label>
                         {availableDoctors.length > 0 ? (
                           <select 
                             className="w-full bg-gray-50/50 border border-gray-200 text-gray-900 text-[17px] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[48px]"
                             value={selectedDoctor}
                             onChange={(e) => setSelectedDoctor(e.target.value)}
                             disabled={isSubmitting}
                           >
                             <option value="" disabled>Select a doctor...</option>
                             {availableDoctors.map(doc => (
                               <option key={doc.id} value={doc.id}>
                                 {doc.name || doc.email} ({doc.email})
                               </option>
                             ))}
                           </select>
                         ) : (
                           <div className="p-3 bg-orange-50 border border-orange-100 rounded-xl text-orange-600 text-sm">
                              No unassigned doctors found. Create a doctor account first in the Users tab.
                           </div>
                         )}
                         <p className="text-[10px] text-gray-400 mt-1.5 ml-1">
                           * Only doctors without an existing clinic are listed.
                         </p>
                      </div>

                      <div className="pt-2">
                        <Button 
                          type="submit" 
                          fullWidth 
                          disabled={isSubmitting || !selectedDoctor || !newClinicName}
                          className="bg-gray-900 hover:bg-black text-white"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 size={18} className="mr-2 animate-spin" />
                              Creating Workspace...
                            </>
                          ) : (
                            <>
                              <Plus size={18} className="mr-2" />
                              Create Clinic & Link Doctor
                            </>
                          )}
                        </Button>
                      </div>
                   </form>
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};