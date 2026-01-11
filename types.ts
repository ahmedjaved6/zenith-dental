export type Role = 'DOCTOR' | 'ASSISTANT' | 'ADMIN' | null;

export type PatientStatus = 'BOOKED' | 'IN_QUEUE' | 'IN_TREATMENT' | 'COMPLETED' | 'CANCELLED';

export type DoctorStatus = 'READY' | 'ON_BREAK';

export type AppointmentType = 'WALK_IN' | 'APPOINTMENT';

export const TREATMENTS = [
  'General Check-up',
  'Scaling',
  'Filling',
  'Root Canal',
  'Extraction',
  'Crown',
  'Custom Treatment'
] as const;

export type Treatment = typeof TREATMENTS[number];

export interface Patient {
  id: string;
  name: string;
  phone: string;
  treatment: Treatment;
  appointmentType: AppointmentType;
  scheduledTime?: string; // HH:mm string for simplicity in mock
  status: PatientStatus;
  arrivalTime?: Date;
  waitTimeMinutes: number;
}

export type ViewState = 'LOGIN' | 'CLINIC_SETUP' | 'CREATE_CLINIC' | 'DASHBOARD' | 'CLINIC_DASHBOARD' | 'SUBSCRIPTION' | 'CALENDAR' | 'NO_CLINIC_ERROR' | 'ADMIN_LOGIN' | 'ADMIN_DASHBOARD' | 'ADMIN_CLINICS' | 'ADMIN_USERS' | 'UNAUTHORIZED';