import { useState } from 'react';
import type { ApplicationResponse, CapabilityResponse } from '../types';
import { ApplicationsList } from '../components/admin/ApplicationsList';
import { ApplicationForm } from '../components/admin/ApplicationForm';
import { CapabilitiesList } from '../components/admin/CapabilitiesList';
import { CapabilityForm } from '../components/admin/CapabilityForm';

type View =
  | { type: 'list' }
  | { type: 'app-form'; application?: ApplicationResponse }
  | { type: 'capabilities'; application: ApplicationResponse }
  | { type: 'cap-form'; application: ApplicationResponse; capability?: CapabilityResponse };

export function AdminPage() {
  const [view, setView] = useState<View>({ type: 'list' });

  const handleEditApp = (app: ApplicationResponse) => {
    setView({ type: 'app-form', application: app });
  };

  const handleManageCapabilities = (app: ApplicationResponse) => {
    setView({ type: 'capabilities', application: app });
  };

  const handleEditCapability = (cap: CapabilityResponse, app: ApplicationResponse) => {
    setView({ type: 'cap-form', application: app, capability: cap });
  };

  const handleCreateCapability = (app: ApplicationResponse) => {
    setView({ type: 'cap-form', application: app });
  };

  const renderContent = () => {
    switch (view.type) {
      case 'list':
        return (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2>Applications</h2>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setView({ type: 'app-form' })}
              >
                Add Application
              </button>
            </div>
            <ApplicationsList
              onEdit={handleEditApp}
              onManageCapabilities={handleManageCapabilities}
            />
          </>
        );

      case 'app-form':
        return (
          <ApplicationForm
            application={view.application}
            onSave={() => setView({ type: 'list' })}
            onCancel={() => setView({ type: 'list' })}
          />
        );

      case 'capabilities':
        return (
          <CapabilitiesList
            application={view.application}
            onEdit={cap => handleEditCapability(cap, view.application)}
            onCreate={() => handleCreateCapability(view.application)}
            onBack={() => setView({ type: 'list' })}
          />
        );

      case 'cap-form':
        return (
          <CapabilityForm
            application={view.application}
            capability={view.capability}
            onSave={() => setView({ type: 'capabilities', application: view.application })}
            onCancel={() => setView({ type: 'capabilities', application: view.application })}
          />
        );
    }
  };

  return (
    <div className="container">
      <div className="admin-content">
        {renderContent()}
      </div>
    </div>
  );
}
