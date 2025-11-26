import { useState, useEffect } from 'react';
import type { ApplicationResponse, CapabilityResponse } from '../../types';
import { fetchApplication, deleteCapability } from '../../services/api';

interface Props {
  application: ApplicationResponse;
  onEdit: (cap: CapabilityResponse) => void;
  onCreate: () => void;
  onBack: () => void;
}

export function CapabilitiesList({ application, onEdit, onCreate, onBack }: Props) {
  const [capabilities, setCapabilities] = useState<CapabilityResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCapabilities = async () => {
    try {
      setLoading(true);
      const app = await fetchApplication(application.id);
      setCapabilities(app.capabilities);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load capabilities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCapabilities();
  }, [application.id]);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete capability "${name}"?`)) {
      return;
    }

    try {
      await deleteCapability(id);
      await loadCapabilities();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete capability');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <button className="btn btn-secondary btn-sm" onClick={onBack}>
            &larr; Back
          </button>
          <span style={{ marginLeft: '1rem', fontWeight: 500 }}>
            Capabilities for: {application.name}
          </span>
        </div>
        <button className="btn btn-primary btn-sm" onClick={onCreate}>
          Add Capability
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Tags</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {capabilities.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ textAlign: 'center', color: '#666' }}>
                No capabilities yet. Add one to get started.
              </td>
            </tr>
          ) : (
            capabilities.map(cap => (
              <tr key={cap.id}>
                <td>{cap.name}</td>
                <td>{cap.description || '-'}</td>
                <td>
                  <div className="tags">
                    {cap.tags.map((tag, i) => (
                      <span key={i} className="tag">{tag}</span>
                    ))}
                  </div>
                </td>
                <td>
                  <div className="table-actions">
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => onEdit(cap)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(cap.id, cap.name)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
