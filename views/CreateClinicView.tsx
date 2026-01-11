import React, { useState } from 'react';
import { ArrowLeft, Building2, MapPin, Phone, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { supabase } from '../lib/supabase';

interface CreateClinicViewProps {
  onComplete: (name: string) => void;
  onBack: () => void;
}

export const CreateClinicView: React.FC<CreateClinicViewProps> = ({ onComplete, onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim() || !formData.city.trim()) {
        setError("Clinic Name and City are required.");
        return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Get Current User
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("Authentication session missing.");

      // 2. Insert into 'clinics' table
      // We must include owner_id to satisfy Row Level Security (RLS) policies
      const { data: clinic, error: insertError } = await supabase
        .from('clinics')
        .insert({
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          primary_doctor_id: user.id,
          owner_id: user.id
        })
        .select('id') // Return the ID for the next step
        .single();

      if (insertError) throw insertError;
      if (!clinic) throw new Error("Failed to create clinic record.");

      // 3. Link doctor to clinic in 'clinic_users'
      const { error: linkError } = await supabase
        .from('clinic_users')
        .insert({
          clinic_id: clinic.id,
          user_id: user.id,
          role_in_clinic: 'DOCTOR',
          active: true
        });

      if (linkError) throw linkError;

      // 4. Update 'app_users' with the new clinic_id
      const { error: updateError } = await supabase
        .from('app_users')
        .update({ clinic_id: clinic.id })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // 5. Success Transition
      onComplete(formData.name);

    } catch (err: any) {
      console.error("Clinic creation failed:", err);
      
      // SAFE ERROR SANITIZATION
      let displayMsg = 'Failed to create clinic. Please try again.';
      if (typeof err === 'string') {
          displayMsg = err;
      } else if (err?.message && typeof err.message === 'string') {
          displayMsg = err.message;
      } else if (err && typeof err === 'object') {
          displayMsg = JSON.stringify(err);
      }
      
      setError(
        typeof displayMsg === 'string'
          ? displayMsg
          : JSON.stringify(displayMsg, null, 2)
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ios-bg py-12 px-4 sm:px-6 lg:px-8 flex justify-center animate-fade-in">
      <div className="max-w-2xl w-full space-y-8">
        
        {/* Header Section */}
        <div>
          <Button 
            variant="ghost" 
            onClick={onBack} 
            disabled={isLoading}
            className="mb-6 text-gray-500 hover:text-gray-900 pl-0 hover:bg-transparent transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Setup
          </Button>

          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Clinic Details</h1>
          <p className="mt-2 text-lg text-gray-500">
            Enter the details of your medical practice to initialize your workspace.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card padding="p-8" className="space-y-8 shadow-ios-md">
            
            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 animate-slide-up">
                <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-800">Registration Failed</h3>
                  <p className="text-sm text-red-600 mt-1">
                    {typeof error === 'string'
                      ? error
                      : JSON.stringify(error, null, 2)}
                  </p>
                </div>
              </div>
            )}

            {/* General Info Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2">
                <Building2 size={16} className="text-ios-blue" />
                <span>General Information</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Input 
                    label="Clinic Name" 
                    placeholder="e.g. Apple Dental Studio" 
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                    disabled={isLoading}
                    autoFocus
                  />
                </div>
                <div className="md:col-span-2">
                   <Input 
                    label="Phone Number" 
                    type="tel"
                    placeholder="(555) 000-0000" 
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Location Section */}
            <div className="space-y-6">
               <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2">
                <MapPin size={16} className="text-ios-blue" />
                <span>Location</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="md:col-span-2">
                    <Input 
                      label="Street Address" 
                      placeholder="123 Medical Center Dr" 
                      value={formData.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      disabled={isLoading}
                    />
                 </div>
                 
                 <Input 
                    label="City" 
                    placeholder="New York" 
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    required
                    disabled={isLoading}
                  />

                  <div className="grid grid-cols-2 gap-4">
                     <Input 
                        label="State" 
                        placeholder="NY" 
                        value={formData.state}
                        onChange={(e) => handleChange('state', e.target.value)}
                        disabled={isLoading}
                      />
                      <Input 
                        label="Pincode" 
                        placeholder="10001" 
                        value={formData.pincode}
                        onChange={(e) => handleChange('pincode', e.target.value)}
                        disabled={isLoading}
                      />
                  </div>
              </div>
            </div>

          </Card>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
             <Button 
                type="submit" 
                fullWidth 
                disabled={isLoading}
                className="h-14 text-base font-semibold shadow-lg shadow-blue-200"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="mr-2 animate-spin" />
                    Creating Workspace...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={20} className="mr-2" />
                    Create Clinic
                  </>
                )}
              </Button>
          </div>
        </form>
      </div>
    </div>
  );
};