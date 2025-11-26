import type {
  Application,
  IncidentCreate,
  IncidentResponse,
  ApplicationCreate,
  ApplicationUpdate,
  ApplicationResponse,
  ApplicationWithCapabilities,
  CapabilityCreate,
  CapabilityUpdate,
  CapabilityResponse,
} from '../types';

const API_BASE = '/api';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || error.message || 'Request failed');
  }
  return response.json();
}

// Tree API
export async function fetchTree(): Promise<Application[]> {
  const response = await fetch(`${API_BASE}/tree`);
  return handleResponse<Application[]>(response);
}

// Incidents API
export async function createIncident(incident: IncidentCreate): Promise<IncidentResponse> {
  const response = await fetch(`${API_BASE}/incidents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(incident),
  });
  return handleResponse<IncidentResponse>(response);
}

// Admin - Applications API
export async function fetchApplications(): Promise<ApplicationResponse[]> {
  const response = await fetch(`${API_BASE}/admin/apps`);
  return handleResponse<ApplicationResponse[]>(response);
}

export async function fetchApplication(id: number): Promise<ApplicationWithCapabilities> {
  const response = await fetch(`${API_BASE}/admin/apps/${id}`);
  return handleResponse<ApplicationWithCapabilities>(response);
}

export async function createApplication(data: ApplicationCreate): Promise<ApplicationResponse> {
  const response = await fetch(`${API_BASE}/admin/apps`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<ApplicationResponse>(response);
}

export async function updateApplication(id: number, data: ApplicationUpdate): Promise<ApplicationResponse> {
  const response = await fetch(`${API_BASE}/admin/apps/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<ApplicationResponse>(response);
}

export async function deleteApplication(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/admin/apps/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete application');
  }
}

// Admin - Capabilities API
export async function fetchCapability(id: number): Promise<CapabilityResponse> {
  const response = await fetch(`${API_BASE}/admin/capabilities/${id}`);
  return handleResponse<CapabilityResponse>(response);
}

export async function createCapability(data: CapabilityCreate): Promise<CapabilityResponse> {
  const response = await fetch(`${API_BASE}/admin/capabilities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<CapabilityResponse>(response);
}

export async function updateCapability(id: number, data: CapabilityUpdate): Promise<CapabilityResponse> {
  const response = await fetch(`${API_BASE}/admin/capabilities/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<CapabilityResponse>(response);
}

export async function deleteCapability(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/admin/capabilities/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete capability');
  }
}
