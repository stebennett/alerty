import { useState, useEffect } from 'react';
import type { ApplicationResponse } from '../../types';
import { fetchApplications, deleteApplication } from '../../services/api';

interface Props {
  onEdit: (app: ApplicationResponse) => void;
  onManageCapabilities: (app: ApplicationResponse) => void;
}

export function ApplicationsList({ onEdit, onManageCapabilities }: Props) {
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const apps = await fetchApplications();
      setApplications(apps);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete application "${name}" and all its capabilities?`)) {
      return;
    }

    try {
      await deleteApplication(id);
      await loadApplications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete application');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  return (
    <div>
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
          {applications.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ textAlign: 'center', color: '#666' }}>
                No applications yet. Create one to get started.
              </td>
            </tr>
          ) : (
            applications.map(app => (
              <tr key={app.id}>
                <td>{app.name}</td>
                <td>{app.description || '-'}</td>
                <td>
                  <div className="tags">
                    {app.tags.map((tag, i) => (
                      <span key={i} className="tag">{tag}</span>
                    ))}
                  </div>
                </td>
                <td>
                  <div className="table-actions">
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => onManageCapabilities(app)}
                    >
                      Capabilities
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => onEdit(app)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(app.id, app.name)}
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
