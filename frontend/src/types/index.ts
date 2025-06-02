export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'admin' | 'manager' | 'viewer';
  is_superuser?: boolean;
  organization_id?: number | null;
}

export interface Organization {
  id: number;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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
  service?: Service;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  updates?: IncidentUpdate[];
}

export interface IncidentUpdate {
  id: number;
  incident_id: number;
  message: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  created_at: string;
}

export interface Maintenance {
  id: number;
  title: string;
  description: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  scheduled_start: string;
  scheduled_end: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  service_id: number;
  service?: Service;
}

export interface TimelineEvent {
  type: 'incident' | 'maintenance' | 'service_status_change';
  id: number;
  title: string;
  description?: string;
  status: string;
  timestamp: string;
}

export interface StatusOverview {
  services: Service[];
  incidents: Incident[];
  maintenances: Maintenance[];
  timeline: TimelineEvent[];
}
