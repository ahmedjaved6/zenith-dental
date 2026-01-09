import { Patient } from './types';

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: '1',
    name: 'Sarah Connor',
    phone: '(555) 123-4567',
    treatment: 'Root Canal',
    appointmentType: 'APPOINTMENT',
    scheduledTime: '09:00',
    status: 'IN_TREATMENT',
    arrivalTime: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    waitTimeMinutes: 15
  },
  {
    id: '2',
    name: 'John Wick',
    phone: '(555) 987-6543',
    treatment: 'General Check-up',
    appointmentType: 'WALK_IN',
    status: 'IN_QUEUE',
    arrivalTime: new Date(Date.now() - 1000 * 60 * 45),
    waitTimeMinutes: 45
  },
  {
    id: '3',
    name: 'Ellen Ripley',
    phone: '(555) 555-5555',
    treatment: 'Scaling',
    appointmentType: 'APPOINTMENT',
    scheduledTime: '10:30',
    status: 'IN_QUEUE',
    arrivalTime: new Date(Date.now() - 1000 * 60 * 5),
    waitTimeMinutes: 5
  },
  {
    id: '4',
    name: 'Marty McFly',
    phone: '(555) 888-8888',
    treatment: 'Extraction',
    appointmentType: 'APPOINTMENT',
    scheduledTime: '14:00',
    status: 'BOOKED',
    waitTimeMinutes: 0
  }
];