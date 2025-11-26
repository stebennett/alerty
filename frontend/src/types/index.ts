// Capability in tree view
export interface Capability {
  id: number;
  name: string;
  description?: string;
}

// Application in tree view
export interface Application {
  id: number;
  name: string;
  description?: string;
  capabilities: Capability[];
}

// Selection state for checkboxes
export interface SelectionState {
  applications: Set<number>;
  capabilities: Set<number>;
}

// Severity levels
export type Severity = 'P1' | 'P2' | 'P3' | 'P4';

// Incident creation request
export interface IncidentCreate {
  title: string;
  severity: Severity;
  application_ids: number[];
  capability_ids: number[];
}

// Incident creation response
export interface IncidentResponse {
  status: 'ok' | 'error';
  grafana_incident_id?: string;
  grafana_incident_url?: string;
  message?: string;
}

// Admin types
export interface ApplicationCreate {
  name: string;
  description?: string;
  tags: string[];
}

export interface ApplicationUpdate {
  name?: string;
  description?: string;
  tags?: string[];
}

export interface ApplicationResponse {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  tags: string[];
}

export interface ApplicationWithCapabilities extends ApplicationResponse {
  capabilities: CapabilityResponse[];
}

export interface CapabilityCreate {
  application_id: number;
  name: string;
  description?: string;
  tags: string[];
}

export interface CapabilityUpdate {
  name?: string;
  description?: string;
  tags?: string[];
}

export interface CapabilityResponse {
  id: number;
  application_id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  tags: string[];
}
