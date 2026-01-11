import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';

interface AdminLoginViewProps {
  onLogin: () => void;
  onBack: () => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({ onLogin, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setError(null);

    try {
      // 1. Authenticate with Supabase
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) throw signInError;

      // 2. Explicitly fetch the authenticated user to ensure session is ready
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error('Authentication succeeded but user session could not be retrieved.');
      }

      // 3. Call RPC to get role (Bypasses Table RLS)
      // We use the database function 'get_current_user_role' which uses auth.uid() internally
      const { data: roleName, error: rpcError } = await supabase.rpc('get_current_user_role');

      // 4. Handle RPC errors or missing role
      if (rpcError) {
        console.error('Role resolution failed:', rpcError);
        throw new Error('Failed to verify user privileges.');
      }

      if (!roleName) {
        await supabase.auth.signOut();
        throw new Error('User role not assigned. Contact admin.');
      }

      const userRole = (roleName as string).toLowerCase();

      // 5. Admin Routing - Immediate Access
      if (userRole === 'admin') {
        onLogin();
        return;
      }

      // 6. Block non-admin users from this portal
      await supabase.auth.signOut();
      throw new Error('Access Denied: Administrator privileges required.');

    } catch (err: any) {
      console.error('Login error:', err);
      // Ensure we sign out if we failed validation after auth
      const { data } = await supabase.auth.getSession();
      if (data.session) {
         await supabase.auth.signOut();
      }
      
      // SAFE ERROR SANITIZATION
      let displayMsg = 'Failed to login. Please check your credentials.';
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-900 text-white">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl ring-1 ring-white/10">
            <ShieldCheck size={32} className="text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Admin Console</h1>
          <p className="text-gray-400">Restricted system access</p>
        </div>

        <Card className="bg-gray-800 border-gray-700 shadow-2xl" padding="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-200">
                  {typeof error === 'string'
                    ? error
                    : JSON.stringify(error, null, 2)}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-900/50 border border-gray-600 text-white text-[17px] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-gray-600 disabled:opacity-50"
                  placeholder="admin@example.com"
                  autoFocus
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-900/50 border border-gray-600 text-white text-[17px] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-gray-600 disabled:opacity-50"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              fullWidth 
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-500 text-white border-none shadow-lg shadow-blue-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <span>Access System</span>
                  <ArrowRight size={18} className="ml-2" />
                </>
              )}
            </Button>
          </form>
        </Card>

        <button 
            onClick={onBack} 
            disabled={isLoading}
            className="w-full mt-8 text-sm text-gray-500 hover:text-gray-300 transition-colors disabled:opacity-50"
        >
            Return to Clinical App
        </button>
      </div>
    </div>
  );
};