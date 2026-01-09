import React from 'react';
import { 
  Building2, 
  Users, 
  TrendingUp,
  Activity,
  ArrowUpRight
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { ViewState } from '../../types';

interface AdminDashboardProps {
  onNavigate: (view: ViewState) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  // Mock Stats with Navigation Targets
  const stats = [
    { 
      label: 'Total Clinics', 
      value: '12', 
      sub: '10 Active', 
      icon: Building2, 
      color: 'bg-blue-500',
      target: 'ADMIN_CLINICS' as ViewState
    },
    { 
      label: 'Total Doctors', 
      value: '45', 
      sub: '+3 this week', 
      icon: Activity, 
      color: 'bg-green-500',
      target: 'ADMIN_USERS' as ViewState
    },
    { 
      label: 'Total Assistants', 
      value: '38', 
      sub: '92% Active', 
      icon: Users, 
      color: 'bg-purple-500',
      target: 'ADMIN_USERS' as ViewState
    },
    { 
      label: 'Patients Today', 
      value: '142', 
      sub: 'Across all clinics', 
      icon: TrendingUp, 
      color: 'bg-orange-500',
      target: null // Not clickable
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card 
            key={i} 
            padding="p-6" 
            onClick={stat.target ? () => onNavigate(stat.target!) : undefined}
            className={`relative overflow-hidden group transition-all duration-300 border-gray-100 ${
              stat.target 
                ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1 hover:border-gray-200' 
                : ''
            }`}
          >
            {/* Hover Indicator for clickable cards */}
            {stat.target && (
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400">
                <ArrowUpRight size={18} />
              </div>
            )}

            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-xl ${stat.color} bg-opacity-10 flex items-center justify-center text-${stat.color.replace('bg-', '')} group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon size={24} className={stat.color.replace('bg-', 'text-')} />
              </div>
              <span className="text-xs font-semibold bg-gray-100 px-2 py-1 rounded-full text-gray-500 group-hover:bg-gray-200 transition-colors">
                +12%
              </span>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-sm font-medium text-gray-500 group-hover:text-gray-700 transition-colors">{stat.label}</p>
              <p className="text-xs text-gray-400 mt-2 font-medium">{stat.sub}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Activity Table Mockup */}
      <section>
          <h3 className="text-lg font-bold text-gray-900 mb-4 px-1">Recent Clinic Activity</h3>
          <Card padding="p-0" className="overflow-hidden shadow-sm border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-semibold uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4">Clinic Name</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Patients (Today)</th>
                    <th className="px-6 py-4">Last Sync</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <tr key={item} className="hover:bg-blue-50/30 transition-colors group cursor-default">
                      <td className="px-6 py-4 font-medium text-gray-900 group-hover:text-blue-700 transition-colors">Apple Dental Studio {item}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{12 + item * 3}</td>
                      <td className="px-6 py-4 text-gray-400 font-mono">10:4{item} AM</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
      </section>
    </div>
  );
};