export type ProcedureType = 'lasik' | 'prk' | 'icl' | 'consultation';

export type LocationType = 'los_angeles' | 'guam';

export type AppointmentStatus = 'pending' | 'reviewing' | 'confirmed' | 'declined' | 'cancelled';

export interface AppointmentRequest {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  procedure_type: ProcedureType;
  location: LocationType;
  preferred_time_1: string | null;
  preferred_time_2: string | null;
  preferred_time_3: string | null;
  notes: string;
  status: AppointmentStatus;
  confirmed_time: string | null;
  staff_notes: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AppointmentRequestCreate {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  procedure_type: ProcedureType;
  location: LocationType;
  notes: string;
}

export interface AppointmentRequestUpdate {
  status?: AppointmentStatus;
  confirmed_time?: string;
  staff_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
}
