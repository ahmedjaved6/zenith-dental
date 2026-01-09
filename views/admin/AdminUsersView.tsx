import React, { useState, useEffect } from 'react';
import { 
  Search, 
  User, 
  Stethoscope, 
  Building2, 
  MoreHorizontal, 
  Filter,
  UserPlus,
  Mail,
  Clock,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { supabase } from '../../lib/supabase';

// Local Types
type UserRole = 'DOCTOR' | 'ASSISTANT';
type UserStatus = 'ACTIVE' | 'INACTIVE';

interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  clinic: string;
  status: UserStatus;
  lastActive: string;
}

export const AdminUsersView: React.FC = () => {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [filterRole, setFilterRole] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Data for Assistant Creation
  const [clinicsList, setClinicsList] = useState<{id: string, name: string}[]>([]);

  // Modal State
  const [modalType, setModalType] = useState<'NONE' | 'DOCTOR' | 'ASSISTANT'>('NONE');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // Assistant Specific State
  const [newName, setNewName] = useState('');
  const [newClinicId, setNewClinicId] = useState('');

  const [isCreating, setIsCreating] = useState(false);
  const [createStatus, setCreateStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch data on mount
  useEffect(() => {
    const init = async () => {
      const { data: clinics } = await supabase.from('clinics').select('id, name');
      const clinicsData = clinics || [];
      setClinicsList(clinicsData);
      await fetchUsers(clinicsData);
    };
    init();
  }, []);

  const fetchUsers = async (clinicsOverride?: {id: string, name: string}[]) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('app_users').select('*');
      if (error) throw error;

      const currentClinics = clinicsOverride || clinicsList;
      
      const mapped: SystemUser[] = (data || []).map(u => ({
        id: u.id,
        name: u.name || u.email?.split('@')[0] || 'Unknown',
        email: u.email || '',
        role: (u.role as UserRole) || 'ASSISTANT',
        clinic: currentClinics.find(c => c.id === u.clinic_id)?.name || 'Unassigned',
        status: 'ACTIVE',
        lastActive: 'N/A'
      }));
      setUsers(mapped);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStatus = (id: string) => {
    // Note: status is local/ephemeral for now
    setUsers(current => current.map(u => 
      u.id === id ? { ...u, status: u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : u
    ));
  };

  const resetModal = () => {
    setNewEmail('');
    setNewPassword('');
    setNewName('');
    setNewClinicId('');
    setCreateStatus('IDLE');
    setErrorMessage('');
    setIsCreating(false);
    setModalType('NONE');
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (modalType === 'DOCTOR') {
        if (!newEmail || !newPassword) return;
    } else if (modalType === 'ASSISTANT') {
        if (!newEmail || !newPassword || !newName || !newClinicId) return;
    }

    setIsCreating(true);
    setCreateStatus('IDLE');
    setErrorMessage('');

    try {
      const role = modalType === 'DOCTOR' ? 'DOCTOR' : 'ASSISTANT';
      
      // Get fresh session token
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;

      if (!session || !session.access_token) {
        throw new Error("No active administrative session. Please log in again.");
      }

      // Strict payload construction
      const payload = {
        email: newEmail,
        password: newPassword,
        role: role,
        name: modalType === 'ASSISTANT' ? newName : newEmail.split('@')[0],
        clinic_id: modalType === 'ASSISTANT' ? newClinicId : null
      };

      /**
       * FINAL INFRASTRUCTURE FIX
       * Use the Supabase SDK's built-in function invoker.
       * This bypasses iframe/sandboxing restrictions in AI Studio that block raw fetch() calls.
       */
      const { data: functionData, error: functionError } = await supabase.functions.invoke('create-user', {
        body: payload
      });

      if (functionError) {
        // Detailed extraction of backend error to prevent [object Object]
        const backendMessage = functionError.message || (functionError as any).context?.message || "Function execution failed.";
        throw new Error(backendMessage);
      }

      // Finalize success
      setCreateStatus('SUCCESS');
      
      // Update data from source of truth
      await fetchUsers();
      
      setTimeout(() => {
        resetModal();
      }, 1500);

    } catch (err: any) {
      console.error('System Creation Failure:', err);
      setCreateStatus('ERROR');
      
      // Robust error message extraction
      const readableError = err?.message || "Connectivity error. The security boundary blocked the request.";
      setErrorMessage(readableError);
    } finally {
      setIsCreating(false);
    }
  };

  // Filter Logic
  const filteredUsers = users.filter(user => {
    const matchesRole = filterRole === 'ALL' || user.role === filterRole;
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          user.clinic.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-6 relative">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">User Directory</h2>
            <p className="text-gray-500 text-sm">Manage access for doctors and staff.</p>
          </div>
          <div className="flex gap-3">
            <Button 
                onClick={() => setModalType('ASSISTANT')}
                variant="secondary"
                className="h-10 px-4 text-sm bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 shadow-sm"
            >
                <User size={16} className="mr-2" />
                Create Assistant
            </Button>
            <Button 
                onClick={() => setModalType('DOCTOR')}
                className="h-10 px-4 text-sm bg-gray-900 hover:bg-black text-white shadow-lg shadow-gray-200"
            >
                <Stethoscope size={16} className="mr-2" />
                Create Doctor
            </Button>
          </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-2">
          <div className="flex-1">
             <div className="relative">
                <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search by name, email or clinic..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow shadow-sm"
                />
             </div>
          </div>
          <div className="flex items-center gap-2">
             <div className="relative">
                 <Filter className="absolute left-3 top-3.5 text-gray-400" size={16} />
                 <select 
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="bg-white border border-gray-200 text-gray-700 text-sm rounded-xl pl-10 pr-8 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm appearance-none cursor-pointer hover:bg-gray-50 transition-colors"
                 >
                     <option value="ALL">All Roles</option>
                     <option value="DOCTOR">Doctors Only</option>
                     <option value="ASSISTANT">Assistants Only</option>
                 </select>
             </div>
          </div>
      </div>

      {/* Users Table */}
      <Card padding="p-0" className="overflow-hidden border border-gray-200 shadow-sm">
        <div className="overflow-x-auto min-h-[300px]">
          {isLoading ? (
             <div className="flex flex-col items-center justify-center py-24">
                <Loader2 size={32} className="animate-spin text-gray-300 mb-4" />
                <p className="text-gray-400 text-sm">Synchronizing user data...</p>
             </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50/50 text-gray-500 font-semibold uppercase text-[11px] tracking-wider border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">User Profile</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Assigned Clinic</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr 
                      key={user.id} 
                      className={`group transition-all duration-200 hover:bg-blue-50/30 ${user.status === 'INACTIVE' ? 'opacity-60 grayscale-[0.5] hover:grayscale-0 hover:opacity-100' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${user.role === 'DOCTOR' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                              {user.name}
                            </div>
                            <div className="flex items-center text-xs text-gray-400 mt-0.5">
                              <Mail size={10} className="mr-1" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${
                            user.role === 'DOCTOR' 
                              ? 'bg-blue-50 text-blue-700 border-blue-100' 
                              : 'bg-purple-50 text-purple-700 border-purple-100'
                        }`}>
                            {user.role === 'DOCTOR' ? <Stethoscope size={12} className="mr-1.5" /> : <User size={12} className="mr-1.5" />}
                            {user.role === 'DOCTOR' ? 'Doctor' : 'Assistant'}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                          <div className="flex items-center text-gray-600 text-sm">
                              <Building2 size={14} className="mr-2 text-gray-400" />
                              {user.clinic}
                          </div>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => toggleStatus(user.id)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${user.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-200'}`}
                        >
                          <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform shadow-sm ${user.status === 'ACTIVE' ? 'translate-x-5' : 'translate-x-1'}`} />
                        </button>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                          <MoreHorizontal size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                          <div className="flex flex-col items-center justify-center">
                              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                  <Search size={20} className="text-gray-400" />
                              </div>
                              <p className="font-medium">No users found</p>
                              <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters.</p>
                          </div>
                      </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Table Footer */}
        {!isLoading && (
          <div className="bg-gray-50 border-t border-gray-200 p-4 flex items-center justify-between text-xs text-gray-500">
             <span>Showing {filteredUsers.length} users</span>
             <div className="flex gap-2">
               <button className="px-3 py-1 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-50" disabled>Previous</button>
               <button className="px-3 py-1 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-50" disabled>Next</button>
             </div>
          </div>
        )}
      </Card>

      {/* CREATE USER MODAL */}
      {modalType !== 'NONE' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
           <div 
             className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in slide-in-from-bottom-4 zoom-in-95 duration-200"
             onClick={(e) => e.stopPropagation()}
           >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                 <div>
                    <h3 className="font-bold text-gray-900">
                        {modalType === 'DOCTOR' ? 'Onboard New Doctor' : 'Onboard New Assistant'}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                        {modalType === 'DOCTOR' 
                         ? 'Provision a doctor with clinic ownership capabilities' 
                         : 'Provision a staff member and bind to a specific clinic'}
                    </p>
                 </div>
                 <button 
                   onClick={resetModal}
                   className="p-1 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
                 >
                   <X size={20} />
                 </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                 {createStatus === 'SUCCESS' ? (
                   <div className="flex flex-col items-center justify-center py-6 text-center animate-in fade-in zoom-in">
                      <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                         <CheckCircle2 size={32} />
                      </div>
                      <h4 className="text-lg font-bold text-gray-900">Registration Complete</h4>
                      <p className="text-sm text-gray-500 mt-2">The account has been successfully provisioned.</p>
                   </div>
                 ) : (
                   <form onSubmit={handleCreateUser} className="space-y-4">
                      {createStatus === 'ERROR' && (
                        <div className="p-3 rounded-lg bg-red-50 text-red-600 text-xs font-medium flex items-start gap-2 border border-red-100">
                           <AlertCircle size={16} className="shrink-0 mt-0.5" />
                           <p className="break-words">{errorMessage}</p>
                        </div>
                      )}

                      {modalType === 'ASSISTANT' && (
                         <div className="space-y-4 animate-in slide-in-from-left-2 fade-in">
                             <Input 
                                label="Staff Member Name"
                                placeholder="e.g. Jane Doe"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                autoFocus
                                disabled={isCreating}
                             />
                             
                             <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                                    Clinic Binding
                                </label>
                                <select 
                                    className="w-full bg-gray-50/50 border border-gray-200 text-gray-900 text-[17px] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ios-blue/20 focus:border-ios-blue transition-all min-h-[48px]"
                                    value={newClinicId}
                                    onChange={(e) => setNewClinicId(e.target.value)}
                                    disabled={isCreating}
                                >
                                    <option value="" disabled>Select target clinic...</option>
                                    {clinicsList.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                             </div>
                         </div>
                      )}

                      <Input 
                        label="Login Email"
                        type="email"
                        placeholder={modalType === 'DOCTOR' ? "doctor@clinic.com" : "staff@clinic.com"}
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        autoFocus={modalType === 'DOCTOR'}
                        disabled={isCreating}
                      />
                      
                      <Input 
                        label="Temporary Password"
                        type="password"
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={isCreating}
                      />

                      <div className="pt-2">
                        <Button 
                          type="submit" 
                          fullWidth 
                          disabled={
                              isCreating || 
                              !newEmail || 
                              !newPassword || 
                              (modalType === 'ASSISTANT' && (!newName || !newClinicId))
                          }
                          className="bg-gray-900 hover:bg-black text-white"
                        >
                          {isCreating ? (
                            <>
                              <Loader2 size={18} className="mr-2 animate-spin" />
                              Provisioning...
                            </>
                          ) : (
                            <>
                              <UserPlus size={18} className="mr-2" />
                              {modalType === 'DOCTOR' ? 'Register Doctor' : 'Register Assistant'}
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