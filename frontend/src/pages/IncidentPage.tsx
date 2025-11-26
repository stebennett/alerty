import { useState, useEffect, useCallback } from 'react';
import type { Application, SelectionState, Severity } from '../types';
import { fetchTree, createIncident } from '../services/api';
import { ApplicationTree } from '../components/ApplicationTree';
import { IncidentForm } from '../components/IncidentForm';

export function IncidentPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selection, setSelection] = useState<SelectionState>({
    applications: new Set(),
    capabilities: new Set(),
  });

  // Build a map of capability ID to application for quick lookup
  const capToApp = new Map<number, Application>();
  applications.forEach(app => {
    app.capabilities.forEach(cap => {
      capToApp.set(cap.id, app);
    });
  });

  // Load tree data
  useEffect(() => {
    fetchTree()
      .then(setApplications)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Toggle application selection
  const handleToggleApp = useCallback((appId: number) => {
    setSelection(prev => {
      const app = applications.find(a => a.id === appId);
      if (!app) return prev;

      const newApps = new Set(prev.applications);
      const newCaps = new Set(prev.capabilities);

      const capIds = app.capabilities.map(c => c.id);
      const allCapsSelected = capIds.every(id => prev.capabilities.has(id));

      if (allCapsSelected && capIds.length > 0) {
        // Deselect all
        newApps.delete(appId);
        capIds.forEach(id => newCaps.delete(id));
      } else {
        // Select all
        newApps.add(appId);
        capIds.forEach(id => newCaps.add(id));
      }

      return { applications: newApps, capabilities: newCaps };
    });
  }, [applications]);

  // Toggle capability selection
  const handleToggleCapability = useCallback((capId: number) => {
    setSelection(prev => {
      const newCaps = new Set(prev.capabilities);
      const newApps = new Set(prev.applications);

      if (prev.capabilities.has(capId)) {
        newCaps.delete(capId);
      } else {
        newCaps.add(capId);
      }

      // Update application selection based on capability state
      const app = capToApp.get(capId);
      if (app) {
        const appCapIds = app.capabilities.map(c => c.id);
        const allSelected = appCapIds.every(id => newCaps.has(id));
        const noneSelected = appCapIds.every(id => !newCaps.has(id));

        if (allSelected) {
          newApps.add(app.id);
        } else if (noneSelected) {
          newApps.delete(app.id);
        }
        // For partial selection, we don't add/remove from apps set
        // The indeterminate state is handled by the component
      }

      return { applications: newApps, capabilities: newCaps };
    });
  }, [capToApp]);

  // Handle incident creation
  const handleCreateIncident = async (title: string, severity: Severity) => {
    return createIncident({
      title,
      severity,
      application_ids: Array.from(selection.applications),
      capability_ids: Array.from(selection.capabilities),
    });
  };

  const hasSelection = selection.applications.size > 0 || selection.capabilities.size > 0;

  if (loading) {
    return <div className="container"><div className="loading">Loading...</div></div>;
  }

  if (error) {
    return (
      <div className="container">
        <div className="alert alert-error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-layout">
        <ApplicationTree
          applications={applications}
          selection={selection}
          onToggleApp={handleToggleApp}
          onToggleCapability={handleToggleCapability}
        />
        <IncidentForm
          hasSelection={hasSelection}
          onSubmit={handleCreateIncident}
        />
      </div>
    </div>
  );
}
