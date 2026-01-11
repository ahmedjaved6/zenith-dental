import React from 'react';
import { PatientStatus } from '../../types';

interface BadgeProps {
  status: PatientStatus;
}

export const Badge: React.FC<BadgeProps> = ({ status }) => {
  const styles = {
    BOOKED: 'bg-blue-50 text-blue-600 border border-blue-100',
    IN_QUEUE: 'bg-orange-50 text-orange-600 border border-orange-100',
    IN_TREATMENT: 'bg-ios-blue text-white border border-blue-500 shadow-sm animate-pulse',
    COMPLETED: 'bg-green-50 text-green-600 border border-green-100',
    CANCELLED: 'bg-gray-100 text-gray-500 border border-gray-200',
  };

  const labels = {
    BOOKED: 'Booked',
    IN_QUEUE: 'Waiting',
    IN_TREATMENT: 'In Treatment',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};