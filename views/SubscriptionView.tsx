import React, { useState } from 'react';
import { ArrowLeft, Check, Shield, Zap, Star, CreditCard, Calendar, CheckCircle2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

interface SubscriptionViewProps {
  onBack: () => void;
}

type BillingCycle = 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
type Term = 1 | 3 | 5;

export const SubscriptionView: React.FC<SubscriptionViewProps> = ({ onBack }) => {
  const [cycle, setCycle] = useState<BillingCycle>('ANNUAL');
  const [term, setTerm] = useState<Term>(1);

  // Mock Pricing Logic
  const basePrice = {
    BASIC: 299,
    PRO: 499,
    ENTERPRISE: 999
  };

  const getDiscount = () => {
    if (cycle === 'MONTHLY') return 0;
    if (cycle === 'QUARTERLY') return 0.05;
    if (cycle === 'ANNUAL') {
      if (term === 1) return 0.20;
      if (term === 3) return 0.30;
      if (term === 5) return 0.40;
    }
    return 0;
  };

  const calculatePrice = (base: number) => {
    const discount = getDiscount();
    return Math.round(base * (1 - discount));
  };

  const plans = [
    {
      id: 'BASIC',
      name: 'Starter',
      icon: Zap,
      base: basePrice.BASIC,
      features: ['Single Doctor', 'Basic Queue', 'Up to 50 patients/day'],
      color: 'blue'
    },
    {
      id: 'PRO',
      name: 'Professional',
      icon: Star,
      base: basePrice.PRO,
      features: ['Multi-Doctor Support', 'Advanced Analytics', 'Priority Support', 'Custom Treatments'],
      color: 'purple',
      recommended: true
    },
    {
      id: 'ENTERPRISE',
      name: 'Enterprise',
      icon: Shield,
      base: basePrice.ENTERPRISE,
      features: ['Unlimited Staff', 'API Access', 'Dedicated Account Manager', 'SLA Guarantee'],
      color: 'gray'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Subscription & Billing</h1>
          <p className="text-gray-500 mt-1">Manage your plan and billing preferences</p>
        </div>
        <Button 
          variant="secondary" 
          onClick={onBack}
          className="bg-white border border-gray-200 shadow-sm hover:bg-gray-50 font-medium"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back
        </Button>
      </div>

      {/* Current Status Banner */}
      <div className="mb-10">
        <Card padding="p-6" className="bg-gradient-to-r from-gray-900 to-gray-800 text-white border-none shadow-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                <CheckCircle2 className="text-green-400" size={24} />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold">Professional Plan</h2>
                  <span className="px-2 py-0.5 bg-green-500/20 text-green-300 text-xs font-bold rounded-full border border-green-500/30 uppercase tracking-wide">Active</span>
                </div>
                <p className="text-gray-400 text-sm mt-1">Your next billing date is <span className="text-white font-medium">October 24, 2024</span></p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-300">
               <div className="flex flex-col items-end">
                 <span className="uppercase text-[10px] font-bold tracking-wider text-gray-500">Amount</span>
                 <span className="text-white font-medium">₹499.00 / mo</span>
               </div>
               <div className="h-8 w-px bg-white/10"></div>
               <div className="flex flex-col items-end">
                 <span className="uppercase text-[10px] font-bold tracking-wider text-gray-500">Payment</span>
                 <div className="flex items-center gap-2">
                   <CreditCard size={14} />
                   <span className="text-white font-medium">•••• 4242</span>
                 </div>
               </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Plan Selection Controls */}
      <div className="flex flex-col items-center gap-6 mb-10">
        
        {/* Cycle Toggle */}
        <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 inline-flex">
          {(['MONTHLY', 'QUARTERLY', 'ANNUAL'] as BillingCycle[]).map((c) => (
            <button
              key={c}
              onClick={() => setCycle(c)}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                cycle === c 
                  ? 'bg-gray-900 text-white shadow-md' 
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {c.charAt(0) + c.slice(1).toLowerCase()}
              {c === 'ANNUAL' && <span className="ml-1.5 text-[10px] text-green-400 font-bold">-20%</span>}
            </button>
          ))}
        </div>

        {/* Annual Term Options */}
        {cycle === 'ANNUAL' && (
          <div className="flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
             <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Commitment Term:</span>
             {[1, 3, 5].map((y) => (
               <button
                 key={y}
                 onClick={() => setTerm(y as Term)}
                 className={`px-3 py-1 text-xs font-bold rounded-md border transition-all ${
                   term === y 
                     ? 'bg-blue-50 border-blue-200 text-blue-700' 
                     : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                 }`}
               >
                 {y} Year{y > 1 ? 's' : ''} {y > 1 && <span className="ml-1 text-green-600">(-{y === 3 ? '30' : '40'}%)</span>}
               </button>
             ))}
          </div>
        )}
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const price = calculatePrice(plan.base);
          const isCurrent = plan.id === 'PRO';

          return (
            <Card 
              key={plan.id} 
              padding="p-0" 
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-ios-md ${isCurrent ? 'ring-2 ring-blue-500 border-transparent' : 'border-gray-200'}`}
            >
              {plan.recommended && !isCurrent && (
                <div className="absolute top-0 inset-x-0 bg-gradient-to-r from-purple-500 to-indigo-500 h-1.5" />
              )}
              
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    plan.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                    plan.color === 'purple' ? 'bg-purple-50 text-purple-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <plan.icon size={24} />
                  </div>
                  {isCurrent && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider rounded-md">
                      Current Plan
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-gray-900">₹{price}</span>
                  <span className="text-sm text-gray-500 font-medium">/ month</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Billed {cycle.toLowerCase()} {cycle === 'ANNUAL' ? `(₹${price * 12 * term} for ${term} yr)` : ''}
                </p>

                <div className="mt-8 space-y-4">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Check size={16} className={`mt-0.5 shrink-0 ${isCurrent ? 'text-blue-500' : 'text-green-500'}`} />
                      <span className="text-sm text-gray-600 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-8 pt-0 mt-auto">
                <Button 
                  fullWidth 
                  variant={isCurrent ? 'secondary' : 'primary'}
                  className={isCurrent ? 'bg-gray-100 text-gray-500 cursor-default hover:bg-gray-100 font-medium' : 'font-medium'}
                  disabled={isCurrent}
                >
                  {isCurrent ? 'Active Plan' : cycle === 'ANNUAL' ? 'Upgrade & Save' : 'Upgrade'}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-12 text-center">
        <p className="text-sm text-gray-400">
           Prices are exclusive of taxes. Terms and conditions apply. 
           <br />
           Need help choosing? <button className="text-blue-600 hover:underline">Contact Sales</button>
        </p>
      </div>
    </div>
  );
};