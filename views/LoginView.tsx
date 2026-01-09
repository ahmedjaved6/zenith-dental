import React, { useState } from 'react';
import { LogIn, AlertCircle, Loader2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

interface LoginViewProps {
  onLogin: (email: string, pass: string) => Promise<void>;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoginClick = async () => {
    if (!email || !password) return;

    setIsLoading(true);
    setError(null);

    try {
      await onLogin(email, password);
      // Success is handled by parent routing, but we keep loading state until unmount
    } catch (err: any) {
      console.error('Login failed in view:', err);
      
      // SAFE ERROR SANITIZATION
      let displayMsg = 'An unexpected error occurred.';
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLoginClick();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-ios-bg relative">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-10 space-y-3">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-ios-md flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-ios-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Zenith Dental</h1>
          <p className="text-gray-500">Sign in to your workspace</p>
        </div>

        <Card padding="p-8" className="shadow-ios-md">
          <div className="space-y-6">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm font-medium flex items-start gap-2 border border-red-100 animate-slide-up">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <p>
                  {typeof error === 'string'
                    ? error
                    : JSON.stringify(error, null, 2)}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="name@clinic.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                required
                disabled={isLoading}
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                required
                disabled={isLoading}
              />
            </div>

            <Button 
              type="button" 
              onClick={handleLoginClick}
              fullWidth 
              disabled={isLoading}
              className="mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  <LogIn size={18} className="mr-2" />
                  Sign In
                </>
              )}
            </Button>
          </div>
        </Card>
        
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">Secure Clinical Management System v1.0</p>
        </div>
      </div>
    </div>
  );
};