export interface User {
  id: number;
  email: string;
  full_name: string;
}

export interface Service {
  id: number;
  name: string;
  description: string;
  status: 'operational' | 'degraded' | 'partial_outage' | 'major_outage' | 'maintenance';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Incident {
  id: number;
  title: string;
  description: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  type: 'incident' | 'maintenance';
  service_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export interface IncidentUpdate {
  id: number;
  incident_id: number;
  message: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  created_at: string;
}
